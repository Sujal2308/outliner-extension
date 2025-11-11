class PopupController {class PopupController {

  constructor() {  constructor() {

    this.selectedMode = null;    this.selectedMode = "brief";

    this.currentTabId = null;    this.isProcessing = false;

    this.apiKey = null;    this.currentTabId = null;

    

    this.initElements();    this.initializeElements();

    this.attachListeners();    this.attachEventListeners();

    this.loadApiKey();    this.loadCurrentTab();

    this.loadCurrentTab();  }

  }

  initializeElements() {

  initElements() {    // UI Elements

    this.status = document.getElementById('status');    this.statusText = document.getElementById("statusText");

    this.modeButtons = document.querySelectorAll('.mode-btn');    this.modeButtons = document.querySelectorAll(".mode-btn");

    this.summarizeBtn = document.getElementById('summarizeBtn');    this.summarizeBtn = document.getElementById("summarizeBtn");

    this.loader = document.getElementById('loader');    this.btnLoader = document.getElementById("btnLoader");

    this.loaderText = document.getElementById('loaderText');    this.resultSection = document.getElementById("resultSection");

    this.loaderSubtext = document.getElementById('loaderSubtext');    this.resultContent = document.getElementById("resultContent");

    this.result = document.getElementById('result');    this.resultMeta = document.getElementById("resultMeta");

    this.resultBadge = document.getElementById('resultBadge');    this.copyBtn = document.getElementById("copyBtn");

    this.resultMeta = document.getElementById('resultMeta');    this.clearBtn = document.getElementById("clearBtn");

    this.resultContent = document.getElementById('resultContent');    this.wordCount = document.getElementById("wordCount");

    this.copyBtn = document.getElementById('copyBtn');  }

    this.newSummaryBtn = document.getElementById('newSummaryBtn');

    this.settingsToggle = document.getElementById('settingsToggle');  attachEventListeners() {

    this.settingsPanel = document.getElementById('settingsPanel');    // Mode selection

    this.apiKeyInput = document.getElementById('apiKeyInput');    this.modeButtons.forEach((btn) => {

    this.saveApiBtn = document.getElementById('saveApiBtn');      btn.addEventListener("click", (e) =>

    this.apiStatus = document.getElementById('apiStatus');        this.selectMode(e.target.closest(".mode-btn"))

  }      );

    });

  attachListeners() {

    this.modeButtons.forEach(btn => {    // Main action button

      btn.addEventListener('click', () => this.selectMode(btn));    this.summarizeBtn.addEventListener("click", () => this.summarizePage());

    });

    // Result actions

    this.summarizeBtn.addEventListener('click', () => this.summarize());    this.copyBtn.addEventListener("click", () => this.copyToClipboard());

    this.copyBtn.addEventListener('click', () => this.copyToClipboard());    this.clearBtn.addEventListener("click", () => this.clearResults());

    this.newSummaryBtn.addEventListener('click', () => this.reset());

    this.settingsToggle.addEventListener('click', () => this.toggleSettings());    // Listen for messages from background script

    this.saveApiBtn.addEventListener('click', () => this.saveApiKey());    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  }      this.handleMessage(message, sender, sendResponse);

    });

  async loadApiKey() {  }

    try {

      const result = await chrome.storage.sync.get('geminiApiKey');  async loadCurrentTab() {

      this.apiKey = result.geminiApiKey;    try {

            const [tab] = await chrome.tabs.query({

      if (this.apiKey) {        active: true,

        this.apiStatus.className = 'api-status configured';        currentWindow: true,

        this.apiStatus.textContent = '✅ API key configured';      });

        this.apiKeyInput.placeholder = 'API key saved (••••••••)';      this.currentTabId = tab.id;

      } else {

        this.apiStatus.className = 'api-status missing';      if (

        this.apiStatus.textContent = '⚠️ API key required for summarization';        tab.url.startsWith("chrome://") ||

      }        tab.url.startsWith("chrome-extension://")

    } catch (error) {      ) {

      console.error('Error loading API key:', error);        this.updateStatus("❌ Cannot analyze this page type", "error");

    }        this.summarizeBtn.disabled = true;

  }        return;

      }

  async loadCurrentTab() {

    try {      this.updateStatus("📄 Ready to analyze page");

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });      this.updateWordCount("Click summarize to start");

      this.currentTabId = tab.id;    } catch (error) {

            console.error("Error loading current tab:", error);

      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {      this.updateStatus("❌ Error loading page", "error");

        this.updateStatus('❌ Cannot summarize this page type');    }

        this.summarizeBtn.disabled = true;  }

      }

    } catch (error) {  selectMode(button) {

      console.error('Error loading tab:', error);    // Remove active class from all buttons

    }    this.modeButtons.forEach((btn) => btn.classList.remove("active"));

  }

    // Add active class to selected button

  selectMode(button) {    button.classList.add("active");

    this.modeButtons.forEach(btn => btn.classList.remove('active'));

    button.classList.add('active');    // Update selected mode

    this.selectedMode = button.dataset.mode;    this.selectedMode = button.dataset.mode;

    

    const modeNames = {    // Update status

      brief: '⚡ Brief mode selected',    const modeNames = {

      bullet: '📝 Bullet points mode selected',      brief: "Brief summary mode selected",

      comprehensive: '📋 Comprehensive mode selected'      detailed: "Detailed summary mode selected",

    };      bullets: "Bullet points mode selected",

        };

    this.updateStatus(modeNames[this.selectedMode] + ' - Ready to summarize!');

    this.summarizeBtn.disabled = false;    this.updateStatus(`✅ ${modeNames[this.selectedMode]}`);

  }  }



  async summarize() {  async summarizePage() {

    if (!this.selectedMode) {    if (this.isProcessing) return;

      this.updateStatus('❌ Please select a summary mode first');

      return;    try {

    }      this.setProcessingState(true);

      this.updateStatus("🔍 Extracting page content...");

    if (!this.apiKey) {

      this.updateStatus('❌ Please configure your Gemini API key first');      // Get page content from content script

      this.toggleSettings();      const response = await this.sendMessageToTab({

      return;        action: "extractContent",

    }      });



    try {      if (!response || !response.success) {

      this.setLoading(true);        throw new Error(response?.error || "Failed to extract content");

      this.updateStatus('🔍 Extracting page content...');      }

      

      // Extract content from page      const { content, title, wordCount } = response.data;

      const response = await chrome.tabs.sendMessage(this.currentTabId, {

        action: 'extractContent'      if (!content || content.trim().length < 50) {

      });        throw new Error("Insufficient content found on page");

            }

      if (!response || !response.success) {

        throw new Error(response?.error || 'Failed to extract content');      this.updateStatus("🤖 Generating summary...");

      }      this.updateWordCount(`Analyzing ${wordCount} words`);



      const { content, title, wordCount } = response.data;      // Send to background script for processing

            const summaryResponse = await chrome.runtime.sendMessage({

      this.updateLoader('🤖 Generating summary...', 'Powered by Gemini AI');        action: "generateSummary",

              data: {

      // Send to background for summarization          content,

      const summaryResponse = await chrome.runtime.sendMessage({          title,

        action: 'generateSummary',          mode: this.selectedMode,

        data: {          wordCount,

          content,        },

          title,      });

          mode: this.selectedMode,

          wordCount      if (!summaryResponse || !summaryResponse.success) {

        }        throw new Error(summaryResponse?.error || "Failed to generate summary");

      });      }

      

      if (!summaryResponse || !summaryResponse.success) {      this.displayResult(summaryResponse.data);

        throw new Error(summaryResponse?.error || 'Failed to generate summary');      this.updateStatus("✅ Summary generated successfully");

      }    } catch (error) {

            console.error("Error summarizing page:", error);

      this.displayResult(summaryResponse.data);      this.updateStatus(`❌ ${error.message}`, "error");

      this.updateStatus('✅ Summary generated successfully!');    } finally {

            this.setProcessingState(false);

    } catch (error) {    }

      console.error('Summarization error:', error);  }

      this.updateStatus('❌ ' + error.message);

      this.showError(error.message);  async sendMessageToTab(message) {

    } finally {    return new Promise((resolve) => {

      this.setLoading(false);      chrome.tabs.sendMessage(this.currentTabId, message, (response) => {

    }        if (chrome.runtime.lastError) {

  }          resolve({ success: false, error: chrome.runtime.lastError.message });

        } else {

  displayResult(data) {          resolve(response);

    const { summary, metadata } = data;        }

          });

    const modeLabels = {    });

      brief: 'BRIEF SUMMARY',  }

      bullet: 'BULLET POINTS',

      comprehensive: 'COMPREHENSIVE SUMMARY'  displayResult(data) {

    };    const { summary, mode, processingTime, originalWordCount } = data;

    

    this.resultBadge.textContent = modeLabels[this.selectedMode] || 'SUMMARY';    // Format content based on mode

        let formattedContent = this.formatSummaryContent(summary, mode);

    if (metadata.wordCount) {

      this.resultMeta.textContent = `${metadata.wordCount} words`;    this.resultContent.innerHTML = formattedContent;

    }

        // Update meta information

    if (this.selectedMode === 'bullet') {    const summaryWordCount = summary.split(/\s+/).length;

      const points = summary.split('\n').filter(p => p.trim());    const compressionRatio = Math.round(

      this.resultContent.innerHTML = '<ul>' +       (summaryWordCount / originalWordCount) * 100

        points.map(p => `<li>${p.replace(/^[•\-*]\s*/, '')}</li>`).join('') +     );

        '</ul>';

    } else {    this.resultMeta.textContent = `${summaryWordCount} words (${compressionRatio}% of original) • Generated in ${processingTime}ms`;

      this.resultContent.innerHTML = `<p>${summary}</p>`;

    }    // Show result section

        this.resultSection.style.display = "block";

    this.result.classList.add('show');

    this.result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });    // Update word count

  }    this.updateWordCount(`Summary: ${summaryWordCount} words`);

  }

  showError(message) {

    this.resultBadge.textContent = 'ERROR';  formatSummaryContent(summary, mode) {

    this.resultBadge.style.background = 'var(--error-color)';    switch (mode) {

    this.resultContent.innerHTML = `      case "bullets":

      <p style="color: var(--error-color);">        // Convert to bullet points if not already formatted

        <strong>⚠️ ${message}</strong>        if (!summary.includes("•") && !summary.includes("-")) {

      </p>          const sentences = summary

      <p style="margin-top: 12px; font-size: 13px; color: var(--text-secondary);">            .split(/[.!?]+/)

        ${message.includes('API key')             .filter((s) => s.trim().length > 10);

          ? 'Please configure your Gemini API key in settings.'           return (

          : 'Please try again or try a different webpage.'}            "<ul>" +

      </p>            sentences.map((s) => `<li>${s.trim()}</li>`).join("") +

    `;            "</ul>"

    this.result.classList.add('show');          );

  }        }

        return this.convertToBulletHTML(summary);

  async copyToClipboard() {

    try {      case "detailed":

      const text = this.resultContent.textContent;        return `<h4>Detailed Analysis:</h4>${this.formatParagraphs(summary)}`;

      await navigator.clipboard.writeText(text);

            case "brief":

      const originalText = this.copyBtn.textContent;      default:

      this.copyBtn.textContent = '✅ Copied!';        return this.formatParagraphs(summary);

      setTimeout(() => {    }

        this.copyBtn.textContent = originalText;  }

      }, 2000);

    } catch (error) {  convertToBulletHTML(text) {

      console.error('Copy failed:', error);    const lines = text.split("\n").filter((line) => line.trim().length > 0);

    }    const bullets = lines

  }      .map((line) => {

        const cleaned = line.replace(/^[-•*]\s*/, "").trim();

  reset() {        return cleaned ? `<li>${cleaned}</li>` : "";

    this.result.classList.remove('show');      })

    this.modeButtons.forEach(btn => btn.classList.remove('active'));      .filter(Boolean);

    this.selectedMode = null;

    this.summarizeBtn.disabled = true;    return bullets.length > 0

    this.updateStatus('📄 Select a summary mode to begin');      ? `<ul>${bullets.join("")}</ul>`

    this.resultBadge.style.background = '';      : this.formatParagraphs(text);

  }  }



  toggleSettings() {  formatParagraphs(text) {

    const isOpen = this.settingsPanel.classList.toggle('show');    return text

    document.getElementById('settingsToggleText').textContent =       .split("\n\n")

      isOpen ? 'Hide Settings' : 'API Settings';      .filter((p) => p.trim().length > 0)

  }      .map((p) => `<p>${p.trim()}</p>`)

      .join("");

  async saveApiKey() {  }

    const apiKey = this.apiKeyInput.value.trim();

      async copyToClipboard() {

    if (!apiKey) {    try {

      this.updateStatus('❌ Please enter an API key');      const textContent =

      return;        this.resultContent.textContent || this.resultContent.innerText;

    }      await navigator.clipboard.writeText(textContent);

    

    if (!apiKey.startsWith('AIza') || apiKey.length < 30) {      // Visual feedback

      this.updateStatus('❌ Invalid API key format');      const originalText = this.copyBtn.innerHTML;

      return;      this.copyBtn.innerHTML = "✓";

    }      setTimeout(() => {

            this.copyBtn.innerHTML = originalText;

    try {      }, 1000);

      await chrome.storage.sync.set({ geminiApiKey: apiKey });

            this.updateStatus("📋 Copied to clipboard");

      // Notify background script    } catch (error) {

      await chrome.runtime.sendMessage({      console.error("Error copying to clipboard:", error);

        action: 'saveApiKey',      this.updateStatus("❌ Failed to copy", "error");

        apiKey: apiKey    }

      });  }

      

      this.apiKey = apiKey;  clearResults() {

      this.apiStatus.className = 'api-status configured';    this.resultSection.style.display = "none";

      this.apiStatus.textContent = '✅ API key configured successfully';    this.resultContent.innerHTML = "";

      this.apiKeyInput.value = '';    this.resultMeta.textContent = "";

      this.apiKeyInput.placeholder = 'API key saved (••••••••)';    this.updateStatus("📄 Ready to summarize");

      this.updateStatus('✅ API key saved successfully');    this.updateWordCount("Ready");

        }

      setTimeout(() => this.toggleSettings(), 1500);

    } catch (error) {  setProcessingState(processing) {

      console.error('Error saving API key:', error);    this.isProcessing = processing;

      this.updateStatus('❌ Failed to save API key');    this.summarizeBtn.disabled = processing;

    }

  }    if (processing) {

      this.summarizeBtn.classList.add("loading");

  setLoading(loading) {    } else {

    this.summarizeBtn.disabled = loading;      this.summarizeBtn.classList.remove("loading");

    this.summarizeBtn.classList.toggle('loading', loading);    }

    this.loader.classList.toggle('show', loading);  }

    

    if (!loading) {  updateStatus(message, type = "info") {

      this.result.classList.remove('show');    this.statusText.textContent = message;

    }

  }    // Optional: Add visual indicators based on type

    const statusElement = document.querySelector(".status");

  updateLoader(text, subtext) {    statusElement.className = `status ${type}`;

    this.loaderText.textContent = text;  }

    this.loaderSubtext.textContent = subtext;

  }  updateWordCount(text) {

    this.wordCount.textContent = text;

  updateStatus(message) {  }

    this.status.textContent = message;

  }  handleMessage(message, sender, sendResponse) {

}    // Handle any messages from background script

    if (message.action === "updateStatus") {

// Initialize      this.updateStatus(message.status);

document.addEventListener('DOMContentLoaded', () => {    }

  new PopupController();

});    sendResponse({ success: true });

  }
}

// Initialize the popup when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new PopupController();
});
