/**
 * Text Summarization Engine for Outliner AI
 * Improved version focused on logical, coherent, and reliable summaries
 */

class TextSummarizer {
  constructor() {
    this.stopWords = new Set([
      "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "he", "in", "is", "it", "its", "of", "on", "that", "the", "to", "was", "will", "with", "would", "could", "should", "shall", "may", "might", "can", "must", "ought", "i", "you", "we", "they", "she", "him", "her", "us", "them", "this", "these", "those", "there", "then", "than", "also", "just", "only", "but", "or", "so", "very", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "own", "same", "too"
    ]);
    
    // Improved transition words for better coherence
    this.transitionWords = {
      cause: ["because", "since", "due to", "as a result", "therefore", "thus", "consequently"],
      contrast: ["however", "but", "although", "despite", "while", "whereas", "on the other hand"],
      addition: ["also", "furthermore", "moreover", "additionally", "in addition", "besides"],
      sequence: ["first", "second", "next", "then", "finally", "lastly", "subsequently"]
    };
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
      switch (mode) {
        case "brief":
          return this.createBriefSummary(analysis, originalWordCount);
        case "detailed":
          return this.createDetailedSummary(analysis, originalWordCount);
        case "bullets":
          return this.createBulletSummary(analysis, originalWordCount);
        default:
          throw new Error(`Unknown summarization mode: ${mode}`);
      }
    } catch (error) {
      console.error("Summarization error:", error);
      throw error;
    }
  }

  cleanContent(content) {
    return content
      // Remove navigation, menus, etc.
      .replace(/\b(home|about|contact|menu|navigation|sidebar|footer|header)\b/gi, '')
      // Remove URLs and emails
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/\S+@\S+\.\S+/g, '')
      // Remove excessive whitespace and normalize
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?;:-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  extractSentences(content) {
    // Split into sentences more intelligently
    const rawSentences = content
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    return rawSentences
      .filter(sentence => this.isQualitySentence(sentence))
      .map((sentence, index) => ({
        text: sentence,
        index,
        wordCount: sentence.split(/\s+/).length,
        hasNumbers: /\d+/.test(sentence),
        hasImportantWords: this.hasImportantIndicators(sentence)
      }));
  }

  isQualitySentence(sentence) {
    const wordCount = sentence.split(/\s+/).length;
    
    // Basic quality filters
    if (wordCount < 5 || wordCount > 50) return false;
    if (!/[a-zA-Z]/.test(sentence)) return false;
    if (/^[A-Z\s]+$/.test(sentence)) return false; // All caps headers
    
    // Must have a verb (basic grammar check)
    const hasVerb = /\b(is|are|was|were|have|has|had|do|does|did|will|would|can|could|should|shall|may|might|must|make|makes|take|takes|get|gets|go|goes|come|comes|see|sees|know|knows|think|thinks|say|says|tell|tells|show|shows|give|gives|work|works|use|uses|help|helps|need|needs|want|wants|find|finds|become|becomes|include|includes|provide|provides|allow|allows|create|creates|offer|offers|require|requires)\b/i.test(sentence);
    
    if (!hasVerb) return false;
    
    // Avoid navigation and UI elements
    const badPatterns = [
      /\b(click here|read more|subscribe|follow|share|like|comment)\b/i,
      /\b(menu|navigation|sidebar|footer|header|breadcrumb)\b/i,
      /\b(login|signup|register|download|install)\b/i,
      /\b(terms|privacy|policy|cookie|gdpr)\b/i
    ];
    
    return !badPatterns.some(pattern => pattern.test(sentence));
  }

  hasImportantIndicators(sentence) {
    const importantPatterns = [
      /\b(important|significant|key|main|primary|essential|crucial|critical|major)\b/i,
      /\b(result|conclusion|finding|discovery|research|study|analysis)\b/i,
      /\b(shows|demonstrates|proves|indicates|suggests|reveals|confirms)\b/i,
      /\b(however|therefore|thus|consequently|as a result|in conclusion|overall)\b/i,
      /\b(according to|experts|scientists|researchers|study)\b/i
    ];
    
    return importantPatterns.some(pattern => pattern.test(sentence));
  }

  analyzeContent(sentences, title = "") {
    // Calculate importance scores that consider logical flow
    const scoredSentences = sentences.map(sentence => {
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
        const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const sentenceLower = sentence.text.toLowerCase();
        const matches = titleWords.filter(word => sentenceLower.includes(word)).length;
        score += matches * 2;
      }
      
      // Coherence indicators (transition words)
      Object.values(this.transitionWords).forEach(transitions => {
        if (transitions.some(t => sentence.text.toLowerCase().includes(t))) {
          score += 2;
        }
      });
      
      return {
        ...sentence,
        score: Math.max(0, score)
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
      const supporting = topSentences.slice(1).find(s => 
        s.score > 5 && this.isCoherentFollowup(topSentences[0], s)
      );
      
      if (supporting) {
        summary += " " + supporting.text;
      }
    }
    
    return this.cleanupSummary(summary);
  }

  createDetailedSummary(analysis, originalWordCount) {
    // Detailed: 3-6 sentences with logical flow
    const targetCount = Math.min(6, Math.max(3, Math.ceil(originalWordCount / 150)));
    
    // Select sentences that maintain narrative coherence
    const selectedSentences = this.selectCoherentSentences(analysis, targetCount);
    
    // Arrange in logical order (roughly following original order)
    const orderedSentences = selectedSentences.sort((a, b) => a.index - b.index);
    
    // Create flowing summary with proper connections
    let summary = "";
    orderedSentences.forEach((sentence, i) => {
      if (i === 0) {
        summary = sentence.text;
      } else {
        // Add appropriate transition if needed
        const transition = this.findTransition(orderedSentences[i-1], sentence);
        summary += (transition ? ` ${transition} ` : " ") + sentence.text;
      }
    });
    
    return this.cleanupSummary(summary);
  }

  createBulletSummary(analysis, originalWordCount) {
    // Bullets: 3-5 distinct key points
    const targetCount = Math.min(5, Math.max(3, Math.ceil(originalWordCount / 200)));
    
    // Select diverse points that don't overlap
    const keyPoints = this.selectDiversePoints(analysis, targetCount);
    
    return keyPoints
      .map((point, index) => {
        const cleanText = point.text.replace(/^[.!?]+/, '').trim();
        return `• ${cleanText}`;
      })
      .join('\n');
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
      const isCoherent = selected.some(existing => 
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
      const hasNewInfo = keywords.some(word => !usedKeywords.has(word));
      
      if (hasNewInfo || selected.length === 0) {
        selected.push(sentence);
        keywords.forEach(word => usedKeywords.add(word));
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
    const overlap = firstKeywords.filter(w => secondKeywords.includes(w)).length;
    
    return overlap >= 1;
  }

  findTransition(prev, current) {
    // Simple transition detection - in practice, this could be more sophisticated
    const prevText = prev.text.toLowerCase();
    const currentText = current.text.toLowerCase();
    
    // Check if current sentence already has a transition
    if (Object.values(this.transitionWords).some(transitions => 
      transitions.some(t => currentText.startsWith(t))
    )) {
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
      .map(word => word.replace(/[^\w]/g, ''))
      .filter(word => word.length > 3)
      .filter(word => !this.stopWords.has(word))
      .slice(0, 5); // Top 5 keywords
  }

  cleanupSummary(summary) {
    return summary
      .replace(/\s+/g, ' ')
      .replace(/\.\s*\./g, '.')
      .trim();
  }
}

  generateBriefSummary(scoredSentences, originalWordCount) {
    // Brief mode: Focus on THE most important sentence + context
    // Target: 1-2 sentences, very concise, essential info only

    const mainSentence = scoredSentences[0]; // Highest scoring sentence
    let briefSummary = mainSentence.text;

    // If the text is very long, add one supporting sentence
    if (originalWordCount > 500 && scoredSentences.length > 1) {
      // Find a complementary sentence (different topic/aspect)
      const supportingSentence = this.findComplementarySentence(
        mainSentence,
        scoredSentences.slice(1, 6)
      );
      if (supportingSentence) {
        briefSummary += ` ${supportingSentence.text}`;
      }
    }

    // Compress and clean the brief summary
    return this.compressSentence(briefSummary, 50); // Max 50 words
  }

  generateDetailedSummary(scoredSentences, originalWordCount) {
    // Detailed mode: Comprehensive analysis with structure
    // Target: 4-8 sentences, organized by themes, includes context and details

    const targetSentences = Math.min(
      8,
      Math.max(4, Math.ceil(originalWordCount / 120))
    );

    // Group sentences by themes/topics for better organization
    const thematicGroups = this.groupSentencesByTheme(
      scoredSentences,
      targetSentences
    );

    let detailedSummary = "";

    // Add introduction if available
    const introSentence = this.findIntroductorySentence(scoredSentences);
    if (introSentence) {
      detailedSummary += `**Overview:** ${introSentence.text}\n\n`;
    }

    // Add thematic sections
    thematicGroups.forEach((group, index) => {
      if (group.sentences.length > 0) {
        const sectionTitle = this.generateSectionTitle(group.theme, index);
        detailedSummary += `**${sectionTitle}:** `;
        detailedSummary +=
          group.sentences.map((s) => s.text).join(" ") + "\n\n";
      }
    });

    // Add conclusion if available
    const conclusionSentence = this.findConclusionSentence(scoredSentences);
    if (
      conclusionSentence &&
      !detailedSummary.includes(conclusionSentence.text)
    ) {
      detailedSummary += `**Conclusion:** ${conclusionSentence.text}`;
    }

    return detailedSummary.trim();
  }

  generateBulletSummary(scoredSentences, originalWordCount) {
    // Bullets mode: Key actionable points and facts
    // Target: 3-6 bullets, each representing a distinct key point

    const targetBullets = Math.min(
      6,
      Math.max(3, Math.ceil(originalWordCount / 200))
    );

    // Extract different types of key points
    const keyPoints = this.extractKeyPoints(scoredSentences, targetBullets);

    return keyPoints
      .map((point, index) => {
        // Format each bullet point with appropriate emoji and structure
        const emoji = this.getBulletEmoji(point.type, index);
        const cleanText = this.formatBulletText(point.text);
        return `${emoji} ${cleanText}`;
      })
      .join("\n");
  }

  // Helper methods for enhanced summarization

  findComplementarySentence(mainSentence, candidates) {
    const mainKeywords = this.extractKeywords(mainSentence.text.toLowerCase());

    for (const candidate of candidates) {
      const candidateKeywords = this.extractKeywords(
        candidate.text.toLowerCase()
      );
      const overlap = mainKeywords.filter((word) =>
        candidateKeywords.includes(word)
      ).length;

      // Find sentence with minimal overlap (different topic) but still relevant
      if (overlap <= 2 && candidate.score > 5) {
        return candidate;
      }
    }
    return null;
  }

  compressSentence(text, maxWords) {
    const words = text.split(/\s+/);
    if (words.length <= maxWords) return text;

    // Remove filler words and compress
    const compressed = words
      .filter((word) => !this.stopWords.has(word.toLowerCase()))
      .slice(0, maxWords)
      .join(" ");

    return compressed + (words.length > maxWords ? "..." : "");
  }

  groupSentencesByTheme(scoredSentences, maxSentences) {
    // Simple thematic grouping based on keyword clusters
    const groups = [
      { theme: "main", sentences: [] },
      { theme: "details", sentences: [] },
      { theme: "implications", sentences: [] },
    ];

    const selectedSentences = scoredSentences.slice(0, maxSentences);

    selectedSentences.forEach((sentence, index) => {
      if (index < 2) {
        groups[0].sentences.push(sentence); // Main points
      } else if (
        this.containsNumbers(sentence.text) ||
        this.containsFactualIndicators(sentence.text)
      ) {
        groups[1].sentences.push(sentence); // Details/facts
      } else {
        groups[2].sentences.push(sentence); // Implications/analysis
      }
    });

    return groups.filter((group) => group.sentences.length > 0);
  }

  findIntroductorySentence(scoredSentences) {
    // Look for sentences in first 20% that introduce the topic
    const introSentences = scoredSentences.filter(
      (s) => s.position < scoredSentences.length * 0.2
    );
    return introSentences.find(
      (s) =>
        /\b(is|are|represents|introduces|describes|explains)\b/i.test(s.text) &&
        s.wordCount > 8
    );
  }

  findConclusionSentence(scoredSentences) {
    // Look for sentences in last 20% that conclude or summarize
    const conclusionSentences = scoredSentences.filter(
      (s) => s.position > scoredSentences.length * 0.8
    );
    return conclusionSentences.find((s) =>
      /\b(therefore|thus|in conclusion|overall|ultimately|finally)\b/i.test(
        s.text
      )
    );
  }

  generateSectionTitle(theme, index) {
    const titles = {
      main: ["Key Points", "Main Findings", "Core Information"],
      details: ["Details & Facts", "Specifics", "Data Points"],
      implications: ["Analysis", "Implications", "Insights"],
    };
    return titles[theme] ? titles[theme][0] : `Section ${index + 1}`;
  }

  extractKeyPoints(scoredSentences, targetCount) {
    const points = [];

    // Prioritize different types of information
    const factSentences = scoredSentences.filter(
      (s) =>
        this.containsNumbers(s.text) || this.containsFactualIndicators(s.text)
    );
    const actionSentences = scoredSentences.filter((s) =>
      this.containsActionWords(s.text)
    );
    const conclusionSentences = scoredSentences.filter((s) =>
      this.containsConclusionWords(s.text)
    );

    // Add top fact
    if (factSentences.length > 0) {
      points.push({ text: factSentences[0].text, type: "fact" });
    }

    // Add top action/process
    if (actionSentences.length > 0 && points.length < targetCount) {
      points.push({ text: actionSentences[0].text, type: "action" });
    }

    // Add conclusion
    if (conclusionSentences.length > 0 && points.length < targetCount) {
      points.push({ text: conclusionSentences[0].text, type: "conclusion" });
    }

    // Fill remaining slots with highest-scored sentences
    const remainingSlots = targetCount - points.length;
    const usedTexts = points.map((p) => p.text);
    const remainingSentences = scoredSentences
      .filter((s) => !usedTexts.includes(s.text))
      .slice(0, remainingSlots);

    remainingSentences.forEach((s) => {
      points.push({ text: s.text, type: "general" });
    });

    return points;
  }

  getBulletEmoji(type, index) {
    const emojis = {
      fact: "📊",
      action: "⚡",
      conclusion: "🎯",
      general: ["🔹", "🔸", "💡", "📌", "⭐", "🔍"][index] || "•",
    };
    return emojis[type] || emojis.general;
  }

  formatBulletText(text) {
    return text
      .replace(
        /^(However|Therefore|Thus|Moreover|Furthermore|Additionally|In addition|Also|Besides),?\s*/i,
        ""
      )
      .replace(/\s+/g, " ")
      .replace(/\.$/, "")
      .trim();
  }

  // Helper detection methods
  containsNumbers(text) {
    return /\d+/.test(text);
  }

  containsFactualIndicators(text) {
    return /\b(study|research|data|statistics|percent|found|discovered|shows|demonstrates|according to)\b/i.test(
      text
    );
  }

  containsActionWords(text) {
    return /\b(should|must|can|will|recommend|suggest|propose|implement|develop|create|establish)\b/i.test(
      text
    );
  }

  containsConclusionWords(text) {
    return /\b(therefore|thus|in conclusion|overall|ultimately|finally|as a result|consequently)\b/i.test(
      text
    );
  }
}
