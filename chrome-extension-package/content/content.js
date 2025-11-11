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

        if (score > bestScore && text.length > 100) {
          // Reduced from 200
          bestContent = text;
          bestScore = score;
        }
      }
    }

    // Strategy 2: If no good main content found, use smart body extraction
    if (bestScore < 50 || bestContent.length < 300) {
      // Reduced from 500
      console.log("Using smart body extraction");
      bestContent = this.smartBodyExtraction();
    }

    // Strategy 3: Enhanced fallback with paragraph analysis
    if (bestContent.length < 150) {
      // Reduced from 200
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
      .filter((p) => p.text.length > 30 && p.score > 0) // Reduced from 50
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
    const lowerText = text.toLowerCase();

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
        className.includes("header") ||
        className.includes("contact") ||
        className.includes("support") ||
        className.includes("help")
      )
        score -= 10;

      parent = parent.parentElement;
    }

    // Heavy penalty for footer/support content
    const footerKeywords = [
      "examples might be simplified",
      "constantly reviewed",
      "warrant full correctness",
      "terms of use",
      "cookie and privacy policy",
      "all rights reserved",
      "copyright",
      "powered by",
      "w3schools",
      "refsnes data",
      "contact support",
      "technical support",
      "customer service",
      "report a bug",
      "feedback and suggestions",
      "websites use cookies",
      "cookies to personalize",
      "personalize user experience",
      "improve site performance",
      "control cookie settings",
      "manage their privacy",
      "robust cybersecurity solutions",
      "cybersecurity solutions",
      "encompassing people",
      "processes and technology",
      "protecting individuals",
      "cyber threats",
    ];

    if (footerKeywords.some((keyword) => lowerText.includes(keyword))) {
      score -= 50; // Heavy penalty
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
      "click here",
      "read more",
      "continue reading",
    ];
    const wordsInText = lowerText.split(/\s+/);
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
      // Footer and contact elements
      ".footer",
      ".site-footer",
      ".page-footer",
      ".contact",
      ".contact-info",
      ".support",
      ".help",
      "#footer",
      "#contact",
      "#support",
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
      "[class*='terms']",
      "[class*='legal']",
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
      const textContent = el.textContent?.toLowerCase() || "";

      // Remove elements with navigation-like characteristics
      if (
        className.includes("nav") ||
        className.includes("menu") ||
        className.includes("header") ||
        className.includes("footer") ||
        className.includes("sidebar") ||
        className.includes("widget") ||
        className.includes("contact") ||
        className.includes("support") ||
        className.includes("terms") ||
        className.includes("privacy") ||
        className.includes("cookie") ||
        className.includes("legal") ||
        id.includes("nav") ||
        id.includes("menu") ||
        id.includes("header") ||
        id.includes("footer") ||
        id.includes("contact") ||
        id.includes("support") ||
        role === "navigation" ||
        role === "banner" ||
        role === "contentinfo"
      ) {
        el.remove();
        return;
      }

      // Remove elements with footer-like content
      if (
        textContent.includes("examples might be simplified") ||
        textContent.includes("constantly reviewed to avoid errors") ||
        textContent.includes("warrant full correctness") ||
        textContent.includes("terms of use") ||
        textContent.includes("cookie and privacy policy") ||
        textContent.includes("all rights reserved") ||
        textContent.includes("powered by") ||
        textContent.includes("refsnes data") ||
        textContent.includes("w3schools") ||
        textContent.includes("websites use cookies") ||
        textContent.includes("cookies to personalize") ||
        textContent.includes("personalize user experience") ||
        textContent.includes("improve site performance") ||
        textContent.includes("control cookie settings") ||
        textContent.includes("manage their privacy") ||
        textContent.includes("robust cybersecurity solutions") ||
        textContent.includes("cybersecurity solutions") ||
        textContent.includes("encompassing people") ||
        textContent.includes("processes and technology") ||
        textContent.includes("protecting individuals") ||
        textContent.includes("cyber threats") ||
        (textContent.includes("copyright") && textContent.includes("20"))
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

    console.log("Original content length:", content.length);

    // Pre-filter: Remove entire sections that are clearly cookie/cybersecurity boilerplate
    const boilerplatePatterns = [
      /these cookies also allow us to count visits and traffic sources so we can measure and improve the performance of our site/gi,
      /these cookies provide metrics related to the performance and usability of our site/gi,
      /with more visibility and context into data security threats.*cybersecurity teams.*eliminate.*impact.*reduce.*severity.*scope.*attack/gi,
      /visibility and context into data security.*events.*surface.*awareness.*cybersecurity.*eliminate.*impact/gi,
      /cybersecurity teams to quickly eliminate any further impact and reduce the severity and scope of the attack/gi,
    ];

    let preFilteredContent = content;
    for (const pattern of boilerplatePatterns) {
      preFilteredContent = preFilteredContent.replace(pattern, "");
    }

    console.log("After pre-filtering length:", preFilteredContent.length);

    // Split into lines and filter out low-quality fragments
    let lines = preFilteredContent
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    console.log("Lines before filtering:", lines.length);

    // Enhanced patterns to catch footer/contact/support content (more targeted)
    const fragmentPatterns = [
      // Navigation and UI elements (exact matches only)
      /^(home|about|contact|menu|login|search|subscribe|newsletter)$/i,
      /^(privacy policy|terms of service|cookie policy)$/i,
      /^(follow us|social media|share this)$/i,
      /^(advertisement|sponsored|promoted)$/i,
      /^(loading|please wait|redirecting)$/i,
      /^(prev|previous|next|continue|read more)$/i,
      /^(breadcrumbs?|navigation|site map)$/i,
      /^(sidebar|footer|header|banner)$/i,

      // Only very specific cookie/cybersecurity patterns
      /these cookies also allow us to count visits and traffic sources so we can measure and improve the performance of our site/i,
      /these cookies provide metrics related to the performance and usability of our site/i,
      /robust cybersecurity solutions encompassing people processes and technology/i,

      // Footer/support content patterns (only full specific phrases)
      /examples might be simplified to improve reading and learning/i,
      /constantly reviewed to avoid errors but we cannot warrant full correctness/i,
      /while using.*you agree.*terms of use.*cookie.*privacy policy/i,
      /copyright.*all rights reserved/i,
      /powered by/i,
      /optimized for learning and training/i,
      /refsnes data/i,
      /w3schools/i,

      // Short fragments
      /^[^a-zA-Z]*$/, // Lines with no letters
      /^\d+$/, // Lines with only numbers
      /^.{1,8}$/, // Very short lines (likely fragments)
    ];

    lines = lines.filter((line) => {
      // Remove lines matching fragment patterns
      if (fragmentPatterns.some((pattern) => pattern.test(line))) {
        return false;
      }

      // Additional filtering for footer/support content
      const lowerLine = line.toLowerCase();

      // Filter out common footer phrases (more targeted)
      const footerPhrases = [
        "examples might be simplified",
        "constantly reviewed to avoid errors",
        "warrant full correctness",
        "terms of use",
        "cookie and privacy policy",
        "all rights reserved",
        "powered by",
        "refsnes data",
        "w3schools",
        // Cookie-related phrases (only very specific ones)
        "these cookies also allow us to count visits and traffic sources",
        "cookies provide metrics related to the performance and usability",
        "websites use cookies to personalize user experience",
        // Cybersecurity boilerplate (only very specific full phrases)
        "robust cybersecurity solutions encompassing people processes and technology",
        "cybersecurity teams to quickly eliminate any further impact",
      ];

      if (footerPhrases.some((phrase) => lowerLine.includes(phrase))) {
        return false;
      }

      // Filter out lines that are mostly links or references (more lenient)
      const linkWordCount = (
        line.match(
          /\b(click here|read more|continue reading|learn more)\b/gi
        ) || []
      ).length;
      const totalWords = line.split(/\s+/).length;
      if (totalWords > 0 && linkWordCount / totalWords > 0.5) {
        // Changed from 0.3 to 0.5
        return false;
      }

      // Keep lines that look like proper sentences or headings
      if (
        line.length > 12 && // Further reduced from 15
        (line.includes(".") || line.includes("?") || line.includes("!"))
      ) {
        return true;
      }

      // Keep longer lines that might be headings or meaningful content
      if (line.length > 20) {
        // Reduced from 25
        return true;
      }

      // Keep medium-length lines with multiple words (potential content)
      if (line.length > 8 && line.split(/\s+/).length >= 2) {
        // Reduced requirements
        return true;
      }

      return false;
    });

    console.log("Lines after filtering:", lines.length);

    // Join lines back and clean up
    content = lines.join("\n\n");

    const finalContent = content
      // Remove excessive whitespace
      .replace(/\s+/g, " ")
      // Remove multiple newlines
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      // Remove leading/trailing whitespace
      .trim()
      // Remove common noise patterns (more targeted)
      .replace(
        /\b(examples might be simplified|constantly reviewed|warrant full correctness|terms of use|cookie and privacy policy|all rights reserved|powered by|w3schools|refsnes data)\b/gi,
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
        const lowerTrimmed = trimmed.toLowerCase();

        // Remove only very specific boilerplate content
        const genericPatterns = [
          /^websites use cookies to personalize user experience and improve site performance$/i,
          /^robust cybersecurity solutions encompassing people processes and technology$/i,
          /^examples might be simplified to improve reading and learning$/i,
        ];

        if (genericPatterns.some((pattern) => pattern.test(trimmed))) {
          return false;
        }

        return (
          trimmed.length > 15 && // Further reduced minimum length
          !trimmed.match(
            /^(What is|Define|Explain|Understand|After reading)$/i
          ) && // Learning objective fragments (exact match only)
          !trimmed.match(/^[A-Z][a-z]+ [A-Z][a-z]+$/) && // Two-word titles (likely navigation)
          trimmed.split(" ").length > 2 // Reduced to at least 2 words
        );
      })
      .join("\n\n")
      .trim();

    console.log("Final cleaned content length:", finalContent.length);
    console.log(
      "Final content preview:",
      finalContent.substring(0, 200) + "..."
    );

    return finalContent;
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
