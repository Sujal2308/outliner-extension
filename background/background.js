class BackgroundService {
  constructor() {
    this.GEMINI_API_URL =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
    this.apiKey = null;
    this.setupMessageListener();
    this.loadApiKey();
  }

  async loadApiKey() {
    try {
      const result = await chrome.storage.sync.get("geminiApiKey");
      this.apiKey = result.geminiApiKey;
      console.log("API key loaded:", this.apiKey ? "Present" : "Missing");
    } catch (error) {
      console.error("Failed to load API key:", error);
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "generateSummary") {
        this.handleSummarization(message.data)
          .then((result) => sendResponse({ success: true, data: result }))
          .catch((error) =>
            sendResponse({ success: false, error: error.message })
          );
        return true;
      }

      if (message.action === "saveApiKey") {
        this.apiKey = message.apiKey;
        chrome.storage.sync
          .set({ geminiApiKey: message.apiKey })
          .then(() => sendResponse({ success: true }))
          .catch((error) =>
            sendResponse({ success: false, error: error.message })
          );
        return true;
      }
    });
  }

  async handleSummarization(data) {
    const startTime = Date.now();

    try {
      const { content, title, mode, wordCount } = data;

      if (!content || content.trim().length < 50) {
        throw new Error("Content is too short to summarize");
      }

      if (!this.apiKey) {
        throw new Error(
          "Gemini API key not configured. Please add your API key in settings."
        );
      }

      console.log(`Generating ${mode} summary...`);
      const summary = await this.summarizeWithGemini(content, title, mode);

      const duration = Date.now() - startTime;
      console.log(`Summary generated in ${duration}ms`);

      return {
        summary,
        metadata: {
          mode,
          title,
          wordCount,
          processingTime: duration,
          method: "gemini-api",
        },
      };
    } catch (error) {
      console.error("Summarization error:", error);
      throw error;
    }
  }

  async summarizeWithGemini(content, title, mode) {
    let processedContent = content;
    if (content.length > 30000) {
      processedContent = content.substring(0, 30000) + "...";
    }

    const prompts = {
      brief: `Summarize the following webpage content in 2-3 concise sentences that capture the main idea:\n\nTitle: ${title}\n\nContent: ${processedContent}`,
      bullet: `Extract the 5-7 most important key points from this webpage and format them as bullet points (use  symbol):\n\nTitle: ${title}\n\nContent: ${processedContent}`,
      comprehensive: `Create a comprehensive, well-structured summary of this webpage in 5-7 paragraphs, covering all key points and important details:\n\nTitle: ${title}\n\nContent: ${processedContent}`,
    };

    const prompt = prompts[mode] || prompts.brief;

    try {
      const response = await fetch(
        `${this.GEMINI_API_URL}?key=${this.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.4,
              topK: 40,
              topP: 0.95,
              maxOutputTokens:
                mode === "brief" ? 150 : mode === "bullet" ? 400 : 600,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error("API quota exceeded. Please try again later.");
        } else if (response.status === 401) {
          throw new Error("Invalid API key. Please check your Gemini API key.");
        } else {
          throw new Error(
            `API error (${response.status}): ${
              errorData.error?.message || "Unknown error"
            }`
          );
        }
      }

      const data = await response.json();
      if (!data.candidates?.[0]?.content) {
        throw new Error("Invalid API response format");
      }

      let summary = data.candidates[0].content.parts[0].text.trim();

      if (mode === "bullet" && !summary.includes("")) {
        summary = summary
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => ` ${line.replace(/^[-*]\s*/, "")}`)
          .join("\n");
      }

      return summary;
    } catch (error) {
      console.error("Gemini API error:", error);
      throw error;
    }
  }
}

const backgroundService = new BackgroundService();
