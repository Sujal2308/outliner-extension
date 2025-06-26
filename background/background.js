/**
 * Background Script for Outliner AI Chrome Extension
 * Enhanced with Gemini API integration for better summarization
 */

// Import the local summarizer as fallback
try {
  importScripts("../utils/summarizer.js");
  console.log("Local summarizer imported successfully");
} catch (error) {
  console.error("Failed to import local summarizer:", error);
}

class BackgroundService {
  constructor() {
    this.localSummarizer = new TextSummarizer();
    this.setupMessageListener();
    this.setupInstallListener();

    // API configuration
    this.GEMINI_API_URL =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
    this.apiKey = null;
    this.loadApiKey();
  }

  async loadApiKey() {
    try {
      const result = await chrome.storage.sync.get("geminiApiKey");
      this.apiKey = result.geminiApiKey;
      console.log("API key loaded:", this.apiKey ? "✓ Present" : "✗ Missing");
    } catch (error) {
      console.error("Failed to load API key:", error);
    }
  }

  async saveApiKey(apiKey) {
    try {
      if (!apiKey || apiKey.trim() === "") {
        // Remove the API key if empty
        await chrome.storage.sync.remove("geminiApiKey");
        this.apiKey = null;
        console.log("API key removed successfully");
      } else {
        // Save the API key
        await chrome.storage.sync.set({ geminiApiKey: apiKey.trim() });
        this.apiKey = apiKey.trim();
        console.log("API key saved successfully");
      }
    } catch (error) {
      console.error("Failed to save API key:", error);
      throw error;
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log("Background received message:", message);

      if (message.action === "generateSummary") {
        console.log("Processing generateSummary request");
        this.handleSummarization(message.data)
          .then((result) => {
            console.log("Summarization successful, sending response");
            sendResponse({ success: true, data: result });
          })
          .catch((error) => {
            console.error("Summarization failed:", error);
            sendResponse({ success: false, error: error.message });
          });
        return true; // Indicates async response
      }

      if (message.action === "saveApiKey") {
        this.saveApiKey(message.apiKey)
          .then(() => {
            sendResponse({ success: true });
          })
          .catch((error) => {
            sendResponse({ success: false, error: error.message });
          });
        return true;
      }

      if (message.action === "getApiKeyStatus") {
        sendResponse({
          success: true,
          hasApiKey: !!this.apiKey,
          usingLocal: !this.apiKey,
        });
        return false;
      }

      // Always send a response to prevent channel closure
      sendResponse({ success: false, error: "Unknown action" });
      return false;
    });
  }

  setupInstallListener() {
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === "install") {
        this.handleFirstInstall();
      } else if (details.reason === "update") {
        this.handleUpdate(details.previousVersion);
      }
    });
  }

  async handleSummarization(data) {
    const startTime = Date.now();

    try {
      const { content, title, mode, wordCount } = data;

      // Validate input
      if (!content || content.trim().length < 50) {
        throw new Error("Content is too short to summarize");
      }

      // Try Gemini API first if available, fallback to local
      let summary;
      let usedApi = false;

      if (this.apiKey) {
        try {
          console.log("Attempting Gemini API summarization...");
          summary = await this.summarizeWithGemini(content, title, mode);
          usedApi = true;
          console.log("Gemini API summarization successful");
        } catch (apiError) {
          console.warn(
            "Gemini API failed, falling back to local:",
            apiError.message
          );
          summary = await this.summarizeLocally(
            content,
            title,
            mode,
            wordCount
          );
        }
      } else {
        console.log("No API key, using local summarization");
        summary = await this.summarizeLocally(content, title, mode, wordCount);
      }

      const duration = Date.now() - startTime;
      console.log(
        `Summarization completed in ${duration}ms using ${
          usedApi ? "Gemini API" : "local processing"
        }`
      );

      return {
        summary,
        metadata: {
          mode,
          title: title || "Untitled",
          url: data.url || "",
          timestamp: new Date().toISOString(),
          processingTime: duration,
          method: usedApi ? "gemini-api" : "local",
          wordCount: wordCount,
        },
      };
    } catch (error) {
      console.error("Summarization error:", error);
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }

  async summarizeWithGemini(content, title, mode) {
    if (!this.apiKey) {
      throw new Error("API key not configured");
    }

    // Prepare content (truncate if too long for API)
    let processedContent = content;
    if (content.length > 30000) {
      // Take first 25000 characters for API efficiency
      processedContent = content.substring(0, 25000) + "...";
    }

    // Create mode-specific prompts
    const prompts = {
      brief: `Summarize the following content in 1-2 concise sentences that capture the main point:\n\n${processedContent}`,
      detailed: `Create a comprehensive summary of the following content in 4-6 sentences, covering the key points and important details:\n\n${processedContent}`,
      bullets: `Extract the key points from the following content and format them as 4-6 bullet points:\n\n${processedContent}`,
    };

    const prompt = prompts[mode] || prompts.detailed;

    try {
      const response = await fetch(
        `${this.GEMINI_API_URL}?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              topK: 40,
              topP: 0.95,
              maxOutputTokens:
                mode === "brief" ? 100 : mode === "bullets" ? 300 : 200,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API request failed: ${response.status} - ${
            errorData.error?.message || "Unknown error"
          }`
        );
      }

      const data = await response.json();

      if (
        !data.candidates ||
        !data.candidates[0] ||
        !data.candidates[0].content
      ) {
        throw new Error("Invalid API response format");
      }

      let summary = data.candidates[0].content.parts[0].text.trim();

      // Format bullets mode properly
      if (
        mode === "bullets" &&
        !summary.includes("•") &&
        !summary.includes("-")
      ) {
        summary = summary
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => `• ${line.trim()}`)
          .join("\n");
      }

      return summary;
    } catch (error) {
      console.error("Gemini API error:", error);
      throw error;
    }
  }

  async summarizeLocally(content, title, mode, wordCount) {
    // Handle very long content by intelligent truncation
    let processedContent = content;
    let actualWordCount = wordCount;

    if (wordCount > 25000) {
      // For extremely long content, take the first and last portions
      const words = content.split(/\s+/);
      const firstPortion = words.slice(0, 15000).join(" ");
      const lastPortion = words.slice(-5000).join(" ");
      processedContent = firstPortion + " ... " + lastPortion;
      actualWordCount = 20000;
      console.log(
        `Content truncated from ${wordCount} to ${actualWordCount} words`
      );
    } else if (wordCount > 20000) {
      // For very long content, take first 20k words
      const words = content.split(/\s+/);
      processedContent = words.slice(0, 20000).join(" ");
      actualWordCount = 20000;
      console.log(
        `Content truncated from ${wordCount} to ${actualWordCount} words`
      );
    }

    // Use local summarizer
    return await this.localSummarizer.generateSummary(processedContent, mode, {
      title,
      originalWordCount: actualWordCount,
    });
  }

  handleFirstInstall() {
    // Set default settings
    chrome.storage.sync.set({
      defaultMode: "brief",
      maxWordCount: 25000,
      autoSummarize: false,
      theme: "light",
    });

    // Show welcome page (optional)
    chrome.tabs.create({
      url: chrome.runtime.getURL("welcome.html"),
    });
  }

  handleUpdate(previousVersion) {
    console.log(
      `Extension updated from ${previousVersion} to ${
        chrome.runtime.getManifest().version
      }`
    );

    // Handle any migration logic here if needed
    if (this.needsMigration(previousVersion)) {
      this.migrateSettings(previousVersion);
    }
  }

  needsMigration(previousVersion) {
    // Add version-specific migration logic
    const [major, minor, patch] = previousVersion.split(".").map(Number);
    return major < 1; // Example: migrate anything before v1.0.0
  }

  async migrateSettings(previousVersion) {
    try {
      const settings = await chrome.storage.sync.get();
      // Add migration logic here
      console.log("Settings migrated successfully");
    } catch (error) {
      console.error("Settings migration failed:", error);
    }
  }
}

// Initialize background service
const backgroundService = new BackgroundService();
