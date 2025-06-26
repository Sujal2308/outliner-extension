// Debug version of popup controller with extra logging

class PopupController {
  constructor() {
    console.log("PopupController initializing...");
    this.selectedMode = "brief";
    this.currentTabId = null;

    try {
      this.initializeElements();
      console.log("Elements initialized successfully");

      this.attachEventListeners();
      console.log("Event listeners attached successfully");

      this.loadCurrentTab();
      console.log("Current tab loading initiated");
    } catch (error) {
      console.error("Error in PopupController constructor:", error);
    }
  }

  initializeElements() {
    console.log("Initializing elements...");

    this.statusText = document.getElementById("statusText");
    console.log("statusText element:", this.statusText);

    this.modeButtons = document.querySelectorAll(".mode-btn");
    console.log("Found mode buttons:", this.modeButtons.length);

    this.summarizeBtn = document.getElementById("summarizeBtn");
    console.log("summarizeBtn element:", this.summarizeBtn);

    this.loader = document.getElementById("loader");
    this.resultArea = document.getElementById("resultArea");
    this.resultContent = document.getElementById("resultContent");
    this.copyBtn = document.getElementById("copyBtn");

    // Check each mode button
    this.modeButtons.forEach((btn, index) => {
      console.log(
        `Mode button ${index}:`,
        btn.dataset.mode,
        btn.textContent.trim()
      );
    });
  }

  attachEventListeners() {
    console.log("Attaching event listeners...");

    // Mode selection with extra debugging
    this.modeButtons.forEach((btn, index) => {
      console.log(`Attaching listener to button ${index}:`, btn.dataset.mode);

      btn.addEventListener("click", (e) => {
        console.log(`Button clicked:`, e.target, e.target.dataset.mode);
        try {
          const buttonElement = e.target.closest(".mode-btn");
          console.log("Closest button element:", buttonElement);
          this.selectMode(buttonElement);
        } catch (error) {
          console.error("Error in mode selection:", error);
        }
      });
    });

    // Summarize button
    if (this.summarizeBtn) {
      this.summarizeBtn.addEventListener("click", () => {
        console.log("Summarize button clicked");
        try {
          this.summarizePage();
        } catch (error) {
          console.error("Error in summarize page:", error);
        }
      });
    }

    // Copy button
    if (this.copyBtn) {
      this.copyBtn.addEventListener("click", () => {
        console.log("Copy button clicked");
        try {
          this.copyToClipboard();
        } catch (error) {
          console.error("Error in copy to clipboard:", error);
        }
      });
    }
  }

  selectMode(button) {
    console.log("selectMode called with:", button);

    if (!button) {
      console.error("No button provided to selectMode");
      return;
    }

    console.log("Button dataset:", button.dataset);
    console.log("Button mode:", button.dataset.mode);

    this.modeButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    this.selectedMode = button.dataset.mode;

    console.log("Selected mode:", this.selectedMode);

    const modeNames = {
      brief: "⚡ Brief summary mode selected",
      detailed: "📋 Detailed summary mode selected",
      bullets: "📝 Bullet points mode selected",
    };

    if (this.selectedMode in modeNames) {
      this.updateStatus(modeNames[this.selectedMode]);
      console.log("Status updated for mode:", this.selectedMode);
    } else {
      console.error("Unknown mode:", this.selectedMode);
      this.updateStatus("❌ Unknown mode selected");
    }
  }

  updateStatus(message) {
    console.log("Updating status:", message);
    if (this.statusText) {
      this.statusText.textContent = message;
    } else {
      console.error("statusText element not found");
    }
  }

  // ... rest of the methods remain the same but with added logging
  async loadCurrentTab() {
    console.log("Loading current tab...");
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      this.currentTabId = tab.id;
      console.log("Current tab loaded:", tab.url);

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

  // Placeholder methods - add the rest from the original file
  async summarizePage() {
    console.log("Summarize page called - mode:", this.selectedMode);
    this.updateStatus(
      "🔍 This is a debug version - summarization not fully implemented yet"
    );
  }

  async copyToClipboard() {
    console.log("Copy to clipboard called");
  }

  setLoadingState(loading) {
    console.log("Setting loading state:", loading);
  }

  // Add other methods as needed...
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing PopupController...");
  try {
    new PopupController();
  } catch (error) {
    console.error("Failed to initialize PopupController:", error);
  }
});
