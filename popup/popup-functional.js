class PopupController {
  constructor() {
    this.selectedMode = "brief";
    this.currentTabId = null;
    this.initializeElements();
    this.attachEventListeners();
    this.loadCurrentTab();
  }
  initializeElements() {
    this.statusText = document.getElementById("statusText");
    this.modeButtons = document.querySelectorAll(".mode-btn");
    this.summarizeBtn = document.getElementById("summarizeBtn");
    this.loader = document.getElementById("loader");
    this.resultArea = document.getElementById("resultArea");
    this.resultContent = document.getElementById("resultContent");
    this.copyBtn = document.getElementById("copyBtn");
    this.saveBtn = document.getElementById("saveBtn");
    this.historyBtn = document.getElementById("historyBtn");
    this.historyView = document.getElementById("historyView");
    this.closeHistoryBtn = document.getElementById("closeHistoryBtn");
    this.historyList = document.getElementById("historyList");
    this.themeToggle = document.getElementById("themeToggle");

    // Loading elements
    this.loadingText = document.getElementById("loadingText");
    this.loadingSubtext = document.getElementById("loadingSubtext");

    // API key management elements
    this.settingsBtn = document.getElementById("settingsBtn");
    this.apiKeySection = document.getElementById("apiKeySection");
    this.apiKeyInput = document.getElementById("apiKeyInput");
    this.saveApiBtn = document.getElementById("saveApiBtn");
    this.removeApiBtn = document.getElementById("removeApiBtn");
    this.apiStatus = document.getElementById("apiStatus");
    this.methodIndicator = document.getElementById("methodIndicator");

    // Store current summary data for saving
    this.currentSummary = null;
    this.loadingStage = 0;

    // Initialize theme and API status
    this.initializeTheme();
    this.initializeApiStatus();
  }

  attachEventListeners() {
    // Mode selection
    this.modeButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        try {
          this.selectMode(e.target.closest(".mode-btn"));
        } catch (error) {
          console.error("Error in mode selection:", error);
        }
      });
    });

    // Summarize button
    this.summarizeBtn.addEventListener("click", () => {
      try {
        this.summarizePage();
      } catch (error) {
        console.error("Error in summarize page:", error);
      }
    });

    // Copy button
    this.copyBtn.addEventListener("click", () => {
      try {
        this.copyToClipboard();
      } catch (error) {
        console.error("Error in copy to clipboard:", error);
      }
    });

    // Save button
    this.saveBtn.addEventListener("click", () => {
      try {
        this.saveSummary();
      } catch (error) {
        console.error("Error in save summary:", error);
      }
    });

    // History button
    this.historyBtn.addEventListener("click", () => {
      try {
        this.showHistory();
      } catch (error) {
        console.error("Error showing history:", error);
      }
    });

    // Close history button
    this.closeHistoryBtn.addEventListener("click", () => {
      try {
        this.hideHistory();
      } catch (error) {
        console.error("Error hiding history:", error);
      }
    });

    // Theme toggle button
    this.themeToggle.addEventListener("click", () => {
      try {
        this.toggleTheme();
      } catch (error) {
        console.error("Error toggling theme:", error);
      }
    });

    // API key management
    this.settingsBtn.addEventListener("click", () => {
      this.toggleApiKeySection();
    });

    this.saveApiBtn.addEventListener("click", () => {
      this.saveApiKey();
    });

    this.removeApiBtn.addEventListener("click", () => {
      this.removeApiKey();
    });
  }

  async loadCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      this.currentTabId = tab.id;

      if (
        tab.url.startsWith("chrome://") ||
        tab.url.startsWith("chrome-extension://")
      ) {
        this.updateStatus("❌ Cannot analyze this page type");
        this.summarizeBtn.disabled = true;
        return;
      }

      this.updateStatus("📄 Ready to analyze page");
    } catch (error) {
      console.error("Error loading current tab:", error);
      this.updateStatus("❌ Error loading page");
    }
  }

  selectMode(button) {
    if (!button) {
      console.error("No button provided to selectMode");
      return;
    }

    this.modeButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    this.selectedMode = button.dataset.mode;

    const modeNames = {
      brief: "⚡ Brief summary mode selected",
      detailed: "📋 Detailed summary mode selected",
      bullets: "📝 Bullet points mode selected",
    };

    if (this.selectedMode in modeNames) {
      this.updateStatus(modeNames[this.selectedMode]);
    } else {
      console.error("Unknown mode:", this.selectedMode);
      this.updateStatus("❌ Unknown mode selected");
    }
  }

  async summarizePage() {
    try {
      this.setLoadingState(true, "start");
      this.updateStatus("🔍 Extracting page content...");

      // Get current tab info
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      // Update loading progress
      setTimeout(() => this.updateLoadingProgress("extracting"), 500);

      // Get page content from content script
      const response = await this.sendMessageToTab({
        action: "extractContent",
      });

      if (!response || !response.success) {
        throw new Error(response?.error || "Failed to extract content");
      }

      const { content, title, wordCount } = response.data;

      if (!content || content.trim().length < 50) {
        throw new Error("Insufficient content found on page");
      }

      // Update loading progress based on method
      const hasApiKey =
        this.methodIndicator && this.methodIndicator.textContent === "GEMINI";
      setTimeout(() => {
        this.updateLoadingProgress(hasApiKey ? "gemini" : "local");
      }, 1000);

      this.updateStatus("🤖 Generating summary...");

      // Send to background script for processing
      const summaryResponse = await this.sendMessageToBackground({
        action: "generateSummary",
        data: {
          content,
          title: title || tab.title,
          mode: this.selectedMode,
          wordCount,
        },
      });

      if (!summaryResponse || !summaryResponse.success) {
        throw new Error(summaryResponse?.error || "Failed to generate summary");
      }

      // Add tab info to the summary data
      const summaryData = {
        ...summaryResponse.data,
        title: title || tab.title,
        url: tab.url,
        wordCount,
      };

      this.displayResult(summaryData);

      // Add finalizing stage
      setTimeout(() => this.updateLoadingProgress("finalizing"), 100);

      // Show success message with additional info if content was truncated
      let statusMessage = "✅ Summary generated successfully";
      if (wordCount > 20000) {
        statusMessage += " (content was truncated due to length)";
      } else if (wordCount > 15000) {
        statusMessage += " (large document processed)";
      }

      // Small delay before showing final result
      setTimeout(() => {
        this.updateStatus(statusMessage);
      }, 300);
    } catch (error) {
      console.error("Error summarizing page:", error);

      // Provide more helpful error messages
      let errorMessage = error.message;
      if (errorMessage.includes("too long")) {
        errorMessage =
          "Page content is too long to summarize. Try a shorter article or different page.";
      } else if (errorMessage.includes("too short")) {
        errorMessage =
          "Not enough content found on this page to create a summary.";
      }

      this.updateStatus(`❌ ${errorMessage}`);
      this.resultContent.textContent = `Error: ${errorMessage}`;
      this.resultArea.style.display = "block";
    } finally {
      // Add a small delay to show finalizing stage
      setTimeout(() => {
        this.setLoadingState(false);
      }, 500);
    }
  }

  async sendMessageToTab(message) {
    return new Promise((resolve) => {
      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        resolve({
          success: false,
          error: "Message timeout - content script may not be loaded",
        });
      }, 5000); // 5 second timeout

      chrome.tabs.sendMessage(this.currentTabId, message, (response) => {
        clearTimeout(timeout);

        if (chrome.runtime.lastError) {
          console.error("Chrome runtime error:", chrome.runtime.lastError);
          resolve({ success: false, error: chrome.runtime.lastError.message });
        } else if (!response) {
          resolve({ success: false, error: "No response from content script" });
        } else {
          resolve(response);
        }
      });
    });
  }

  async sendMessageToBackground(message) {
    return new Promise((resolve) => {
      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        resolve({ success: false, error: "Background script timeout" });
      }, 10000); // 10 second timeout for summarization

      chrome.runtime.sendMessage(message, (response) => {
        clearTimeout(timeout);

        if (chrome.runtime.lastError) {
          console.error("Background script error:", chrome.runtime.lastError);
          resolve({ success: false, error: chrome.runtime.lastError.message });
        } else if (!response) {
          resolve({
            success: false,
            error: "No response from background script",
          });
        } else {
          resolve(response);
        }
      });
    });
  }

  displayResult(data) {
    const { summary, title, url, wordCount } = data;

    // Store current summary data for potential saving
    this.currentSummary = {
      summary,
      title: title || "Unknown Page",
      url: url || window.location.href,
      mode: this.selectedMode,
      wordCount: wordCount || 0,
      timestamp: Date.now(),
    };

    this.resultContent.innerHTML = this.formatSummary(
      summary,
      this.selectedMode
    );
    this.resultArea.style.display = "block";
  }

  formatSummary(summary, mode) {
    switch (mode) {
      case "bullets":
        if (!summary.includes("•") && !summary.includes("-")) {
          const sentences = summary
            .split(/[.!?]+/)
            .filter((s) => s.trim().length > 10);
          return (
            "<ul>" +
            sentences.map((s) => `<li>${s.trim()}</li>`).join("") +
            "</ul>"
          );
        }
        // Handle pre-formatted bullet points
        const bulletItems = summary
          .split("\n")
          .map((line) => {
            const cleaned = line.replace(/^[-•*]\s*/, "").trim();
            return cleaned ? `<li>${cleaned}</li>` : "";
          })
          .filter(Boolean);

        return bulletItems.length > 0
          ? `<ul>${bulletItems.join("")}</ul>`
          : `<p>${summary}</p>`;

      case "detailed":
        return `<div>${summary
          .split("\n\n")
          .map((p) => `<p>${p.trim()}</p>`)
          .join("")}</div>`;

      default:
        return `<p>${summary}</p>`;
    }
  }

  async copyToClipboard() {
    try {
      const textContent =
        this.resultContent.textContent || this.resultContent.innerText;
      await navigator.clipboard.writeText(textContent);

      const originalText = this.copyBtn.textContent;
      this.copyBtn.textContent = "✓ Copied!";
      setTimeout(() => {
        this.copyBtn.textContent = originalText;
      }, 1000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  }

  setLoadingState(loading, stage = "start") {
    this.summarizeBtn.disabled = loading;

    if (loading) {
      this.summarizeBtn.classList.add("loading");
      this.loader.style.display = "block";
      this.resultArea.style.display = "none";
      this.updateLoadingProgress(stage);
    } else {
      this.summarizeBtn.classList.remove("loading");
      this.loader.style.display = "none";
      this.loadingStage = 0;
    }
  }

  updateLoadingProgress(stage) {
    const loadingStages = {
      start: {
        text: "🔍 Analyzing page content...",
        subtext: "Extracting and filtering content",
      },
      extracting: {
        text: "📄 Extracting content...",
        subtext: "Removing ads and navigation elements",
      },
      processing: {
        text: "🤖 Generating summary...",
        subtext: this.getProcessingMessage(),
      },
      gemini: {
        text: "✨ Using Gemini AI...",
        subtext: "Generating high-quality summary",
      },
      local: {
        text: "💻 Using local processing...",
        subtext: "Generating summary with built-in algorithms",
      },
      finalizing: {
        text: "🎯 Finalizing summary...",
        subtext: "Polishing and formatting results",
      },
    };

    const currentStage = loadingStages[stage] || loadingStages["start"];

    if (this.loadingText) {
      this.loadingText.textContent = currentStage.text;
    }

    if (this.loadingSubtext) {
      this.loadingSubtext.textContent = currentStage.subtext;
    }

    this.loadingStage++;
  }

  getProcessingMessage() {
    // Check if API key is available to show appropriate message
    const hasApiKey =
      this.methodIndicator && this.methodIndicator.textContent === "GEMINI";
    return hasApiKey
      ? "Connecting to Google Gemini API..."
      : "Using local AI algorithms...";
  }

  updateStatus(message) {
    this.statusText.textContent = message;
  }

  // === Summary Storage Methods ===

  async saveSummary() {
    if (!this.currentSummary) {
      this.updateStatus("❌ No summary to save");
      return;
    }

    try {
      // Get existing summaries
      const result = await chrome.storage.local.get("savedSummaries");
      const savedSummaries = result.savedSummaries || [];

      // Create unique ID for this summary
      const summaryId = `summary_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Add current summary to the list
      const summaryToSave = {
        id: summaryId,
        ...this.currentSummary,
        savedAt: new Date().toISOString(),
      };

      savedSummaries.unshift(summaryToSave); // Add to beginning

      // Limit to 50 summaries to prevent storage bloat
      if (savedSummaries.length > 50) {
        savedSummaries.splice(50);
      }

      // Save to storage
      await chrome.storage.local.set({ savedSummaries });

      // Update UI
      const originalText = this.saveBtn.textContent;
      this.saveBtn.textContent = "✓ Saved!";
      this.saveBtn.disabled = true;

      setTimeout(() => {
        this.saveBtn.textContent = originalText;
        this.saveBtn.disabled = false;
      }, 1500);

      this.updateStatus("✅ Summary saved successfully");
    } catch (error) {
      console.error("Error saving summary:", error);
      this.updateStatus("❌ Failed to save summary");
    }
  }

  async showHistory() {
    try {
      // Get saved summaries
      const result = await chrome.storage.local.get("savedSummaries");
      const savedSummaries = result.savedSummaries || [];

      // Render history list
      this.renderHistoryList(savedSummaries);

      // Show history view
      this.historyView.style.display = "flex";
    } catch (error) {
      console.error("Error showing history:", error);
      this.updateStatus("❌ Failed to load history");
    }
  }

  hideHistory() {
    this.historyView.style.display = "none";
  }

  renderHistoryList(summaries) {
    if (!summaries || summaries.length === 0) {
      this.historyList.innerHTML =
        '<p class="no-summaries">No saved summaries yet</p>';
      return;
    }

    const historyHTML = summaries
      .map((summary) => {
        const date = new Date(
          summary.savedAt || summary.timestamp
        ).toLocaleDateString();
        const time = new Date(
          summary.savedAt || summary.timestamp
        ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const previewText = this.getTextPreview(summary.summary, 100);

        return `
        <div class="history-item" data-id="${summary.id}">
          <div class="history-item-header">
            <div class="history-item-title" title="${this.escapeHtml(
              summary.title
            )}">
              ${this.escapeHtml(summary.title)}
            </div>
            <div class="history-item-date">${date} ${time}</div>
          </div>
          <div style="margin-bottom: 8px;">
            <span class="history-item-mode">${summary.mode}</span>
            ${
              summary.wordCount
                ? `<span style="font-size: 11px; color: #666;">${summary.wordCount} words</span>`
                : ""
            }
          </div>
          <div class="history-item-content">
            ${this.escapeHtml(previewText)}
          </div>
          <div class="history-item-actions">
            <button class="history-action-btn view-full-btn" data-id="${
              summary.id
            }">
              👁️ View Full
            </button>
            <button class="history-action-btn copy-history-btn" data-id="${
              summary.id
            }">
              📋 Copy
            </button>
            <button class="history-action-btn delete-btn" data-id="${
              summary.id
            }">
              🗑️ Delete
            </button>
          </div>
        </div>
      `;
      })
      .join("");

    this.historyList.innerHTML = historyHTML;

    // Attach event listeners to history action buttons
    this.attachHistoryEventListeners();
  }

  attachHistoryEventListeners() {
    // View Full buttons
    this.historyList.querySelectorAll(".view-full-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const summaryId = e.target.dataset.id;
        this.viewFullSummary(summaryId);
      });
    });

    // Copy buttons
    this.historyList.querySelectorAll(".copy-history-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const summaryId = e.target.dataset.id;
        this.copyFromHistory(summaryId);
      });
    });

    // Delete buttons
    this.historyList.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const summaryId = e.target.dataset.id;
        this.deleteFromHistory(summaryId);
      });
    });
  }

  async viewFullSummary(summaryId) {
    try {
      const result = await chrome.storage.local.get("savedSummaries");
      const savedSummaries = result.savedSummaries || [];
      const summary = savedSummaries.find((s) => s.id === summaryId);

      if (!summary) {
        this.updateStatus("❌ Summary not found");
        return;
      }

      // Create a modal-like overlay to show the full summary
      this.showFullSummaryModal(summary);
    } catch (error) {
      console.error("Error viewing full summary:", error);
      this.updateStatus("❌ Failed to load summary");
    }
  }

  showFullSummaryModal(summary) {
    // Create modal overlay
    const modal = document.createElement("div");
    modal.className = "full-summary-modal";
    modal.innerHTML = `
      <div class="full-summary-content">
        <div class="full-summary-header">
          <h3>${this.escapeHtml(summary.title)}</h3>
          <button class="close-modal-btn">✕</button>
        </div>
        <div class="full-summary-meta">
          <span class="summary-mode-badge">${summary.mode}</span>
          <span class="summary-date">${new Date(
            summary.savedAt || summary.timestamp
          ).toLocaleDateString()}</span>
          ${
            summary.wordCount
              ? `<span class="summary-word-count">${summary.wordCount} words</span>`
              : ""
          }
        </div>
        <div class="full-summary-body">
          ${summary.summary}
        </div>
        <div class="full-summary-actions">
          <button class="modal-action-btn copy-full-btn">📋 Copy Full Summary</button>
          <button class="modal-action-btn close-modal-action-btn">Close</button>
        </div>
      </div>
    `;

    // Add modal to body
    document.body.appendChild(modal);

    // Add event listeners
    const closeBtn = modal.querySelector(".close-modal-btn");
    const closeActionBtn = modal.querySelector(".close-modal-action-btn");
    const copyBtn = modal.querySelector(".copy-full-btn");

    const closeModal = () => {
      modal.remove();
    };

    closeBtn.addEventListener("click", closeModal);
    closeActionBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    copyBtn.addEventListener("click", async () => {
      try {
        const textContent = this.getTextFromHtml(summary.summary);
        await navigator.clipboard.writeText(textContent);
        copyBtn.textContent = "✓ Copied!";
        setTimeout(() => {
          copyBtn.textContent = "📋 Copy Full Summary";
        }, 1000);
      } catch (error) {
        console.error("Error copying summary:", error);
        copyBtn.textContent = "❌ Failed";
        setTimeout(() => {
          copyBtn.textContent = "📋 Copy Full Summary";
        }, 1000);
      }
    });

    // Close modal with Escape key
    document.addEventListener("keydown", function escapeHandler(e) {
      if (e.key === "Escape") {
        closeModal();
        document.removeEventListener("keydown", escapeHandler);
      }
    });
  }

  async copyFromHistory(summaryId) {
    try {
      const result = await chrome.storage.local.get("savedSummaries");
      const savedSummaries = result.savedSummaries || [];
      const summary = savedSummaries.find((s) => s.id === summaryId);

      if (!summary) {
        this.updateStatus("❌ Summary not found");
        return;
      }

      // Get the text content without HTML formatting
      const textContent = this.getTextFromHtml(summary.summary);
      await navigator.clipboard.writeText(textContent);

      // Visual feedback
      const btn = this.historyList.querySelector(
        `[data-id="${summaryId}"].copy-history-btn`
      );
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = "✓ Copied!";
        setTimeout(() => {
          btn.textContent = originalText;
        }, 1000);
      }
    } catch (error) {
      console.error("Error copying from history:", error);
      this.updateStatus("❌ Failed to copy");
    }
  }

  async deleteFromHistory(summaryId) {
    try {
      // Confirm deletion
      if (!confirm("Are you sure you want to delete this summary?")) {
        return;
      }

      const result = await chrome.storage.local.get("savedSummaries");
      const savedSummaries = result.savedSummaries || [];
      const filteredSummaries = savedSummaries.filter(
        (s) => s.id !== summaryId
      );

      await chrome.storage.local.set({ savedSummaries: filteredSummaries });

      // Re-render history list
      this.renderHistoryList(filteredSummaries);

      this.updateStatus("🗑️ Summary deleted");
    } catch (error) {
      console.error("Error deleting from history:", error);
      this.updateStatus("❌ Failed to delete summary");
    }
  }

  // === Utility Methods ===

  getTextPreview(text, maxLength) {
    // Remove HTML tags and get plain text
    const plainText = this.getTextFromHtml(text);
    if (plainText.length <= maxLength) {
      return plainText;
    }
    return plainText.substring(0, maxLength) + "...";
  }

  getTextFromHtml(html) {
    // Create a temporary div to extract text content
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // === Theme Management ===

  async initializeTheme() {
    try {
      // Load saved theme preference
      const result = await chrome.storage.sync.get("theme");
      const savedTheme = result.theme || "light";
      this.applyTheme(savedTheme);
    } catch (error) {
      console.error("Error loading theme:", error);
      this.applyTheme("light");
    }
  }

  async toggleTheme() {
    try {
      const currentTheme =
        document.documentElement.getAttribute("data-theme") || "light";
      const newTheme = currentTheme === "light" ? "dark" : "light";

      // Apply theme immediately
      this.applyTheme(newTheme);

      // Save theme preference
      await chrome.storage.sync.set({ theme: newTheme });

      this.updateStatus(`🎨 Switched to ${newTheme} mode`);

      // Reset status after 2 seconds
      setTimeout(() => {
        this.updateStatus("📄 Ready to analyze page");
      }, 2000);
    } catch (error) {
      console.error("Error toggling theme:", error);
    }
  }

  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);

    // Update toggle button text
    if (this.themeToggle) {
      this.themeToggle.textContent = theme === "light" ? "🌙 Dark" : "☀️ Light";
    }
  }

  // === API Key Management ===

  async initializeApiStatus() {
    try {
      // Check API key status from background script
      const response = await this.sendMessageToBackground({
        action: "getApiKeyStatus",
      });

      if (response && response.success) {
        this.updateApiStatus(response.hasApiKey, response.usingLocal);

        // If API key exists, we can optionally show a masked version in the input
        // For security, we don't actually load the full key, just show it's configured
        if (response.hasApiKey) {
          this.apiKeyInput.placeholder = "API key configured (••••••••••••)";
        }
      } else {
        this.updateApiStatus(false, true);
      }
    } catch (error) {
      console.error("Error initializing API status:", error);
      this.updateApiStatus(false, true);
    }
  }

  updateApiStatus(hasApiKey, usingLocal) {
    if (hasApiKey) {
      this.apiStatus.textContent = "✅ Gemini API key configured";
      this.apiStatus.className = "api-status configured";
      this.methodIndicator.textContent = "GEMINI";
      this.methodIndicator.className = "method-indicator method-api";
    } else {
      this.apiStatus.textContent = "⚠️ No API key - using local summarization";
      this.apiStatus.className = "api-status not-configured";
      this.methodIndicator.textContent = "LOCAL";
      this.methodIndicator.className = "method-indicator method-local";
    }
  }

  toggleApiKeySection() {
    const isVisible = this.apiKeySection.classList.contains("show");
    if (isVisible) {
      this.apiKeySection.classList.remove("show");
      this.settingsBtn.textContent = "⚙️ API Settings";
    } else {
      this.apiKeySection.classList.add("show");
      this.settingsBtn.textContent = "⬆️ Hide Settings";
    }
  }

  async saveApiKey() {
    try {
      const apiKey = this.apiKeyInput.value.trim();

      if (!apiKey) {
        this.updateStatus("❌ Please enter an API key");
        return;
      }

      // Validate API key format (basic check)
      if (!apiKey.startsWith("AIza") || apiKey.length < 30) {
        this.updateStatus("❌ Invalid API key format");
        return;
      }

      // Save API key via background script
      const response = await this.sendMessageToBackground({
        action: "saveApiKey",
        apiKey: apiKey,
      });

      if (response && response.success) {
        this.updateStatus("✅ API key saved successfully");
        this.updateApiStatus(true, false);
        this.apiKeyInput.value = ""; // Clear input for security
        this.apiKeyInput.placeholder = "API key configured (••••••••••••)";
      } else {
        this.updateStatus("❌ Failed to save API key");
      }
    } catch (error) {
      console.error("Error saving API key:", error);
      this.updateStatus("❌ Error saving API key");
    }
  }

  async removeApiKey() {
    try {
      // Remove API key via background script
      const response = await this.sendMessageToBackground({
        action: "saveApiKey",
        apiKey: "", // Empty string removes the key
      });

      if (response && response.success) {
        this.updateStatus("🗑️ API key removed");
        this.updateApiStatus(false, true);
        this.apiKeyInput.value = "";
        this.apiKeyInput.placeholder = "Enter your Google Gemini API key...";
      } else {
        this.updateStatus("❌ Failed to remove API key");
      }
    } catch (error) {
      console.error("Error removing API key:", error);
      this.updateStatus("❌ Error removing API key");
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new PopupController();
});
