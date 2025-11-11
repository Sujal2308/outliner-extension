/**
 * T5-based Summarization Engine for Outliner AI
 * Uses TensorFlow.js to run T5-small model locally in the browser
 */

class T5Summarizer {
  constructor() {
    this.model = null;
    this.tokenizer = null;
    this.isLoading = false;
    this.isReady = false;
    this.maxInputLength = 512; // T5-small limit
    this.maxOutputLength = 150;
  }

  async initialize() {
    if (this.isReady || this.isLoading) {
      return this.isReady;
    }

    this.isLoading = true;

    try {
      // Check if we have enough memory (T5-small is ~240MB)
      const memory = performance.memory;
      if (memory && memory.usedJSHeapSize > 200 * 1024 * 1024) {
        console.warn(
          "Insufficient memory for T5 model, falling back to local summarizer"
        );
        return false;
      }

      console.log("Loading T5-small model...");

      // Load model from TensorFlow Hub or local cache
      this.model = await tf.loadLayersModel("/models/t5-small/model.json");

      // Load tokenizer
      const tokenizerResponse = await fetch("/models/t5-small/tokenizer.json");
      this.tokenizer = await tokenizerResponse.json();

      this.isReady = true;
      console.log("T5 model loaded successfully");
      return true;
    } catch (error) {
      console.error("Failed to load T5 model:", error);
      this.isReady = false;
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  async summarize(text, options = {}) {
    if (!this.isReady) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error(
          "T5 model not available, falling back to local summarizer"
        );
      }
    }

    const {
      mode = "brief",
      maxLength = this.getMaxLengthForMode(mode),
      minLength = Math.floor(maxLength * 0.3),
    } = options;

    try {
      // Preprocess text
      const processedText = this.preprocessText(text);

      // Tokenize input
      const inputTokens = this.tokenize(`summarize: ${processedText}`);

      // Run inference
      const outputTokens = await this.model.predict(inputTokens);

      // Decode output
      const summary = this.decode(outputTokens);

      // Post-process
      const finalSummary = this.postprocessSummary(summary, mode);

      return {
        summary: finalSummary,
        method: "t5-local",
        processingTime: Date.now() - startTime,
        confidence: this.calculateConfidence(summary),
      };
    } catch (error) {
      console.error("T5 summarization failed:", error);
      throw new Error("T5 processing failed, falling back to local summarizer");
    }
  }

  preprocessText(text) {
    // Clean and truncate text to fit T5 input limits
    let cleaned = text
      .replace(/\s+/g, " ")
      .replace(/[^\w\s.,!?;:-]/g, "")
      .trim();

    // Truncate to token limit (roughly 4 chars per token)
    if (cleaned.length > this.maxInputLength * 4) {
      cleaned = cleaned.substring(0, this.maxInputLength * 4);
      // Try to end at a sentence boundary
      const lastSentence = cleaned.lastIndexOf(".");
      if (lastSentence > cleaned.length * 0.8) {
        cleaned = cleaned.substring(0, lastSentence + 1);
      }
    }

    return cleaned;
  }

  tokenize(text) {
    // Simple tokenization - in reality, you'd use the actual T5 tokenizer
    // This is a placeholder for the actual tokenization logic
    const tokens = text.toLowerCase().split(/\s+/);
    return tf.tensor2d([
      tokens.map((token) => this.tokenizer.vocab[token] || 0),
    ]);
  }

  decode(tokens) {
    // Placeholder for actual T5 decoding
    // In reality, this would convert token IDs back to text
    return "This is a placeholder T5 summary. The actual implementation would decode the model output tokens back to readable text.";
  }

  postprocessSummary(summary, mode) {
    switch (mode) {
      case "bullets":
        return this.convertToBullets(summary);
      case "detailed":
        return this.expandSummary(summary);
      default:
        return summary;
    }
  }

  convertToBullets(summary) {
    const sentences = summary
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 10);
    return sentences.map((s) => `• ${s.trim()}`).join("\n");
  }

  expandSummary(summary) {
    // For detailed mode, we could run the model multiple times
    // or use a different prompt
    return summary;
  }

  calculateConfidence(summary) {
    // Simple confidence metric based on summary quality indicators
    const hasGoodLength = summary.length > 50 && summary.length < 500;
    const hasProperSentences = /[.!?]/.test(summary);
    const notTooRepetitive = !this.isRepetitive(summary);

    return (hasGoodLength + hasProperSentences + notTooRepetitive) / 3;
  }

  isRepetitive(text) {
    const words = text.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    return uniqueWords.size / words.length < 0.7;
  }

  getMaxLengthForMode(mode) {
    switch (mode) {
      case "brief":
        return 100;
      case "detailed":
        return 200;
      case "bullets":
        return 150;
      default:
        return 100;
    }
  }

  dispose() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.isReady = false;
  }
}

// Export for use in background script
if (typeof module !== "undefined" && module.exports) {
  module.exports = T5Summarizer;
} else {
  window.T5Summarizer = T5Summarizer;
}
