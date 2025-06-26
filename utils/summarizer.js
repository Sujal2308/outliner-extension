/**
 * Text Summarization Engine for Outliner AI
 * Enhanced version with content filtering and AI-like validation
 */

class TextSummarizer {
  constructor() {
    this.stopWords = new Set([
      "a",
      "an",
      "and",
      "are",
      "as",
      "at",
      "be",
      "by",
      "for",
      "from",
      "has",
      "he",
      "in",
      "is",
      "it",
      "its",
      "of",
      "on",
      "that",
      "the",
      "to",
      "was",
      "will",
      "with",
      "would",
      "could",
      "should",
      "shall",
      "may",
      "might",
      "can",
      "must",
      "ought",
      "i",
      "you",
      "we",
      "they",
      "she",
      "him",
      "her",
      "us",
      "them",
      "this",
      "these",
      "those",
      "there",
      "then",
      "than",
      "also",
      "just",
      "only",
      "but",
      "or",
      "so",
      "very",
      "all",
      "any",
      "both",
      "each",
      "few",
      "more",
      "most",
      "other",
      "some",
      "such",
      "no",
      "nor",
      "not",
      "own",
      "same",
      "too",
    ]);

    // Improved transition words for better coherence
    this.transitionWords = {
      cause: [
        "because",
        "since",
        "due to",
        "as a result",
        "therefore",
        "thus",
        "consequently",
      ],
      contrast: [
        "however",
        "but",
        "although",
        "despite",
        "while",
        "whereas",
        "on the other hand",
      ],
      addition: [
        "also",
        "furthermore",
        "moreover",
        "additionally",
        "in addition",
        "besides",
      ],
      sequence: [
        "first",
        "second",
        "next",
        "then",
        "finally",
        "lastly",
        "subsequently",
      ],
    };

    // Patterns to identify and filter out irrelevant content
    this.irrelevantPatterns = [
      // Navigation and UI elements
      /^(menu|navigation|nav|header|footer|sidebar|breadcrumb)/i,
      /^(click|tap|press|select|choose|visit|go to|see more|read more)/i,
      /^(home|about|contact|privacy|terms|login|register|sign in|sign up)/i,
      /^(search|filter|sort|view|show|hide|toggle|expand|collapse)/i,

      // Advertising and promotional content
      /^(advertisement|ad|sponsored|promo|offer|deal|discount|sale)/i,
      /^(subscribe|newsletter|follow|like|share|tweet|facebook|twitter)/i,
      /^(buy now|order now|shop|cart|checkout|purchase|price|\$\d+)/i,

      // Copyright, legal, and website metadata
      /^(copyright|©|\d{4}|all rights reserved|powered by|created by)/i,
      /^(cookies|javascript|browser|enable|disable|support|help)/i,
      /^(loading|error|404|page not found|server|database)/i,
      /(terms of use|privacy policy|cookie policy|gdpr|legal notice)/i,
      /(examples? might be simplified|tutorials.*reviewed|cannot warrant)/i,
      /(while using.*you agree|copyright \d{4}.*by)/i,
      /^(w3schools|refsnes data|powered by w3\.css)/i,

      // Educational website disclaimers and common footers
      /^(examples? are|tutorials|references|constantly reviewed)/i,
      /^(simplified to improve|reviewed to avoid errors)/i,
      /^(but we cannot warrant|full correctness)/i,
      /^(while using.*agree)/i,
      /^(see the|view the|check the|visit)/i,

      // Date/time stamps without context
      /^\d{1,2}\/\d{1,2}\/\d{2,4}$|^\d{1,2}-\d{1,2}-\d{2,4}$/,
      /^(posted|published|updated|last modified|created):\s*\d/i,

      // Short meaningless phrases
      /^(yes|no|ok|okay|sure|maybe|perhaps|possibly)\.?$/i,
      /^.{1,15}$/, // Very short sentences likely not meaningful

      // Website-specific patterns
      /\b(w3schools|codecademy|stackoverflow|github|youtube|facebook|twitter|instagram)\b/i,
      /(powered by|hosted by|built with|created with)/i,
    ];

    // Keywords that indicate high-quality content
    this.qualityIndicators = [
      // Academic and informative terms
      "research",
      "study",
      "analysis",
      "findings",
      "results",
      "conclusion",
      "evidence",
      "data",
      "statistics",
      "report",
      "survey",
      "experiment",

      // Explanatory terms
      "because",
      "therefore",
      "however",
      "furthermore",
      "moreover",
      "consequently",
      "specifically",
      "particularly",
      "especially",
      "importantly",
      "significantly",

      // Content structure indicators
      "introduction",
      "background",
      "methodology",
      "discussion",
      "summary",
      "overview",
      "review",
      "comparison",
      "evaluation",
      "assessment",

      // Problem-solution indicators
      "problem",
      "solution",
      "challenge",
      "approach",
      "strategy",
      "method",
      "process",
      "procedure",
      "technique",
      "implementation",
      "application",
    ];

    // Patterns that suggest low-quality or irrelevant content
    this.lowQualityPatterns = [
      /^(click here|read more|see more|learn more|find out|discover)/i,
      /^(this|that|it|he|she|they)\s+(is|was|are|were)\s+/i,
      /^\w+\s+(said|says|told|asked|replied|responded)/i,
      /^(enter|type|input|select|choose)\s+/i,
      /^\d+\s+(comments?|replies?|likes?|shares?|views?)/i,
      // Educational website specific patterns
      /simplified to improve.*reading/i,
      /constantly reviewed.*avoid errors/i,
      /cannot warrant.*correctness/i,
      /agree.*terms.*privacy/i,
      /copyright.*refsnes.*data/i,
      /all rights reserved/i,
      /powered by.*css/i,
    ];
  }

  async generateSummary(content, mode, options = {}) {
    try {
      const { title, originalWordCount } = options;

      // Clean and validate content
      const cleanContent = this.cleanContent(content);
      if (!cleanContent || cleanContent.length < 100) {
        throw new Error("Content too short to summarize effectively");
      }

      // Extract meaningful sentences
      const sentences = this.extractSentences(cleanContent);
      if (sentences.length < 3) {
        throw new Error("Not enough sentences for meaningful summary");
      }

      // Analyze content structure and importance
      const analysis = this.analyzeContent(sentences, title);

      // Generate coherent summary based on mode
      let summary;
      switch (mode) {
        case "brief":
          summary = this.createBriefSummary(analysis, originalWordCount);
          break;
        case "detailed":
          summary = this.createDetailedSummary(analysis, originalWordCount);
          break;
        case "bullets":
          summary = this.createBulletSummary(analysis, originalWordCount);
          break;
        default:
          throw new Error(`Unknown summarization mode: ${mode}`);
      }

      // Validate the generated summary
      const validation = this.validateSummary(summary, cleanContent, mode);

      // If summary fails validation, try to improve it
      if (!validation.isValid && validation.issues.length > 0) {
        console.warn("Summary validation failed:", validation.issues);

        // Try to regenerate with stricter filtering
        const betterAnalysis = analysis.filter(
          (sentence) => sentence.score > 6
        );
        if (betterAnalysis.length > 0) {
          switch (mode) {
            case "brief":
              summary = this.createBriefSummary(
                betterAnalysis,
                originalWordCount
              );
              break;
            case "detailed":
              summary = this.createDetailedSummary(
                betterAnalysis,
                originalWordCount
              );
              break;
            case "bullets":
              summary = this.createBulletSummary(
                betterAnalysis,
                originalWordCount
              );
              break;
          }

          // Re-validate
          const secondValidation = this.validateSummary(
            summary,
            cleanContent,
            mode
          );
          if (!secondValidation.isValid) {
            console.warn(
              "Second attempt also failed validation. Using fallback summary."
            );
            summary = this.createFallbackSummary(analysis, mode);
          }
        }
      }

      return summary;
    } catch (error) {
      console.error("Summarization error:", error);
      throw error;
    }
  }

  cleanContent(content) {
    // Step 1: Remove obvious irrelevant content
    let cleaned = content
      // Remove navigation, menus, etc.
      .replace(
        /\b(home|about|contact|menu|navigation|sidebar|footer|header|breadcrumb)\b/gi,
        ""
      )
      // Remove advertising and promotional content
      .replace(
        /\b(advertisement|ad|sponsored|promo|subscribe|newsletter|follow)\b/gi,
        ""
      )
      // Remove UI elements and actions
      .replace(
        /\b(click|tap|press|select|choose|visit|go to|see more|read more)\b/gi,
        ""
      )
      // Remove social media and sharing
      .replace(
        /\b(facebook|twitter|instagram|linkedin|youtube|share|like|tweet)\b/gi,
        ""
      )
      // Remove copyright and legal notices
      .replace(/copyright \d{4}.*?by [^.]*\./gi, "")
      .replace(/all rights reserved.*?\./gi, "")
      .replace(/powered by [^.]*\./gi, "")
      .replace(/terms of use.*?privacy policy.*?\./gi, "")
      // Remove educational site disclaimers
      .replace(/examples? might be simplified.*?\./gi, "")
      .replace(/tutorials.*?constantly reviewed.*?\./gi, "")
      .replace(/while using.*?you agree.*?\./gi, "")
      .replace(/but we cannot warrant.*?\./gi, "")
      // Remove specific website mentions
      .replace(/\b(w3schools|refsnes data|w3\.css)\b/gi, "")
      // Remove URLs and emails
      .replace(/https?:\/\/[^\s]+/g, "")
      .replace(/\S+@\S+\.\S+/g, "")
      // Remove excessive punctuation and special characters
      .replace(/[^\w\s.,!?;:-]/g, " ")
      // Normalize whitespace
      .replace(/\s+/g, " ")
      .trim();

    // Step 2: Filter out sentences that match irrelevant patterns
    const sentences = cleaned.split(/(?<=[.!?])\s+/);
    const filteredSentences = sentences.filter((sentence) => {
      const trimmed = sentence.trim();

      // Skip empty or very short sentences
      if (trimmed.length < 25) return false;

      // Check against irrelevant patterns
      return !this.irrelevantPatterns.some((pattern) => pattern.test(trimmed));
    });

    return filteredSentences.join(" ").trim();
  }

  extractSentences(content) {
    // Split into sentences more intelligently
    const rawSentences = content
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    return rawSentences
      .filter((sentence) => this.isQualitySentence(sentence))
      .map((sentence, index) => ({
        text: sentence,
        index,
        wordCount: sentence.split(/\s+/).length,
        hasNumbers: /\d+/.test(sentence),
        hasImportantWords: this.hasImportantIndicators(sentence),
      }));
  }

  isQualitySentence(sentence) {
    const wordCount = sentence.split(/\s+/).length;

    // Basic quality filters
    if (wordCount < 6 || wordCount > 60) return false;
    if (!/[a-zA-Z]/.test(sentence)) return false;
    if (/^[A-Z\s]+$/.test(sentence)) return false; // All caps headers

    // Specific filters for educational website footers and disclaimers
    const educationalSitePatterns = [
      /examples? might be simplified/i,
      /tutorials.*reviewed/i,
      /cannot warrant.*correctness/i,
      /while using.*agree/i,
      /copyright.*refsnes/i,
      /powered by w3/i,
      /w3schools/i,
      /terms of use.*privacy/i,
      /constantly reviewed to avoid/i,
    ];

    if (educationalSitePatterns.some((pattern) => pattern.test(sentence))) {
      return false;
    }

    // Check against low-quality patterns
    if (this.lowQualityPatterns.some((pattern) => pattern.test(sentence))) {
      return false;
    }

    // Must have meaningful content (not just pronouns and articles)
    const words = sentence.toLowerCase().split(/\s+/);
    const meaningfulWords = words.filter(
      (word) => !this.stopWords.has(word) && word.length > 2
    );

    if (meaningfulWords.length < 3) return false;

    // Must have a verb (basic grammar check)
    const hasVerb =
      /\b(is|are|was|were|have|has|had|do|does|did|will|would|can|could|should|shall|may|might|must|make|makes|take|takes|get|gets|go|goes|come|comes|see|sees|know|knows|think|thinks|say|says|tell|tells|show|shows|give|gives|work|works|use|uses|help|helps|need|needs|want|wants|find|finds|become|becomes|include|includes|provide|provides|allow|allows|create|creates|offer|offers|require|requires|explain|explains|describe|describes|discuss|discusses|analyze|analyzes|examine|examines|explore|explores|investigate|investigates|demonstrate|demonstrates|illustrate|illustrates|reveal|reveals|suggest|suggests|indicate|indicates|conclude|concludes|determine|determines|establish|establishes|develop|develops|implement|implements|apply|applies|consider|considers|evaluate|evaluates|assess|assesses|compare|compares|contrast|contrasts|focus|focuses|emphasize|emphasizes|highlight|highlights|address|addresses|solve|solves|resolve|resolves|improve|improves|enhance|enhances|increase|increases|reduce|reduces|prevent|prevents|ensure|ensures|maintain|maintains|support|supports|enable|enables|promote|promotes|encourage|encourages|facilitate|facilitates)\b/i.test(
        sentence
      );

    if (!hasVerb) return false;

    // Bonus for quality indicators
    const hasQualityIndicators = this.qualityIndicators.some((indicator) =>
      sentence.toLowerCase().includes(indicator)
    );

    // Additional quality checks
    const hasProperStructure =
      /^[A-Z]/.test(sentence) && /[.!?]$/.test(sentence);
    const notAllNumbers = !/^\d+[\s\d]*$/.test(sentence);
    const hasSubstantiveContent = meaningfulWords.length >= wordCount * 0.4;

    return hasProperStructure && notAllNumbers && hasSubstantiveContent;
  }

  hasImportantIndicators(sentence) {
    const importantPatterns = [
      /\b(important|significant|key|main|primary|essential|crucial|critical|major)\b/i,
      /\b(result|conclusion|finding|discovery|research|study|analysis)\b/i,
      /\b(shows|demonstrates|proves|indicates|suggests|reveals|confirms)\b/i,
      /\b(however|therefore|thus|consequently|as a result|in conclusion|overall)\b/i,
      /\b(according to|experts|scientists|researchers|study)\b/i,
    ];

    return importantPatterns.some((pattern) => pattern.test(sentence));
  }

  analyzeContent(sentences, title = "") {
    // Calculate importance scores that consider logical flow
    const scoredSentences = sentences.map((sentence) => {
      let score = 0;

      // Position importance (intro and conclusion matter)
      const position = sentence.index / sentences.length;
      if (position < 0.2 || position > 0.8) score += 3;
      if (position < 0.1 || position > 0.9) score += 2;

      // Length sweet spot (not too short, not too long)
      if (sentence.wordCount >= 8 && sentence.wordCount <= 25) score += 3;
      else if (sentence.wordCount >= 6 && sentence.wordCount <= 30) score += 1;

      // Important indicators
      if (sentence.hasImportantWords) score += 4;

      // Numbers and facts (often important)
      if (sentence.hasNumbers) score += 2;

      // Title relevance
      if (title) {
        const titleWords = title
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 3);
        const sentenceLower = sentence.text.toLowerCase();
        const matches = titleWords.filter((word) =>
          sentenceLower.includes(word)
        ).length;
        score += matches * 2;
      }

      // Coherence indicators (transition words)
      Object.values(this.transitionWords).forEach((transitions) => {
        if (transitions.some((t) => sentence.text.toLowerCase().includes(t))) {
          score += 2;
        }
      });

      return {
        ...sentence,
        score: Math.max(0, score),
      };
    });

    // Sort by score but maintain some positional logic
    return scoredSentences.sort((a, b) => {
      // If scores are close, prefer earlier sentences for intro context
      if (Math.abs(a.score - b.score) <= 1) {
        return a.index - b.index;
      }
      return b.score - a.score;
    });
  }

  createBriefSummary(analysis, originalWordCount) {
    // Brief: 1-2 sentences that capture the essence
    const topSentences = analysis.slice(0, 3);

    // Find the best combination for coherent brief summary
    let summary = "";

    // Start with highest scoring sentence
    summary = topSentences[0].text;

    // If original content is substantial, add one coherent supporting sentence
    if (originalWordCount > 300 && topSentences.length > 1) {
      // Look for a sentence that logically follows or complements
      const supporting = topSentences
        .slice(1)
        .find(
          (s) => s.score > 5 && this.isCoherentFollowup(topSentences[0], s)
        );

      if (supporting) {
        summary += " " + supporting.text;
      }
    }

    return this.cleanupSummary(summary);
  }

  createDetailedSummary(analysis, originalWordCount) {
    // Detailed: 3-6 sentences with logical flow
    const targetCount = Math.min(
      6,
      Math.max(3, Math.ceil(originalWordCount / 150))
    );

    // Select sentences that maintain narrative coherence
    const selectedSentences = this.selectCoherentSentences(
      analysis,
      targetCount
    );

    // Arrange in logical order (roughly following original order)
    const orderedSentences = selectedSentences.sort(
      (a, b) => a.index - b.index
    );

    // Create flowing summary with proper connections
    let summary = "";
    orderedSentences.forEach((sentence, i) => {
      if (i === 0) {
        summary = sentence.text;
      } else {
        // Add appropriate transition if needed
        const transition = this.findTransition(
          orderedSentences[i - 1],
          sentence
        );
        summary += (transition ? ` ${transition} ` : " ") + sentence.text;
      }
    });

    return this.cleanupSummary(summary);
  }

  createBulletSummary(analysis, originalWordCount) {
    // Bullets: 3-5 distinct key points
    const targetCount = Math.min(
      5,
      Math.max(3, Math.ceil(originalWordCount / 200))
    );

    // Select diverse points that don't overlap
    const keyPoints = this.selectDiversePoints(analysis, targetCount);

    return keyPoints
      .map((point, index) => {
        const cleanText = point.text.replace(/^[.!?]+/, "").trim();
        return `• ${cleanText}`;
      })
      .join("\n");
  }

  selectCoherentSentences(analysis, targetCount) {
    const selected = [];
    const used = new Set();

    // Always include the top sentence
    selected.push(analysis[0]);
    used.add(analysis[0].index);

    // Add sentences that maintain coherence
    for (let i = 1; i < analysis.length && selected.length < targetCount; i++) {
      const candidate = analysis[i];

      if (used.has(candidate.index)) continue;

      // Check if this sentence adds value and maintains coherence
      const isCoherent = selected.some((existing) =>
        this.isCoherentFollowup(existing, candidate)
      );

      if (isCoherent || candidate.score > 8) {
        selected.push(candidate);
        used.add(candidate.index);
      }
    }

    return selected;
  }

  selectDiversePoints(analysis, targetCount) {
    const selected = [];
    const usedKeywords = new Set();

    for (const sentence of analysis) {
      if (selected.length >= targetCount) break;

      // Extract key concepts from this sentence
      const keywords = this.extractKeywords(sentence.text);

      // Check if this adds new information
      const hasNewInfo = keywords.some((word) => !usedKeywords.has(word));

      if (hasNewInfo || selected.length === 0) {
        selected.push(sentence);
        keywords.forEach((word) => usedKeywords.add(word));
      }
    }

    return selected;
  }

  isCoherentFollowup(first, second) {
    // Check if second sentence logically follows first
    const gap = Math.abs(second.index - first.index);

    // Prefer sentences that are close in original position
    if (gap <= 3) return true;

    // Check for thematic similarity
    const firstKeywords = this.extractKeywords(first.text);
    const secondKeywords = this.extractKeywords(second.text);
    const overlap = firstKeywords.filter((w) =>
      secondKeywords.includes(w)
    ).length;

    return overlap >= 1;
  }

  findTransition(prev, current) {
    // Simple transition detection - in practice, this could be more sophisticated
    const prevText = prev.text.toLowerCase();
    const currentText = current.text.toLowerCase();

    // Check if current sentence already has a transition
    if (
      Object.values(this.transitionWords).some((transitions) =>
        transitions.some((t) => currentText.startsWith(t))
      )
    ) {
      return null; // Already has transition
    }

    // Add simple transitions based on content relationship
    if (currentText.includes("however") || currentText.includes("but")) {
      return null;
    }

    if (prev.hasNumbers && current.hasNumbers) {
      return "Additionally,";
    }

    return null; // Default: no transition
  }

  extractKeywords(text) {
    return text
      .toLowerCase()
      .split(/\s+/)
      .map((word) => word.replace(/[^\w]/g, ""))
      .filter((word) => word.length > 3)
      .filter((word) => !this.stopWords.has(word))
      .slice(0, 5); // Top 5 keywords
  }

  /**
   * Validates if the generated summary makes sense and is coherent
   * Acts as an AI-like quality checker
   */
  validateSummary(summary, originalContent, mode) {
    const validation = {
      isValid: true,
      score: 0,
      issues: [],
      suggestions: [],
    };

    // Check basic requirements
    const sentences = summary
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    const wordCount = summary.split(/\s+/).length;

    // Minimum content requirements
    if (wordCount < 10) {
      validation.isValid = false;
      validation.issues.push("Summary too short to be meaningful");
      validation.suggestions.push("Include more substantial content");
    }

    if (sentences.length < 1) {
      validation.isValid = false;
      validation.issues.push("No complete sentences found");
      validation.suggestions.push("Ensure summary contains complete thoughts");
    }

    // Check for repetition
    const words = summary.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const repetitionRatio = uniqueWords.size / words.length;

    if (repetitionRatio < 0.6) {
      validation.issues.push("High repetition detected");
      validation.suggestions.push("Reduce redundant information");
      validation.score -= 2;
    } else {
      validation.score += 2;
    }

    // Check for quality indicators
    const hasQualityContent = this.qualityIndicators.some((indicator) =>
      summary.toLowerCase().includes(indicator)
    );

    if (hasQualityContent) {
      validation.score += 3;
    }

    // Check for low-quality patterns
    const hasLowQualityContent = this.lowQualityPatterns.some((pattern) =>
      pattern.test(summary)
    );

    if (hasLowQualityContent) {
      validation.isValid = false;
      validation.issues.push("Contains low-quality or irrelevant content");
      validation.suggestions.push("Focus on main article content");
      validation.score -= 5;
    }

    // Check coherence between sentences
    if (sentences.length > 1) {
      let coherenceScore = 0;
      for (let i = 1; i < sentences.length; i++) {
        if (this.sentencesAreCoherent(sentences[i - 1], sentences[i])) {
          coherenceScore++;
        }
      }

      const coherenceRatio = coherenceScore / (sentences.length - 1);
      if (coherenceRatio < 0.5) {
        validation.issues.push("Summary lacks logical flow");
        validation.suggestions.push(
          "Improve sentence connections and logical order"
        );
        validation.score -= 2;
      } else {
        validation.score += 2;
      }
    }

    // Check if summary relates to original content
    const originalWords = originalContent.toLowerCase().split(/\s+/);
    const summaryWords = summary.toLowerCase().split(/\s+/);
    const overlap = summaryWords.filter(
      (word) => originalWords.includes(word) && !this.stopWords.has(word)
    ).length;

    const relevanceRatio = overlap / summaryWords.length;
    if (relevanceRatio < 0.3) {
      validation.isValid = false;
      validation.issues.push("Summary seems unrelated to original content");
      validation.suggestions.push(
        "Ensure summary reflects main article topics"
      );
      validation.score -= 5;
    } else if (relevanceRatio > 0.6) {
      validation.score += 3;
    }

    // Mode-specific validation
    switch (mode) {
      case "brief":
        if (wordCount > 50) {
          validation.issues.push("Brief summary should be more concise");
          validation.suggestions.push("Reduce to 1-2 key sentences");
        }
        break;
      case "detailed":
        if (wordCount < 50) {
          validation.issues.push(
            "Detailed summary should be more comprehensive"
          );
          validation.suggestions.push("Include more supporting details");
        }
        break;
      case "bullets":
        if (!summary.includes("•") && !summary.includes("-")) {
          validation.issues.push("Bullet format should use bullet points");
          validation.suggestions.push("Format as clear bullet points");
        }
        break;
    }

    // Final score calculation
    validation.score = Math.max(0, Math.min(10, validation.score + 5));

    // If score is too low, mark as invalid
    if (validation.score < 3) {
      validation.isValid = false;
      validation.issues.push("Overall quality score too low");
    }

    return validation;
  }

  /**
   * Checks if two sentences are coherent and logically connected
   */
  sentencesAreCoherent(sentence1, sentence2) {
    const s1 = sentence1.toLowerCase();
    const s2 = sentence2.toLowerCase();

    // Check for transition words
    const transitionWords = [
      "however",
      "therefore",
      "furthermore",
      "additionally",
      "moreover",
      "consequently",
      "meanwhile",
      "similarly",
      "in contrast",
      "as a result",
    ];
    const hasTransition = transitionWords.some((word) => s2.includes(word));

    if (hasTransition) return true;

    // Check for shared concepts
    const words1 = s1
      .split(/\s+/)
      .filter((w) => !this.stopWords.has(w) && w.length > 3);
    const words2 = s2
      .split(/\s+/)
      .filter((w) => !this.stopWords.has(w) && w.length > 3);

    const sharedWords = words1.filter((w) => words2.includes(w));
    return sharedWords.length > 0;
  }

  /**
   * Creates a fallback summary when validation fails
   */
  createFallbackSummary(analysis, mode) {
    // Use only the highest-scoring sentence(s) as a safe fallback
    const topSentences = analysis.slice(0, mode === "brief" ? 1 : 2);

    switch (mode) {
      case "brief":
        return this.cleanupSummary(topSentences[0].text);
      case "bullets":
        return topSentences.map((s) => `• ${s.text}`).join("\n");
      case "detailed":
      default:
        return this.cleanupSummary(topSentences.map((s) => s.text).join(" "));
    }
  }

  cleanupSummary(summary) {
    return summary
      .replace(/\s+/g, " ")
      .replace(/\.\s*\./g, ".")
      .trim();
  }
}
