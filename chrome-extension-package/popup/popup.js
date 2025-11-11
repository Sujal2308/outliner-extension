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
    this.contentEl = document.querySelector(".content");
    this.saveApiBtn = document.getElementById("saveApiBtn");
    this.removeApiBtn = document.getElementById("removeApiBtn");
    this.apiStatus = document.getElementById("apiStatus");
    this.miniToast = document.getElementById("miniToast");
    this.statusText = document.getElementById("statusText");
    this._statusTimeout = null;

    // Attach event listeners
    this.attachListeners();

    // Load saved API key
    this.loadApiKey();
    // Load and apply theme preference
    this.loadTheme();
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

    // Make the Summary Mode heading clickable to jump to the summary area
    try {
      const sectionTitle = document.querySelector(".section-title");
      if (sectionTitle) {
        sectionTitle.style.cursor = "pointer";
        sectionTitle.setAttribute("role", "button");
        sectionTitle.setAttribute("tabindex", "0");
        sectionTitle.setAttribute("aria-label", "Jump to summary section");
        sectionTitle.addEventListener("click", () => {
          const target =
            this.resultArea && this.resultArea.classList.contains("show")
              ? this.resultArea
              : this.summarizeBtn;
          try {
            target.scrollIntoView({ behavior: "smooth", block: "center" });
            if (target === this.summarizeBtn) this.summarizeBtn.focus();
          } catch (e) {
            // ignore
          }
        });
        // also support keyboard activation
        sectionTitle.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            sectionTitle.click();
          }
        });
      }
    } catch (e) {
      // ignore if DOM isn't ready yet
    }

    // Save API key
    this.saveApiBtn.addEventListener("click", () => this.saveApiKey());
    if (this.removeApiBtn)
      this.removeApiBtn.addEventListener("click", () => this.removeApiKey());
  }

  selectMode(button) {
    this.modeButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    this.selectedMode = button.dataset.mode;
    // Human-friendly label
    const modeLabel =
      {
        brief: "Brief",
        bullets: "Bullet",
        bullet: "Bullet",
        detailed: "Comprehensive",
        comprehensive: "Comprehensive",
        detailed: "Comprehensive",
      }[this.selectedMode] || this.selectedMode;
    this.updateStatus(`${modeLabel} mode selected`);
  }

  async summarize() {
    try {
      // Ensure API key is configured before attempting to summarize
      try {
        const keyResult = await chrome.storage.sync.get("geminiApiKey");
        if (!keyResult.geminiApiKey) {
          // Open API settings and show instructive dynamic message
          if (!this.apiSettings.classList.contains("show")) {
            this.apiSettings.classList.add("show");
            // small delay to allow expansion
            setTimeout(() => {
              try {
                if (this.apiKeyInput) this.apiKeyInput.focus();
                this.apiSettings.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              } catch (e) {}
            }, 120);
          }
          this.updateStatus("Please set up your API key first", 5000);
          return;
        }
      } catch (err) {
        // ignore storage errors and proceed
        console.warn("Failed to read API key from storage:", err);
      }

      // Show loader
      this.loader.classList.add("show");
      this.resultArea.classList.remove("show");
      this.loaderText.textContent = "Extracting content...";

      // Scroll down partially to show the loader (not all the way to bottom)
      setTimeout(() => {
        try {
          this.loader.scrollIntoView({ behavior: "smooth", block: "center" });
        } catch (e) {
          // ignore
        }
      }, 100);

      // Get current tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      // First, ensure content script is injected
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content/content.js"],
        });
        console.log("Content script injected");
      } catch (injectError) {
        console.log(
          "Content script already injected or injection failed:",
          injectError.message
        );
      }

      // Small delay to ensure script is loaded
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Try to use content script first
      let content, title;
      try {
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: "extractContent",
        });

        if (response && response.success) {
          content = response.data.content;
          title = response.data.title;
          console.log("Content extracted via content script");
        } else {
          throw new Error("Content script response failed");
        }
      } catch (contentScriptError) {
        console.warn(
          "Content script failed, using inline extraction:",
          contentScriptError.message
        );
        // Fallback: Extract content directly using executeScript
        const [result] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            // Extract main content from page, excluding ads and navigation
            const getMainContent = () => {
              // Remove ads, navigation, and other clutter before extraction
              const excludeSelectors = [
                "aside",
                "nav",
                "header",
                "footer",
                '[class*="ad"]',
                '[id*="ad"]',
                '[class*="banner"]',
                '[class*="sidebar"]',
                '[class*="widget"]',
                '[class*="advertisement"]',
                '[id*="advertisement"]',
                '[class*="promo"]',
                '[id*="promo"]',
                '[class*="sponsor"]',
                '[id*="sponsor"]',
                "iframe",
                "script",
                "style",
                "noscript",
                '[role="complementary"]',
                '[role="navigation"]',
                '[class*="cookie"]',
                '[id*="cookie"]',
                '[class*="popup"]',
                '[class*="modal"]',
                '[class*="newsletter"]',
                '[class*="subscription"]',
                ".related-posts",
                ".comments",
                ".comment-section",
              ];

              // Priority selectors for main content
              const contentSelectors = [
                "article",
                "main",
                '[role="main"]',
                ".post-content",
                ".article-content",
                ".entry-content",
                ".content",
                "#content",
                ".main-content",
                '[itemprop="articleBody"]',
                ".post-body",
                ".article-body",
              ];

              // Find the main content container
              let mainElement = null;
              for (const selector of contentSelectors) {
                const element = document.querySelector(selector);
                if (element && element.textContent.trim().length > 100) {
                  mainElement = element;
                  break;
                }
              }

              // Fallback to body if no main content found
              if (!mainElement) {
                mainElement = document.body;
              }

              // Clone the element to avoid modifying the actual page
              const clonedElement = mainElement.cloneNode(true);

              // Remove all unwanted elements from the clone
              excludeSelectors.forEach((selector) => {
                const elementsToRemove =
                  clonedElement.querySelectorAll(selector);
                elementsToRemove.forEach((el) => el.remove());
              });

              // Extract clean text content
              const content = clonedElement.textContent
                .replace(/\s+/g, " ")
                .replace(/[\r\n]+/g, " ")
                .trim();

              return {
                content: content.substring(0, 30000),
                title: document.title,
              };
            };

            return getMainContent();
          },
        });

        if (!result || !result.result) {
          throw new Error("Failed to extract content from page");
        }

        content = result.result.content;
        title = result.result.title;
      }

      if (!content || content.length < 100) {
        throw new Error(
          "Content too short to summarize. Page must have at least 100 words."
        );
      }

      this.loaderText.textContent = "Generating summary...";
      this.updateStatus("Generating summary...");

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
      this.updateStatus("Summary generated");
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
    if (mode === "bullet" && !summary.includes("•")) {
      // Add bullet points if not already formatted
      const lines = summary.split("\n").filter((line) => line.trim());
      formattedSummary = lines.map((line) => `• ${line.trim()}`).join("\n");
    }

    this.resultContent.innerHTML = formattedSummary.replace(/\n/g, "<br>");
    this.resultArea.classList.add("show");
    this.currentSummary = formattedSummary;
    // Update status with mode info
    const modeLabel =
      mode === "brief"
        ? "Brief"
        : mode === "bullets" || mode === "bullet"
        ? "Bullet"
        : "Comprehensive";
    this.updateStatus(`Summary generated (${modeLabel})`, 4000);

    // No additional scroll here - we already scrolled during loading phase
    // The view stays where it is (showing the loader area, which now shows the result)
  }

  showError(message) {
    this.resultContent.innerHTML = `<div style="color: #dc3545; font-weight: 600;"> Error:</div><div style="margin-top: 8px;">${message}</div>`;
    this.resultArea.classList.add("show");
    this.updateStatus(`Error: ${message}`, 6000, "error");
  }

  /**
   * Update the small status text banner. If durationMs is provided, it will clear after that many ms.
   */
  updateStatus(text, durationMs = 3000, type = "normal") {
    try {
      if (!this.statusText) return;
      this.statusText.textContent = text;
      // apply error state styling when requested
      if (type === "error") {
        this.statusText.classList.add("error");
      } else {
        this.statusText.classList.remove("error");
      }
      // clear any existing timeout
      if (this._statusTimeout) clearTimeout(this._statusTimeout);
      if (durationMs > 0) {
        this._statusTimeout = setTimeout(() => {
          if (this.statusText) this.statusText.textContent = "Ready";
          // clear error state when resetting
          if (this.statusText) this.statusText.classList.remove("error");
          this._statusTimeout = null;
        }, durationMs);
      }
    } catch (e) {
      // ignore
    }
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
    const opened = this.apiSettings.classList.toggle("show");
    if (opened) {
      // focus the input and scroll it into view smoothly
      setTimeout(() => {
        try {
          if (this.apiKeyInput) this.apiKeyInput.focus();
          // Scroll the apiSettings into view within the popup
          this.apiSettings.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        } catch (e) {
          // ignore
        }
      }, 80);
      this.updateStatus("Opened API settings", 1800);
    } else {
      this.updateStatus("Closed API settings", 900);
    }
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

  // Theme handling: read saved theme and wire toggle
  async loadTheme() {
    try {
      const data = await chrome.storage.sync.get({ theme: "light" });
      const theme = data.theme || "light";
      const checkbox = document.getElementById("themeToggle");

      if (theme === "dark") {
        document.body.classList.add("dark");
        if (checkbox) checkbox.checked = true;
      } else {
        document.body.classList.remove("dark");
        if (checkbox) checkbox.checked = false;
      }

      if (checkbox) {
        checkbox.addEventListener("change", async (e) => {
          const isDark = checkbox.checked;
          if (isDark) document.body.classList.add("dark");
          else document.body.classList.remove("dark");

          // update status banner
          try {
            this.updateStatus(
              isDark ? "Switched to dark mode" : "Switched to light mode",
              2500
            );
          } catch (err) {
            // ignore
          }

          try {
            await chrome.storage.sync.set({ theme: isDark ? "dark" : "light" });
          } catch (err) {
            console.error("Failed to save theme preference:", err);
          }
        });
      }
    } catch (error) {
      console.error("Failed to load theme:", error);
    }
  }

  async saveApiKey() {
    const apiKey = this.apiKeyInput.value.trim();

    if (!apiKey) {
      this.showMiniToast("Please enter an API key", 3000, "error");
      return;
    }

    if (!apiKey.startsWith("AIza") || apiKey.length < 30) {
      this.showMiniToast(
        'Invalid API key format. Key should start with "AIza" and be at least 30 characters.',
        3800,
        "error"
      );
      return;
    }

    try {
      // First save to storage
      await chrome.storage.sync.set({ geminiApiKey: apiKey });
      console.log("API key saved to storage");

      // Then notify background script and wait for confirmation
      const response = await chrome.runtime.sendMessage({
        action: "saveApiKey",
        apiKey: apiKey,
      });

      console.log("Background script response:", response);

      // Check if background script confirmed the save
      if (!response || !response.success) {
        throw new Error(
          response?.error || "Background script failed to save API key"
        );
      }

      // Update UI to saved state
      this.showApiSavedState();
      this.apiSettings.classList.remove("show");
      // Show a minimal in-UI toast (no browser alert)
      this.showMiniToast("API key saved");
      this.updateStatus("API key configured", 3000);
    } catch (error) {
      console.error("Failed to save API key:", error);
      this.showMiniToast(
        "Failed to save API key. Please try again.",
        3200,
        "error"
      );
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
      this.showMiniToast(
        "Failed to remove API key. Please try again.",
        3200,
        "error"
      );
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
    // hide any toast if present
    if (this.miniToast) this.miniToast.classList.remove("show");
  }

  showMiniToast(text = "Saved", duration = 2200, type = "success") {
    if (!this.miniToast) return;
    const txt = document.getElementById("miniToastText");
    if (txt) txt.textContent = text;
    // set error class for styling
    if (type === "error") this.miniToast.classList.add("error");
    else this.miniToast.classList.remove("error");
    this.miniToast.classList.add("show");
    clearTimeout(this._miniToastTimeout);
    this._miniToastTimeout = setTimeout(() => {
      if (this.miniToast) {
        this.miniToast.classList.remove("show");
        this.miniToast.classList.remove("error");
      }
    }, duration);
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new PopupController();
});
