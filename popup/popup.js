class PopupController {
  constructor() {
    this.selectedMode = "brief";
    this.isProcessing = false;
    this.currentTabId = null;

    this.initializeElements();
    this.attachEventListeners();
    this.loadCurrentTab();
  }

  initializeElements() {
    // UI Elements
    this.statusText = document.getElementById("statusText");
    this.modeButtons = document.querySelectorAll(".mode-btn");
    this.summarizeBtn = document.getElementById("summarizeBtn");
    this.btnLoader = document.getElementById("btnLoader");
    this.resultSection = document.getElementById("resultSection");
    this.resultContent = document.getElementById("resultContent");
    this.resultMeta = document.getElementById("resultMeta");
    this.copyBtn = document.getElementById("copyBtn");
    this.clearBtn = document.getElementById("clearBtn");
    this.wordCount = document.getElementById("wordCount");
  }

  attachEventListeners() {
    // Mode selection
    this.modeButtons.forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.selectMode(e.target.closest(".mode-btn"))
      );
    });

    // Main action button
    this.summarizeBtn.addEventListener("click", () => this.summarizePage());

    // Result actions
    this.copyBtn.addEventListener("click", () => this.copyToClipboard());
    this.clearBtn.addEventListener("click", () => this.clearResults());

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
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
        this.updateStatus("❌ Cannot analyze this page type", "error");
        this.summarizeBtn.disabled = true;
        return;
      }

      this.updateStatus("📄 Ready to analyze page");
      this.updateWordCount("Click summarize to start");
    } catch (error) {
      console.error("Error loading current tab:", error);
      this.updateStatus("❌ Error loading page", "error");
    }
  }

  selectMode(button) {
    // Remove active class from all buttons
    this.modeButtons.forEach((btn) => btn.classList.remove("active"));

    // Add active class to selected button
    button.classList.add("active");

    // Update selected mode
    this.selectedMode = button.dataset.mode;

    // Update status
    const modeNames = {
      brief: "Brief summary mode selected",
      detailed: "Detailed summary mode selected",
      bullets: "Bullet points mode selected",
    };

    this.updateStatus(`✅ ${modeNames[this.selectedMode]}`);
  }

  async summarizePage() {
    if (this.isProcessing) return;

    try {
      this.setProcessingState(true);
      this.updateStatus("🔍 Extracting page content...");

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

      this.updateStatus("🤖 Generating summary...");
      this.updateWordCount(`Analyzing ${wordCount} words`);

      // Send to background script for processing
      const summaryResponse = await chrome.runtime.sendMessage({
        action: "generateSummary",
        data: {
          content,
          title,
          mode: this.selectedMode,
          wordCount,
        },
      });

      if (!summaryResponse || !summaryResponse.success) {
        throw new Error(summaryResponse?.error || "Failed to generate summary");
      }

      this.displayResult(summaryResponse.data);
      this.updateStatus("✅ Summary generated successfully");
    } catch (error) {
      console.error("Error summarizing page:", error);
      this.updateStatus(`❌ ${error.message}`, "error");
    } finally {
      this.setProcessingState(false);
    }
  }

  async sendMessageToTab(message) {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(this.currentTabId, message, (response) => {
        if (chrome.runtime.lastError) {
          resolve({ success: false, error: chrome.runtime.lastError.message });
        } else {
          resolve(response);
        }
      });
    });
  }

  displayResult(data) {
    const { summary, mode, processingTime, originalWordCount } = data;

    // Format content based on mode
    let formattedContent = this.formatSummaryContent(summary, mode);

    this.resultContent.innerHTML = formattedContent;

    // Update meta information
    const summaryWordCount = summary.split(/\s+/).length;
    const compressionRatio = Math.round(
      (summaryWordCount / originalWordCount) * 100
    );

    this.resultMeta.textContent = `${summaryWordCount} words (${compressionRatio}% of original) • Generated in ${processingTime}ms`;

    // Show result section
    this.resultSection.style.display = "block";

    // Update word count
    this.updateWordCount(`Summary: ${summaryWordCount} words`);
  }

  formatSummaryContent(summary, mode) {
    switch (mode) {
      case "bullets":
        // Convert to bullet points if not already formatted
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
        return this.convertToBulletHTML(summary);

      case "detailed":
        return `<h4>Detailed Analysis:</h4>${this.formatParagraphs(summary)}`;

      case "brief":
      default:
        return this.formatParagraphs(summary);
    }
  }

  convertToBulletHTML(text) {
    const lines = text.split("\n").filter((line) => line.trim().length > 0);
    const bullets = lines
      .map((line) => {
        const cleaned = line.replace(/^[-•*]\s*/, "").trim();
        return cleaned ? `<li>${cleaned}</li>` : "";
      })
      .filter(Boolean);

    return bullets.length > 0
      ? `<ul>${bullets.join("")}</ul>`
      : this.formatParagraphs(text);
  }

  formatParagraphs(text) {
    return text
      .split("\n\n")
      .filter((p) => p.trim().length > 0)
      .map((p) => `<p>${p.trim()}</p>`)
      .join("");
  }

  async copyToClipboard() {
    try {
      const textContent =
        this.resultContent.textContent || this.resultContent.innerText;
      await navigator.clipboard.writeText(textContent);

      // Visual feedback
      const originalText = this.copyBtn.innerHTML;
      this.copyBtn.innerHTML = "✓";
      setTimeout(() => {
        this.copyBtn.innerHTML = originalText;
      }, 1000);

      this.updateStatus("📋 Copied to clipboard");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      this.updateStatus("❌ Failed to copy", "error");
    }
  }

  clearResults() {
    this.resultSection.style.display = "none";
    this.resultContent.innerHTML = "";
    this.resultMeta.textContent = "";
    this.updateStatus("📄 Ready to summarize");
    this.updateWordCount("Ready");
  }

  setProcessingState(processing) {
    this.isProcessing = processing;
    this.summarizeBtn.disabled = processing;

    if (processing) {
      this.summarizeBtn.classList.add("loading");
    } else {
      this.summarizeBtn.classList.remove("loading");
    }
  }

  updateStatus(message, type = "info") {
    this.statusText.textContent = message;

    // Optional: Add visual indicators based on type
    const statusElement = document.querySelector(".status");
    statusElement.className = `status ${type}`;
  }

  updateWordCount(text) {
    this.wordCount.textContent = text;
  }

  handleMessage(message, sender, sendResponse) {
    // Handle any messages from background script
    if (message.action === "updateStatus") {
      this.updateStatus(message.status);
    }

    sendResponse({ success: true });
  }
}

// Initialize the popup when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new PopupController();
});
