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
    this.editApiBtn = document.getElementById("editApiBtn");
    this.apiStatus = document.getElementById("apiStatus");
    this.miniToast = document.getElementById("miniToast");
    this.statusText = document.getElementById("statusText");
    this.thumbsUpBtn = document.getElementById("thumbsUpBtn");
    this.thumbsDownBtn = document.getElementById("thumbsDownBtn");
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
    this.settingsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.toggleSettings();
    });

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
    if (this.editApiBtn)
      this.editApiBtn.addEventListener("click", () => this.enableEditApiKey());

    // Feedback buttons
    if (this.thumbsUpBtn)
      this.thumbsUpBtn.addEventListener("click", () =>
        this.handleFeedback("up")
      );
    if (this.thumbsDownBtn)
      this.thumbsDownBtn.addEventListener("click", () =>
        this.handleFeedback("down")
      );
  }

  selectMode(button) {
    this.modeButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    this.selectedMode = button.dataset.mode;

    // Re-enable summarize button when mode is changed
    if (this.summarizeBtn) {
      this.summarizeBtn.disabled = false;
      this.summarizeBtn.style.opacity = "1";
      this.summarizeBtn.style.cursor = "pointer";
    }

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

      // Longer delay to ensure script is fully loaded and initialized
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Increased from 500ms to 1 second

      // Try to use content script first with retry logic
      let content, title;
      const MAX_RETRIES = 5; // Increased retries
      const PING_TIMEOUT = 3000; // Increased to 3 seconds for more stable connections

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          // First, verify content script is responsive with a ping
          let pingSucceeded = false;
          try {
            await Promise.race([
              new Promise((resolve) => {
                chrome.tabs.sendMessage(
                  tab.id,
                  { action: "ping" },
                  (response) => {
                    if (chrome.runtime.lastError) {
                      console.warn(
                        "Ping error:",
                        chrome.runtime.lastError.message
                      );
                    } else if (response && response.ready) {
                      pingSucceeded = true;
                    }
                    resolve();
                  }
                );
              }),
              new Promise((resolve) => setTimeout(resolve, PING_TIMEOUT)),
            ]);
          } catch (pingError) {
            console.log("Ping check failed:", pingError.message);
          }

          // If ping failed, try to inject content script
          if (!pingSucceeded) {
            console.log(
              `Ping failed on attempt ${attempt}, injecting content script...`
            );
            try {
              await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["content/content.js"],
              });
              // Give content script a moment to initialize
              await new Promise((resolve) => setTimeout(resolve, 800)); // Increased from 200ms to 800ms

              // Try ping again after injection
              try {
                await Promise.race([
                  new Promise((resolve) => {
                    chrome.tabs.sendMessage(
                      tab.id,
                      { action: "ping" },
                      (response) => {
                        if (
                          !chrome.runtime.lastError &&
                          response &&
                          response.ready
                        ) {
                          pingSucceeded = true;
                        }
                        resolve();
                      }
                    );
                  }),
                  new Promise((resolve) => setTimeout(resolve, 2000)), // Increased from 800ms to 2 seconds
                ]);
              } catch (e) {
                console.log("Second ping after injection failed:", e.message);
              }
            } catch (injectionError) {
              console.log(
                "Content script injection failed:",
                injectionError.message
              );
            }
          }

          if (!pingSucceeded && attempt < MAX_RETRIES) {
            console.log(
              `Content script not ready, retrying... (attempt ${attempt}/${MAX_RETRIES})`
            );
            // Progressive delay: faster first retries, longer later ones
            const delay = attempt === 1 ? 200 : attempt === 2 ? 300 : 500;
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }

          // Now try to extract content
          const response = await chrome.tabs.sendMessage(tab.id, {
            action: "extractContent",
          });

          if (response && response.success) {
            content = response.data.content;
            title = response.data.title;
            console.log(
              "Content extracted via content script (attempt " + attempt + ")"
            );
            break;
          } else {
            throw new Error("Content script response failed");
          }
        } catch (contentScriptError) {
          console.warn(
            `Content script attempt ${attempt}/${MAX_RETRIES} failed:`,
            contentScriptError.message
          );

          if (attempt < MAX_RETRIES) {
            // Retry with delay
            await new Promise((resolve) => setTimeout(resolve, 300));
            continue;
          }

          // Last attempt failed - use inline extraction fallback
          console.log("Using inline extraction fallback...");
          const [result] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
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

              let mainElement = null;
              for (const selector of contentSelectors) {
                const element = document.querySelector(selector);
                if (element && element.textContent.trim().length > 100) {
                  mainElement = element;
                  break;
                }
              }

              if (!mainElement) {
                mainElement = document.body;
              }

              const clonedElement = mainElement.cloneNode(true);
              excludeSelectors.forEach((selector) => {
                const elementsToRemove =
                  clonedElement.querySelectorAll(selector);
                elementsToRemove.forEach((el) => el.remove());
              });

              const content = clonedElement.textContent
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

          content = result.result.content;
          title = result.result.title;
          break;
        }
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
    // Remove any previous Try Again button (from earlier errors)
    const existingTry = document.getElementById("tryAgainBtn");
    if (existingTry) existingTry.remove();

    // Ensure primary action buttons are visible for successful results
    if (this.copyBtn) {
      this.copyBtn.style.display = "inline-flex";
    }
    if (this.resetBtn) this.resetBtn.style.display = "inline-flex";
    if (this.thumbsUpBtn) this.thumbsUpBtn.style.display = "inline-flex";
    if (this.thumbsDownBtn) this.thumbsDownBtn.style.display = "inline-flex";

    // Disable summarize button after successful result
    if (this.summarizeBtn) {
      this.summarizeBtn.disabled = true;
      this.summarizeBtn.style.opacity = "0.5";
      this.summarizeBtn.style.cursor = "not-allowed";
    }

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

    // Manage action buttons for this error specifically
    // Hide default action buttons by default
    if (this.copyBtn) this.copyBtn.style.display = "none";
    if (this.resetBtn) this.resetBtn.style.display = "none";
    if (this.thumbsUpBtn) this.thumbsUpBtn.style.display = "none";
    if (this.thumbsDownBtn) this.thumbsDownBtn.style.display = "none";

    // If this is the specific "Receiving end does not exist" connection error,
    // show only a single Try Again button that retries the summarize flow.
    const connectionErrorText = "Receiving end does not exist";
    if (message && message.includes(connectionErrorText)) {
      // remove any existing tryAgain button first
      const existing = document.getElementById("tryAgainBtn");
      if (existing) existing.remove();

      const tryBtn = document.createElement("button");
      tryBtn.id = "tryAgainBtn";
      tryBtn.className = "secondary-btn";
      tryBtn.textContent = "Try Again";
      tryBtn.style.marginTop = "12px";
      tryBtn.style.display = "block";
      tryBtn.style.margin = "12px auto 0 auto";
      tryBtn.style.width = "fit-content";
      tryBtn.addEventListener("click", async () => {
        // hide result and retry
        this.resultArea.classList.remove("show");
        // small delay to allow UI to hide
        setTimeout(() => this.summarize(), 120);
      });

      // Add Try Again button to result-footer instead of hidden result-actions
      const resultFooter = this.resultArea.querySelector(".result-footer");
      if (resultFooter) resultFooter.appendChild(tryBtn);
      // focus the try button for quick retry
      tryBtn.focus();
    } else {
      // For other errors, show the normal action buttons (Copy / Start Over)
      if (this.copyBtn) this.copyBtn.style.display = "inline-flex";
      if (this.resetBtn) this.resetBtn.style.display = "inline-flex";
      if (this.thumbsUpBtn) this.thumbsUpBtn.style.display = "inline-flex";
      if (this.thumbsDownBtn) this.thumbsDownBtn.style.display = "inline-flex";
      // remove tryAgain if present
      const existing = document.getElementById("tryAgainBtn");
      if (existing) existing.remove();
    }

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

      // Show checkmark animation
      this.copyBtn.classList.add("copied");

      // Remove the class after animation
      setTimeout(() => {
        this.copyBtn.classList.remove("copied");
      }, 800);

      // Show toast feedback
      this.showMiniToast("Copied!", 1800, "success");
    }
  }

  reset() {
    this.resultArea.classList.remove("show");
    this.loader.classList.remove("show");
    this.currentSummary = null;

    // Re-enable summarize button
    if (this.summarizeBtn) {
      this.summarizeBtn.disabled = false;
      this.summarizeBtn.style.opacity = "1";
      this.summarizeBtn.style.cursor = "pointer";
    }
  }

  toggleSettings() {
    const opened = this.apiSettings.classList.toggle("show");
    if (opened) {
      // Change link text to "Close ↑"
      this.settingsBtn.textContent = "Close ↑";
      this.settingsBtn.style.fontSize = "14px";
      this.settingsBtn.style.fontWeight = "700";
      this.settingsBtn.style.fontStyle = "normal";
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
      // Change link text back to original
      this.settingsBtn.textContent = "Click here to setup";
      this.settingsBtn.style.fontSize = "13px";
      this.settingsBtn.style.fontWeight = "500";
      this.settingsBtn.style.fontStyle = "italic";
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
      // Make input editable again
      this.apiKeyInput.readOnly = false;
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
    // Make input readonly and masked
    if (this.apiKeyInput) {
      this.apiKeyInput.readOnly = true;
      this.apiKeyInput.type = "password";
    }
    if (this.saveApiBtn) this.saveApiBtn.style.display = "none";
    if (this.editApiBtn) this.editApiBtn.style.display = "inline-block";
    if (this.removeApiBtn) this.removeApiBtn.style.display = "inline-block";
  }

  showApiEmptyState() {
    if (this.apiStatus) {
      this.apiStatus.style.display = "none";
      this.apiStatus.innerHTML = "";
    }
    // Make input editable for entering new key
    if (this.apiKeyInput) {
      this.apiKeyInput.readOnly = false;
      this.apiKeyInput.type = "text";
    }
    if (this.saveApiBtn) this.saveApiBtn.style.display = "inline-block";
    if (this.editApiBtn) this.editApiBtn.style.display = "none";
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

  enableEditApiKey() {
    // Allow editing of the saved API key
    if (this.apiKeyInput) {
      this.apiKeyInput.readOnly = false;
      this.apiKeyInput.type = "text";
      this.apiKeyInput.focus();
      // Select existing value for convenience
      try {
        this.apiKeyInput.select();
      } catch (e) {}
    }
    if (this.saveApiBtn) this.saveApiBtn.style.display = "inline-block";
    if (this.editApiBtn) this.editApiBtn.style.display = "none";
  }

  handleFeedback(type) {
    // Handle thumbs up/down feedback
    const isUp = type === "up";
    const upBtn = this.thumbsUpBtn;
    const downBtn = this.thumbsDownBtn;

    // Check if already active (will toggle off)
    const wasActive = isUp
      ? upBtn.classList.contains("active")
      : downBtn.classList.contains("active");

    // Toggle active state
    if (isUp) {
      upBtn.classList.toggle("active");
      downBtn.classList.remove("active");
    } else {
      downBtn.classList.toggle("active");
      upBtn.classList.remove("active");
    }

    // Show feedback message only when selecting (not deselecting)
    if (!wasActive) {
      const feedbackText = isUp
        ? "👍 Thanks for the feedback!"
        : "👎 We'll improve!";
      this.showMiniToast(feedbackText, 1800, "success");
    }

    // Optional: Log feedback (could send to analytics)
    console.log(`User feedback: ${type === "up" ? "Helpful" : "Not helpful"}`);
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new PopupController();
});
