/**
 * Content Script for Outliner AI Chrome Extension
 * Extracts and processes webpage content for summarization
 */

class ContentExtractor {
  constructor() {
    this.setupMessageListener();
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log("Content script received message:", message);

      if (message.action === "extractContent") {
        console.log("Processing extractContent request");

        this.extractContent()
          .then((data) => {
            console.log("Content extraction successful");
            sendResponse({ success: true, data });
          })
          .catch((error) => {
            console.error("Content extraction failed:", error);
            sendResponse({ success: false, error: error.message });
          });

        return true; // Indicates async response
      }

      // Always send a response to prevent channel closure
      sendResponse({ success: false, error: "Unknown action" });
      return false;
    });
  }

  async extractContent() {
    try {
      const content = this.extractMainContent();
      const title = this.extractTitle();
      const wordCount = this.countWords(content);
      const metadata = this.extractMetadata();

      return {
        content,
        title,
        wordCount,
        url: window.location.href,
        domain: window.location.hostname,
        ...metadata,
      };
    } catch (error) {
      throw new Error(`Content extraction failed: ${error.message}`);
    }
  }

  extractMainContent() {
    // Strategy 1: Try to find main content areas with enhanced scoring
    const contentSelectors = [
      "main",
      "article",
      '[role="main"]',
      ".main-content",
      ".content",
      ".post-content",
      ".entry-content",
      ".article-content",
      ".article-body",
      ".post-body",
      "#main-content",
      "#content",
      ".story-body",
      ".article-text",
    ];

    let bestContent = "";
    let bestScore = 0;

    // Try each selector and score the content
    for (const selector of contentSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const text = this.extractTextFromElement(element);
        const score = this.scoreContent(text, element);

        console.log(
          `Selector ${selector}: ${text.length} chars, score: ${score}`
        );

        if (score > bestScore && text.length > 200) {
          bestContent = text;
          bestScore = score;
        }
      }
    }

    // Strategy 2: If no good main content found, use smart body extraction
    if (bestScore < 50 || bestContent.length < 500) {
      console.log("Using smart body extraction");
      bestContent = this.smartBodyExtraction();
    }

    // Strategy 3: Enhanced fallback with paragraph analysis
    if (bestContent.length < 200) {
      console.log("Using paragraph analysis fallback");
      bestContent = this.extractLongestParagraphs();
    }

    return this.cleanContent(bestContent);
  }

  scoreContent(text, element) {
    let score = 0;

    // Length bonus (longer content is often better)
    score += Math.min(text.length / 100, 50);

    // Paragraph count (articles have multiple paragraphs)
    const paragraphs = text
      .split(/\n\s*\n/)
      .filter((p) => p.trim().length > 50);
    score += paragraphs.length * 5;

    // Sentence structure (well-formed sentences)
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20);
    score += sentences.length * 2;

    // Element specificity bonus
    const tagName = element.tagName?.toLowerCase();
    const className = element.className?.toLowerCase() || "";
    const id = element.id?.toLowerCase() || "";

    if (tagName === "article") score += 20;
    if (tagName === "main") score += 15;
    if (className.includes("content") || className.includes("article"))
      score += 10;
    if (className.includes("post") || className.includes("story")) score += 10;
    if (id.includes("content") || id.includes("article")) score += 10;

    // Penalty for navigation-like content
    if (
      className.includes("nav") ||
      className.includes("menu") ||
      className.includes("sidebar") ||
      className.includes("footer")
    ) {
      score -= 20;
    }

    // Penalty for repetitive or short content
    const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size;
    const totalWords = text.split(/\s+/).length;
    if (totalWords > 0 && uniqueWords / totalWords < 0.3) {
      score -= 15; // Repetitive content
    }

    return score;
  }

  smartBodyExtraction() {
    // Find all paragraphs and score them
    const paragraphs = Array.from(document.querySelectorAll("p"));
    const scoredParagraphs = paragraphs
      .map((p) => ({
        element: p,
        text: p.textContent.trim(),
        score: this.scoreParagraph(p),
      }))
      .filter((p) => p.text.length > 50 && p.score > 0)
      .sort((a, b) => b.score - a.score);

    // Take the top-scoring paragraphs that are likely part of the main content
    const mainParagraphs = scoredParagraphs
      .slice(0, Math.min(10, scoredParagraphs.length))
      .filter((p) => p.score >= Math.max(1, scoredParagraphs[0]?.score * 0.3));

    return mainParagraphs.map((p) => p.text).join("\n\n");
  }

  scoreParagraph(paragraph) {
    let score = 0;
    const text = paragraph.textContent.trim();

    // Length bonus
    score += Math.min(text.length / 50, 10);

    // Sentence count
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10);
    score += sentences.length * 2;

    // Check if paragraph is in a content-like container
    let parent = paragraph.parentElement;
    while (parent && parent !== document.body) {
      const className = parent.className?.toLowerCase() || "";
      const tagName = parent.tagName?.toLowerCase();

      if (tagName === "article" || tagName === "main") score += 5;
      if (
        className.includes("content") ||
        className.includes("article") ||
        className.includes("post") ||
        className.includes("story")
      )
        score += 3;
      if (
        className.includes("nav") ||
        className.includes("sidebar") ||
        className.includes("menu") ||
        className.includes("footer") ||
        className.includes("header")
      )
        score -= 5;

      parent = parent.parentElement;
    }

    // Penalty for navigation-like text
    const navKeywords = [
      "home",
      "about",
      "contact",
      "menu",
      "login",
      "search",
      "subscribe",
    ];
    const wordsInText = text.toLowerCase().split(/\s+/);
    const navWordCount = wordsInText.filter((word) =>
      navKeywords.includes(word)
    ).length;
    if (navWordCount / wordsInText.length > 0.2) {
      score -= 10;
    }

    return score;
  }

  extractLongestParagraphs() {
    // Get all text content and find the longest coherent sections
    const allParagraphs = Array.from(document.querySelectorAll("p, div"))
      .map((el) => el.textContent.trim())
      .filter((text) => text.length > 100)
      .sort((a, b) => b.length - a.length);

    return allParagraphs.slice(0, 5).join("\n\n");
  }

  extractFromBody() {
    // Clone body to avoid modifying original
    const bodyClone = document.body.cloneNode(true);

    // Enhanced list of unwanted elements
    const unwantedSelectors = [
      "script",
      "style",
      "nav",
      "header",
      "footer",
      "aside",
      "iframe",
      "noscript",
      // Navigation elements
      ".nav",
      ".navigation",
      ".menu",
      ".breadcrumb",
      ".breadcrumbs",
      "#nav",
      "#navigation",
      "#menu",
      '[role="navigation"]',
      '[role="banner"]',
      '[role="contentinfo"]',
      // Sidebar and widgets
      ".sidebar",
      ".widget",
      ".widgets",
      ".secondary",
      "#sidebar",
      "#widgets",
      // Ads and promotional content
      ".ads",
      ".advertisement",
      ".promo",
      ".sponsored",
      ".promotion",
      "[class*='ad-']",
      "[id*='ad-']",
      "[class*='ads-']",
      // Social and sharing
      ".social",
      ".social-media",
      ".share",
      ".share-buttons",
      ".sharing",
      ".follow",
      ".subscribe",
      ".newsletter",
      // Comments and user content
      ".comments",
      ".comment",
      ".comment-form",
      ".discussion",
      "#comments",
      "#comment-form",
      // Metadata and extras
      ".meta",
      ".metadata",
      ".tags",
      ".categories",
      ".author-info",
      ".date",
      ".timestamp",
      ".byline",
      // Related and suggested content
      ".related",
      ".related-posts",
      ".suggested",
      ".recommendations",
      ".more-from",
      ".you-might-like",
      // Popups and overlays
      ".popup",
      ".modal",
      ".overlay",
      ".lightbox",
      ".dialog",
      "[class*='popup']",
      "[class*='modal']",
      "[class*='overlay']",
      // Cookie and privacy notices
      "[class*='cookie']",
      "[class*='gdpr']",
      "[class*='privacy']",
      // Search and forms
      ".search",
      ".search-form",
      "form[role='search']",
      // Skip links and accessibility
      ".skip",
      ".screen-reader",
      ".visually-hidden",
      ".sr-only",
    ];

    // Remove unwanted elements
    unwantedSelectors.forEach((selector) => {
      try {
        const elements = bodyClone.querySelectorAll(selector);
        elements.forEach((el) => el.remove());
      } catch (e) {
        // Continue if selector is invalid
      }
    });

    // Also remove elements with unwanted attributes
    const allElements = bodyClone.querySelectorAll("*");
    allElements.forEach((el) => {
      const className = el.className?.toLowerCase() || "";
      const id = el.id?.toLowerCase() || "";
      const role = el.getAttribute("role")?.toLowerCase() || "";

      // Remove elements with navigation-like characteristics
      if (
        className.includes("nav") ||
        className.includes("menu") ||
        className.includes("header") ||
        className.includes("footer") ||
        className.includes("sidebar") ||
        className.includes("widget") ||
        id.includes("nav") ||
        id.includes("menu") ||
        id.includes("header") ||
        id.includes("footer") ||
        role === "navigation" ||
        role === "banner" ||
        role === "contentinfo"
      ) {
        el.remove();
      }
    });

    return this.extractTextFromElement(bodyClone);
  }

  extractTextFromElement(element) {
    // Get text while preserving some structure
    let text = "";

    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            return NodeFilter.FILTER_ACCEPT;
          }

          if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();

            // Skip unwanted elements
            if (
              ["script", "style", "nav", "header", "footer"].includes(tagName)
            ) {
              return NodeFilter.FILTER_REJECT;
            }

            // Accept block elements that might contain content
            if (
              [
                "p",
                "div",
                "article",
                "section",
                "h1",
                "h2",
                "h3",
                "h4",
                "h5",
                "h6",
                "li",
              ].includes(tagName)
            ) {
              return NodeFilter.FILTER_ACCEPT;
            }

            return NodeFilter.FILTER_SKIP;
          }

          return NodeFilter.FILTER_SKIP;
        },
      }
    );

    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.TEXT_NODE) {
        const textContent = node.textContent.trim();
        if (textContent.length > 0) {
          text += textContent + " ";
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();
        if (
          ["p", "div", "h1", "h2", "h3", "h4", "h5", "h6"].includes(tagName)
        ) {
          text += "\n";
        }
      }
    }

    return text;
  }

  extractTitle() {
    // Try multiple strategies to get the best title
    const titleSources = [
      () => document.querySelector("h1")?.textContent,
      () => document.querySelector(".title")?.textContent,
      () => document.querySelector(".post-title")?.textContent,
      () => document.querySelector('meta[property="og:title"]')?.content,
      () => document.querySelector('meta[name="twitter:title"]')?.content,
      () => document.title,
    ];

    for (const getTitle of titleSources) {
      try {
        const title = getTitle();
        if (title && title.trim().length > 0) {
          return title.trim();
        }
      } catch (e) {
        continue;
      }
    }

    return "Untitled Page";
  }

  extractMetadata() {
    const metadata = {};

    // Try to get description
    const descriptionSources = [
      () => document.querySelector('meta[name="description"]')?.content,
      () => document.querySelector('meta[property="og:description"]')?.content,
      () => document.querySelector('meta[name="twitter:description"]')?.content,
    ];

    for (const getDesc of descriptionSources) {
      try {
        const desc = getDesc();
        if (desc && desc.trim().length > 0) {
          metadata.description = desc.trim();
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // Try to get author
    const authorSources = [
      () => document.querySelector('meta[name="author"]')?.content,
      () => document.querySelector(".author")?.textContent,
      () => document.querySelector('[rel="author"]')?.textContent,
    ];

    for (const getAuthor of authorSources) {
      try {
        const author = getAuthor();
        if (author && author.trim().length > 0) {
          metadata.author = author.trim();
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // Try to get publication date
    const dateSelectors = [
      'meta[property="article:published_time"]',
      'meta[name="publish_date"]',
      "time[datetime]",
      ".publish-date",
      ".post-date",
    ];

    for (const selector of dateSelectors) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          const date =
            element.getAttribute("datetime") ||
            element.getAttribute("content") ||
            element.textContent;
          if (date && date.trim().length > 0) {
            metadata.publishDate = date.trim();
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }

    return metadata;
  }

  cleanContent(content) {
    if (!content) return "";

    // Split into lines and filter out low-quality fragments
    let lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Remove navigation-like lines and common website fragments
    const fragmentPatterns = [
      /^(home|about|contact|menu|login|search|subscribe|newsletter)$/i,
      /^(privacy policy|terms of service|cookie policy)$/i,
      /^(follow us|social media|share this)$/i,
      /^(advertisement|sponsored|promoted)$/i,
      /^(loading|please wait|redirecting)$/i,
      /^(prev|previous|next|continue|read more)$/i,
      /^(breadcrumbs?|navigation|site map)$/i,
      /^(sidebar|footer|header|banner)$/i,
      /^[^a-zA-Z]*$/, // Lines with no letters
      /^\d+$/, // Lines with only numbers
      /^.{1,10}$/, // Very short lines (likely fragments)
      /copy article link/i,
      /preview mode/i,
      /documentation/i,
      /learning objectives/i,
      /related content/i,
    ];

    lines = lines.filter((line) => {
      // Remove lines matching fragment patterns
      if (fragmentPatterns.some((pattern) => pattern.test(line))) {
        return false;
      }

      // Keep lines that look like proper sentences or headings
      if (
        line.length > 20 &&
        (line.includes(".") || line.includes("?") || line.includes("!"))
      ) {
        return true;
      }

      // Keep longer lines that might be headings
      if (line.length > 30) {
        return true;
      }

      return false;
    });

    // Join lines back and clean up
    content = lines.join("\n\n");

    return (
      content
        // Remove excessive whitespace
        .replace(/\s+/g, " ")
        // Remove multiple newlines
        .replace(/\n\s*\n\s*\n/g, "\n\n")
        // Remove leading/trailing whitespace
        .trim()
        // Remove common noise patterns
        .replace(
          /\b(click here|read more|continue reading|advertisement|sponsored|copy article link|preview mode|learning objectives|related content)\b/gi,
          ""
        )
        // Remove isolated punctuation
        .replace(/\s+[.,;:!?]+\s+/g, " ")
        // Remove excessive punctuation
        .replace(/[.,;:!?]{2,}/g, ".")
        // Remove repeated phrases (common in navigation)
        .replace(/(.{10,}?)\s+\1/gi, "$1")
        // Clean up spaces
        .replace(/\s+/g, " ")
        // Remove lines that are just website elements
        .split("\n")
        .filter((line) => {
          const trimmed = line.trim();
          return (
            trimmed.length > 30 && // Minimum length
            !trimmed.match(
              /^(What is|Define|Explain|Understand|After reading)/i
            ) && // Learning objective fragments
            !trimmed.match(/^[A-Z][a-z]+ [A-Z][a-z]+$/) && // Two-word titles (likely navigation)
            trimmed.split(" ").length > 5
          ); // At least 5 words
        })
        .join("\n\n")
        .trim()
    );
  }

  countWords(text) {
    if (!text) return 0;
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }
}

// Initialize content extractor
const contentExtractor = new ContentExtractor();
