// Popup Controller
class PopupController {
  constructor() {
    this.selectedMode = "brief";
    this.init();
  }

  init() {
    // Get elements
    this.modeButtons = document.querySelectorAll(".mode-btn");
    this.summarizeBtn = document.getElementById("summarizeBtn");
    this.loader = document.getElementById("loader");
    this.loaderText = document.getElementById("loaderText");
    this.resultArea = document.getElementById("resultArea");
    this.resultContent = document.getElementById("resultContent");
    this.copyBtn = document.getElementById("copyBtn");
    this.resetBtn = document.getElementById("resetBtn");
    this.settingsBtn = document.getElementById("settingsBtn");
    this.apiSettings = document.getElementById("apiSettings");
    this.apiKeyInput = document.getElementById("apiKeyInput");
    this.saveApiBtn = document.getElementById("saveApiBtn");
    this.removeApiBtn = document.getElementById("removeApiBtn");
    this.apiStatus = document.getElementById("apiStatus");

    // Attach event listeners
    this.attachListeners();

    // Load saved API key
    this.loadApiKey();
  }

  attachListeners() {
    // Mode selection
    this.modeButtons.forEach((btn) => {
      btn.addEventListener("click", () => this.selectMode(btn));
    });

    // Summarize button
    this.summarizeBtn.addEventListener("click", () => this.summarize());

    // Copy button
    this.copyBtn.addEventListener("click", () => this.copyToClipboard());

    // Reset button
    this.resetBtn.addEventListener("click", () => this.reset());

    // Settings toggle
    this.settingsBtn.addEventListener("click", () => this.toggleSettings());

    // Save API key
    this.saveApiBtn.addEventListener("click", () => this.saveApiKey());
    if (this.removeApiBtn)
      this.removeApiBtn.addEventListener("click", () => this.removeApiKey());
  }

  selectMode(button) {
    this.modeButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    this.selectedMode = button.dataset.mode;
  }

  async summarize() {
    try {
      // Show loader
      this.loader.classList.add("show");
      this.resultArea.classList.remove("show");
      this.loaderText.textContent = "Extracting content...";

      // Get current tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      // Extract content directly using executeScript
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Extract main content from page
          const getMainContent = () => {
            const selectors = [
              "article",
              "main",
              '[role="main"]',
              ".post-content",
              ".article-content",
              ".entry-content",
              ".content",
              "#content",
              ".main-content",
            ];

            for (const selector of selectors) {
              const element = document.querySelector(selector);
              if (element && element.textContent.trim().length > 100) {
                return element;
              }
            }
            return document.body;
          };

          const mainElement = getMainContent();
          const content = mainElement.textContent
            .replace(/\s+/g, " ")
            .replace(/[\r\n]+/g, " ")
            .trim();

          return {
            content: content.substring(0, 30000),
            title: document.title,
          };
        },
      });

      if (!result || !result.result) {
        throw new Error("Failed to extract content from page");
      }

      const { content, title } = result.result;

      if (!content || content.length < 100) {
        throw new Error(
          "Content too short to summarize. Page must have at least 100 words."
        );
      }

      this.loaderText.textContent = "Generating summary...";

      // Send to background for summarization
      const summaryResponse = await chrome.runtime.sendMessage({
        action: "generateSummary",
        data: {
          content,
          title,
          mode: this.selectedMode,
          wordCount: content.split(/\s+/).length,
        },
      });

      if (!summaryResponse.success) {
        throw new Error(summaryResponse.error || "Summarization failed");
      }

      // Display result
      this.displayResult(summaryResponse.data);
    } catch (error) {
      console.error("Summarization error:", error);
      this.showError(error.message);
    } finally {
      this.loader.classList.remove("show");
    }
  }

  extractPageContent() {
    // Extract main content from page
    const getMainContent = () => {
      const selectors = [
        "article",
        "main",
        '[role="main"]',
        ".post-content",
        ".article-content",
        ".entry-content",
        ".content",
        "#content",
        ".main-content",
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim().length > 100) {
          return element;
        }
      }
      return document.body;
    };

    const mainElement = getMainContent();
    const content = mainElement.textContent
      .replace(/\s+/g, " ")
      .replace(/[\r\n]+/g, " ")
      .trim();

    return {
      content: content.substring(0, 30000),
      title: document.title,
    };
  }

  displayResult(data) {
    const { summary, mode } = data;

    // Format summary based on mode
    let formattedSummary = summary;
    if (mode === "bullet" && !summary.includes("")) {
      // Add bullet points if not already formatted
      const lines = summary.split("\n").filter((line) => line.trim());
      formattedSummary = lines.map((line) => ` ${line.trim()}`).join("\n");
    }

    this.resultContent.innerHTML = formattedSummary.replace(/\n/g, "<br>");
    this.resultArea.classList.add("show");
    this.currentSummary = formattedSummary;
  }

  showError(message) {
    this.resultContent.innerHTML = `<div style="color: #dc3545; font-weight: 600;"> Error:</div><div style="margin-top: 8px;">${message}</div>`;
    this.resultArea.classList.add("show");
  }

  copyToClipboard() {
    if (this.currentSummary) {
      navigator.clipboard.writeText(this.currentSummary);
      this.copyBtn.textContent = " Copied!";
      setTimeout(() => {
        this.copyBtn.textContent = " Copy";
      }, 2000);
    }
  }

  reset() {
    this.resultArea.classList.remove("show");
    this.loader.classList.remove("show");
    this.currentSummary = null;
  }

  toggleSettings() {
    this.apiSettings.classList.toggle("show");
  }

  async loadApiKey() {
    try {
      const result = await chrome.storage.sync.get("geminiApiKey");
      if (result.geminiApiKey) {
        this.apiKeyInput.value = result.geminiApiKey;
        // Show API status and remove button
        this.showApiSavedState();
      } else {
        this.showApiEmptyState();
      }
    } catch (error) {
      console.error("Failed to load API key:", error);
    }
  }

  async saveApiKey() {
    const apiKey = this.apiKeyInput.value.trim();

    if (!apiKey) {
      alert("Please enter an API key");
      return;
    }

    if (!apiKey.startsWith("AIza") || apiKey.length < 30) {
      alert(
        'Invalid API key format. Key should start with "AIza" and be at least 30 characters.'
      );
      return;
    }

    try {
      await chrome.storage.sync.set({ geminiApiKey: apiKey });

      // Notify background script
      await chrome.runtime.sendMessage({
        action: "saveApiKey",
        apiKey: apiKey,
      });

      // Update UI to saved state
      this.showApiSavedState();
      this.apiSettings.classList.remove("show");
    } catch (error) {
      console.error("Failed to save API key:", error);
      alert("Failed to save API key. Please try again.");
    }
  }

  async removeApiKey() {
    try {
      await chrome.storage.sync.remove("geminiApiKey");
      await chrome.runtime.sendMessage({ action: "saveApiKey", apiKey: "" });
      this.apiKeyInput.value = "";
      this.showApiEmptyState();
    } catch (error) {
      console.error("Failed to remove API key:", error);
      alert("Failed to remove API key. Please try again.");
    }
  }

  showApiSavedState() {
    if (this.apiStatus) {
      this.apiStatus.style.display = "flex";
      this.apiStatus.innerHTML = `<span class="tick">✓</span><span>API key saved</span>`;
    }
    if (this.saveApiBtn) this.saveApiBtn.style.display = "none";
    if (this.removeApiBtn) this.removeApiBtn.style.display = "inline-block";
  }

  showApiEmptyState() {
    if (this.apiStatus) {
      this.apiStatus.style.display = "none";
      this.apiStatus.innerHTML = "";
    }
    if (this.saveApiBtn) this.saveApiBtn.style.display = "inline-block";
    if (this.removeApiBtn) this.removeApiBtn.style.display = "none";
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new PopupController();
});
