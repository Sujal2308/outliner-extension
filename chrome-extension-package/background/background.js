/**
 * Background Script for Outliner AI Chrome Extension
 * Enhanced with Gemini API integration for better summarization
 */

// Import summarizers with intelligent fallback system
try {
  importScripts("../utils/summarizer-t5.js");
  console.log("T5 summarizer imported successfully");
} catch (error) {
  console.warn("T5 summarizer not available:", error);
}

try {
  importScripts("../utils/summarizer.js");
  console.log("Local summarizer imported successfully");
} catch (error) {
  console.error("Failed to import local summarizer:", error);
}

class BackgroundService {
  constructor() {
    // Initialize summarizers in priority order
    this.t5Summarizer =
      typeof T5Summarizer !== "undefined" ? new T5Summarizer() : null;
    this.localSummarizer = new TextSummarizer();

    // API configuration (using v1beta with gemini-2.0-flash - fast and efficient)
    this.GEMINI_API_URL =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    this.apiKey = null;
    this.apiKeyLoaded = false;

    // Load API key first, then setup listeners
    this.loadApiKey().then(() => {
      this.setupMessageListener();
      this.setupInstallListener();
    });
  }

  async loadApiKey() {
    try {
      const result = await chrome.storage.sync.get("geminiApiKey");
      this.apiKey = result.geminiApiKey;
      this.apiKeyLoaded = true;
      console.log("API key loaded:", this.apiKey ? "✓ Present" : "✗ Missing");
    } catch (error) {
      console.error("Failed to load API key:", error);
      this.apiKeyLoaded = true; // Mark as loaded even on error to prevent blocking
    }
  }

  async saveApiKey(apiKey) {
    try {
      if (!apiKey || apiKey.trim() === "") {
        // Remove the API key if empty
        await chrome.storage.sync.remove("geminiApiKey");
        this.apiKey = null;
        console.log("✓ API key removed successfully");
        return { success: true, message: "API key removed" };
      } else {
        // Validate API key format
        const trimmedKey = apiKey.trim();
        if (!trimmedKey.startsWith("AIza")) {
          throw new Error("Invalid API key format");
        }

        // Save the API key
        await chrome.storage.sync.set({ geminiApiKey: trimmedKey });
        this.apiKey = trimmedKey;
        console.log("✓ API key saved successfully to background service");
        return { success: true, message: "API key saved" };
      }
    } catch (error) {
      console.error("✗ Failed to save API key in background:", error);
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
      // Ensure API key is loaded before processing
      if (!this.apiKeyLoaded) {
        console.log("Waiting for API key to load...");
        await this.loadApiKey();
      }

      const { content, title, mode, wordCount } = data;

      // Validate input
      if (!content || content.trim().length < 50) {
        throw new Error("Content is too short to summarize");
      }

      // Intelligent summarization with priority:
      // 1. Gemini API (if API key available - BEST QUALITY)
      // 2. Local fallback (basic extraction)

      let summary;
      let method = "local";

      // PRIORITY: Use Gemini API if API key is configured
      if (this.apiKey) {
        try {
          console.log("🚀 Using Gemini API for AI-powered summarization...");
          summary = await this.summarizeWithGemini(content, title, mode);
          method = "gemini-api";
          console.log("✅ Gemini API summarization successful!");
        } catch (apiError) {
          console.error("❌ Gemini API failed:", apiError.message);
          console.warn("Falling back to basic local summarization");
          summary = await this.summarizeLocally(
            content,
            title,
            mode,
            wordCount
          );
          method = "local-fallback";
        }
      } else {
        // No API key - use local summarization
        console.warn(
          "⚠️ No Gemini API key configured. Using basic local summarization."
        );
        console.log(
          "💡 Add your API key in Settings for AI-powered summaries!"
        );
        summary = await this.summarizeLocally(content, title, mode, wordCount);
        method = "local";
      }

      const duration = Date.now() - startTime;
      console.log(`Summarization completed in ${duration}ms using ${method}`);

      return {
        summary,
        metadata: {
          mode,
          title: title || "Untitled",
          url: data.url || "",
          timestamp: new Date().toISOString(),
          processingTime: duration,
          method: method,
          wordCount: wordCount,
        },
      };
    } catch (error) {
      console.error("Summarization error:", error);
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }

  async summarizeWithGemini(content, title, mode) {
    console.log("📡 Starting Gemini API call...");
    console.log("Mode:", mode);
    console.log("API Key present:", !!this.apiKey);
    console.log("Content length:", content.length);

    if (!this.apiKey) {
      throw new Error("API key not configured");
    }

    // Prepare and clean content
    let processedContent = content
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/\n\s*\n/g, "\n") // Remove extra line breaks
      .trim();

    // Truncate if too long for API
    if (processedContent.length > 30000) {
      processedContent = processedContent.substring(0, 25000) + "...";
      console.log("⚠️ Content truncated to 25000 characters for API");
    }

    console.log(
      "📝 Processed content length:",
      processedContent.length,
      "characters"
    );

    // Create mode-specific prompts with better instructions
    const prompts = {
      brief: `I need you to read and understand the following article/content, then write a BRIEF SUMMARY in 2-3 sentences ONLY.

IMPORTANT RULES:
✓ Write in YOUR OWN WORDS - do NOT copy-paste sentences
✓ Capture the MAIN IDEA and KEY TAKEAWAYS
✓ Be CLEAR and EASY to understand
✓ Maximum 2-3 sentences ONLY
✓ Focus on WHAT the content is about and WHY it matters

Content:
${processedContent}

Brief Summary (2-3 sentences):`,

      detailed: `I need you to read and deeply understand the following content, then write a COMPREHENSIVE SUMMARY in multiple well-organized paragraphs.

IMPORTANT RULES:
✓ Write ENTIRELY in YOUR OWN WORDS (no copy-pasting)
✓ Create 5-7 clear, well-structured paragraphs
✓ Each paragraph should cover a different aspect or theme
✓ Explain the concepts as if teaching someone who hasn't read the original
✓ Include all major points, arguments, and insights
✓ Use proper paragraph structure with logical flow

Content:
${processedContent}

Comprehensive Summary (5-7 paragraphs):`,

      bullets: `I need you to analyze the following content and extract 5-7 KEY POINTS as bullet points.

IMPORTANT RULES:
✓ Start EVERY line with • symbol
✓ Write in YOUR OWN WORDS (no copy-pasting)
✓ Each bullet = ONE important insight/fact/takeaway
✓ Be CLEAR, CONCISE, and INFORMATIVE
✓ Make each bullet STANDALONE (can be understood independently)
✓ Total 5-7 bullets ONLY

Content:
${processedContent}

Key Points (start each with •):`,
    };

    const prompt = prompts[mode] || prompts.detailed;

    try {
      console.log("🌐 Sending request to Gemini API...");
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
              temperature:
                mode === "brief" ? 0.5 : mode === "bullets" ? 0.6 : 0.7, // Brief needs more focus, detailed more creativity
              topK: 40,
              topP: 0.95,
              maxOutputTokens:
                mode === "brief"
                  ? 250
                  : mode === "bullets"
                  ? 600
                  : mode === "detailed"
                  ? 1000
                  : 500,
            },
          }),
        }
      );

      console.log("📥 Response received. Status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ API Error:", errorData);
        throw new Error(
          `API request failed: ${response.status} - ${
            errorData.error?.message || "Unknown error"
          }`
        );
      }

      const data = await response.json();
      console.log("✅ API response parsed successfully");

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

  async summarizeWithT5(content, title, mode) {
    if (!this.t5Summarizer) {
      throw new Error("T5 summarizer not available");
    }

    try {
      // Prepare content for T5 processing
      let processedContent = content;

      // T5 has input length limitations, so we need to truncate intelligently
      if (content.length > 2000) {
        // Take the most important parts: beginning and key sections
        const beginning = content.substring(0, 1000);
        const ending = content.substring(content.length - 500);
        processedContent = beginning + "... " + ending;
      }

      // Use T5 with mode-specific configuration
      const options = {
        mode: mode,
        maxLength: this.getT5MaxLength(mode),
        temperature: 0.3, // Conservative for factual accuracy
      };

      const result = await this.t5Summarizer.summarize(
        processedContent,
        options
      );

      // Validate T5 output quality
      if (!result.summary || result.summary.length < 20) {
        throw new Error("T5 produced insufficient summary");
      }

      if (result.confidence && result.confidence < 0.6) {
        throw new Error("T5 confidence too low");
      }

      return result;
    } catch (error) {
      console.error("T5 summarization error:", error);
      throw error;
    }
  }

  getT5MaxLength(mode) {
    switch (mode) {
      case "brief":
        return 80;
      case "detailed":
        return 180;
      case "bullets":
        return 120;
      default:
        return 100;
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
