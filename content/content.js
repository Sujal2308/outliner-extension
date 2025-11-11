/**/**

 * Content Script - Extracts webpage content * Content Script for Outliner AI Chrome Extension

 */ * Extracts and processes webpage content for summarization

 */

class ContentExtractor {

  constructor() {class ContentExtractor {

    this.setupMessageListener();  constructor() {

  }    this.setupMessageListener();

  }

  setupMessageListener() {

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {  setupMessageListener() {

      if (message.action === 'extractContent') {    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

        this.extractContent()      console.log("Content script received message:", message);

          .then(data => sendResponse({ success: true, data }))

          .catch(error => sendResponse({ success: false, error: error.message }));      if (message.action === "extractContent") {

        return true; // Async response        console.log("Processing extractContent request");

      }

    });        this.extractContent()

  }          .then((data) => {

            console.log("Content extraction successful");

  async extractContent() {            sendResponse({ success: true, data });

    try {          })

      // Get page title          .catch((error) => {

      const title = document.title || 'Untitled Page';            console.error("Content extraction failed:", error);

                  sendResponse({ success: false, error: error.message });

      // Extract main content          });

      let content = this.getMainContent();

              return true; // Indicates async response

      // Clean and process content      }

      content = this.cleanContent(content);

            // Always send a response to prevent channel closure

      // Count words      sendResponse({ success: false, error: "Unknown action" });

      const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;      return false;

          });

      if (wordCount < 100) {  }

        throw new Error('Page has insufficient content to summarize');

      }  async extractContent() {

          try {

      // Limit content length (for API efficiency)      const content = this.extractMainContent();

      if (content.length > 30000) {      const title = this.extractTitle();

        content = content.substring(0, 30000) + '...';      const wordCount = this.countWords(content);

      }      const metadata = this.extractMetadata();

      

      return {      return {

        content,        content,

        title,        title,

        wordCount,        wordCount,

        url: window.location.href        url: window.location.href,

      };        domain: window.location.hostname,

              ...metadata,

    } catch (error) {      };

      console.error('Content extraction failed:', error);    } catch (error) {

      throw error;      throw new Error(`Content extraction failed: ${error.message}`);

    }    }

  }  }



  getMainContent() {  extractMainContent() {

    // Try to find main content area    // Strategy 1: Try to find main content areas with enhanced scoring

    const selectors = [    // Added W3Schools-specific selectors for better educational content extraction

      'article',    const contentSelectors = [

      'main',      "main",

      '[role="main"]',      "article",

      '.post-content',      '[role="main"]',

      '.article-content',      ".main-content",

      '.entry-content',      ".content",

      '.content',      ".post-content",

      '#content',      ".entry-content",

      '.main-content'      ".article-content",

    ];      ".article-body",

          ".post-body",

    let content = '';      "#main-content",

          "#content",

    // Try each selector      ".story-body",

    for (const selector of selectors) {      ".article-text",

      const element = document.querySelector(selector);      // W3Schools specific selectors

      if (element && element.textContent.trim().length > 500) {      ".w3-main",

        content = element.textContent;      ".w3-content",

        break;      "#main",

      }      ".w3-panel",

    }      ".tutorial-content",

          ".lesson-content",

    // Fallback to body if no main content found      // Educational content selectors

    if (!content) {      ".documentation",

      content = document.body.textContent;      ".docs-content",

    }      ".tutorial",

          ".guide-content",

    return content;    ];

  }

    let bestContent = "";

  cleanContent(text) {    let bestScore = 0;

    // Remove extra whitespace

    text = text.replace(/\s+/g, ' ');    // Try each selector and score the content

        for (const selector of contentSelectors) {

    // Remove common unwanted patterns      const elements = document.querySelectorAll(selector);

    text = text.replace(/cookie policy/gi, '');      for (const element of elements) {

    text = text.replace(/accept cookies/gi, '');        const text = this.extractTextFromElement(element);

    text = text.replace(/subscribe to newsletter/gi, '');        const score = this.scoreContent(text, element);

    text = text.replace(/share on social media/gi, '');

            console.log(

    // Remove URLs          `Selector ${selector}: ${text.length} chars, score: ${score}`

    text = text.replace(/https?:\/\/[^\s]+/g, '');        );

    

    // Remove email addresses        if (score > bestScore && text.length > 100) {

    text = text.replace(/[\w.-]+@[\w.-]+\.\w+/g, '');          // Reduced from 200

              bestContent = text;

    // Trim          bestScore = score;

    text = text.trim();        }

          }

    return text;    }

  }

}    // Strategy 2: If no good main content found, try W3Schools specific extraction

    if (bestScore < 50 || bestContent.length < 300) {

// Initialize      console.log("Trying W3Schools specific extraction");

new ContentExtractor();      const w3Content = this.extractW3SchoolsContent();

      if (w3Content.length > bestContent.length) {
        bestContent = w3Content;
        bestScore = 60; // Give it a good score if it found content
      }
    }

    // Strategy 3: Use smart body extraction as fallback
    if (bestScore < 50 || bestContent.length < 300) {
      console.log("Using smart body extraction");
      bestContent = this.smartBodyExtraction();
    }

    // Strategy 4: Enhanced fallback with paragraph analysis
    if (bestContent.length < 150) {
      console.log("Using paragraph analysis fallback");
      bestContent = this.extractLongestParagraphs();
    }

    // Apply content prioritization to focus on main content
    bestContent = this.prioritizeMainContent(bestContent);

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

    // Educational content bonus
    const lowerText = text.toLowerCase();
    if (lowerText.includes("example") || lowerText.includes("tutorial"))
      score += 15;
    if (lowerText.includes("java") || lowerText.includes("data type"))
      score += 20;
    if (
      lowerText.includes("variable") ||
      lowerText.includes("method") ||
      lowerText.includes("class")
    )
      score += 15;
    if (
      lowerText.includes("public") ||
      lowerText.includes("private") ||
      lowerText.includes("int")
    )
      score += 10;

    // Programming language indicators
    if (
      /\b(int|String|boolean|char|double|float|byte|short|long)\b/i.test(text)
    )
      score += 25;
    if (
      /\b(public|private|protected|static|final|class|interface)\b/i.test(text)
    )
      score += 20;

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

    // W3Schools specific bonuses
    if (className.includes("w3-main") || className.includes("w3-content"))
      score += 25;
    if (className.includes("w3-example") || className.includes("w3-note"))
      score += 15;
    if (id === "main") score += 20;

    // Penalty for navigation-like content
    if (
      className.includes("nav") ||
      className.includes("menu") ||
      className.includes("sidebar") ||
      className.includes("footer") ||
      lowerText.includes("examples might be simplified") ||
      lowerText.includes("w3schools is optimized") ||
      lowerText.includes("get certified")
    ) {
      score -= 30;
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

    // Heavy penalty for footer/support content and irrelevant phrases
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
      "suggest changes",
      "last updated",
      "likes",
      "what is dsa",
      "dsa full form",
      "26 nov, 2024",
      "267 likes",
      "computer science student",
      "one of the most important skills",
      "login",
      "sign up",
      "register",
      "subscribe",
      "newsletter",
      "advertisement",
      "related articles",
      "you may also like",
      "recommended for you",
      "trending now",
      "popular posts",
      "share this",
      "follow us",
      "social media",
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

    // Enhanced patterns to catch footer/contact/support content and irrelevant fragments
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

      // DSA-specific irrelevant fragments
      /^what is dsa\??\s*$/i,
      /^dsa full form\s*$/i,
      /^last updated \d+.*$/i,
      /^\d+ likes?\s*$/i,
      /^suggest changes\s*$/i,
      /^computer science student must have\s*$/i,
      /^one of the most important skills\s*$/i,
      /^what is dsa.*dsa full form.*last updated.*suggest changes.*likes$/i,

      // Generic irrelevant fragments
      /^(like|dislike|share|comment)$/i,
      /^(rating|stars?|reviews?)$/i,
      /^(published|updated|modified|created).*\d{4}$/i,
      /^by\s+[a-zA-Z\s]+$/i, // "By Author Name"
      /^tags?:\s*/i,
      /^categories?:\s*/i,

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

  prioritizeMainContent(content) {
    // Split content into sections
    const sections = content.split(/\n\s*\n/);

    // Score each section based on content quality
    const scoredSections = sections.map((section) => {
      let score = 0;
      const lowerSection = section.toLowerCase();
      const wordCount = section.split(/\s+/).length;

      // Length bonus
      score += Math.min(wordCount / 20, 10);

      // Content quality indicators
      if (section.includes(".") && section.includes(" ")) score += 5;
      if (wordCount > 50) score += 5;
      if (wordCount > 100) score += 10;

      // Technical content indicators (good for DSA topics)
      const technicalTerms = [
        "algorithm",
        "data structure",
        "complexity",
        "time complexity",
        "space complexity",
        "array",
        "linked list",
        "stack",
        "queue",
        "tree",
        "graph",
        "hash",
        "sort",
        "search",
        "binary",
        "linear",
        "recursion",
        "iteration",
        "dynamic programming",
        "big o",
        "efficiency",
        "performance",
        "implementation",
        "function",
        "method",
        "class",
        "object",
        "programming",
        "code",
        "syntax",
        "example",
        "problem",
      ];

      const technicalCount = technicalTerms.filter((term) =>
        lowerSection.includes(term)
      ).length;
      score += technicalCount * 3;

      // Educational content indicators
      const educationalTerms = [
        "explanation",
        "definition",
        "concept",
        "understanding",
        "learn",
        "study",
        "tutorial",
        "guide",
        "introduction",
        "overview",
        "basics",
        "fundamentals",
        "example",
        "practice",
        "exercise",
        "solution",
        "approach",
        "technique",
      ];

      const educationalCount = educationalTerms.filter((term) =>
        lowerSection.includes(term)
      ).length;
      score += educationalCount * 2;

      // Penalty for navigation/metadata fragments
      const irrelevantTerms = [
        "last updated",
        "suggest changes",
        "likes",
        "full form",
        "login",
        "subscribe",
        "newsletter",
        "advertisement",
        "cookie",
        "privacy policy",
        "terms of use",
        "all rights reserved",
        "powered by",
        "contact support",
      ];

      const irrelevantCount = irrelevantTerms.filter((term) =>
        lowerSection.includes(term)
      ).length;
      score -= irrelevantCount * 10;

      // Heavy penalty for short metadata-like content
      if (
        wordCount < 20 &&
        (lowerSection.includes("updated") ||
          lowerSection.includes("likes") ||
          lowerSection.includes("suggest") ||
          lowerSection.includes("full form"))
      ) {
        score -= 50;
      }

      return { content: section, score, wordCount };
    });

    // Sort by score and take the best sections
    const bestSections = scoredSections
      .filter((section) => section.score > 0 && section.wordCount > 15)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) // Take top 10 sections
      .map((section) => section.content);

    return bestSections.join("\n\n");
  }

  countWords(text) {
    if (!text) return 0;
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }

  extractW3SchoolsContent() {
    console.log("Extracting W3Schools specific content");

    // W3Schools specific selectors in priority order
    const w3Selectors = [
      ".w3-main .w3-content", // Main content area
      ".w3-main", // Main container
      "#main", // Main element
      ".w3-content", // Content wrapper
    ];

    let content = "";

    // Try W3Schools specific selectors first
    for (const selector of w3Selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(
          `Found ${elements.length} elements with selector: ${selector}`
        );

        for (const element of elements) {
          const extractedText = this.extractEducationalContent(element);
          if (extractedText.length > content.length) {
            content = extractedText;
          }
        }

        if (content.length > 200) {
          break; // Found good content, stop searching
        }
      }
    }

    // If still no good content, try broader educational patterns
    if (content.length < 200) {
      content = this.extractEducationalPatterns();
    }

    return this.cleanEducationalContent(content);
  }

  extractEducationalContent(element) {
    if (!element) return "";

    // Clone the element to avoid modifying the original
    const clone = element.cloneNode(true);

    // Remove unwanted elements
    const unwantedSelectors = [
      "script",
      "style",
      "nav",
      ".nav",
      ".navbar",
      ".sidebar",
      ".menu",
      ".footer",
      ".header",
      ".advertisement",
      ".ads",
      ".social",
      ".share",
      ".w3-sidebar",
      ".w3-bar",
      ".nextprev",
      ".w3-row",
      ".w3-half",
      ".w3-third",
      ".w3-quarter",
      ".tryit",
      ".w3-btn",
      ".getdiploma",
    ];

    unwantedSelectors.forEach((selector) => {
      const elements = clone.querySelectorAll(selector);
      elements.forEach((el) => el.remove());
    });

    // Extract text content
    let text = clone.textContent || clone.innerText || "";

    // Clean up the text
    text = text.replace(/\s+/g, " ").trim();

    // Filter out common W3Schools navigation text
    const navPatterns = [
      /Tutorial\s*\n/gi,
      /References\s*\n/gi,
      /Examples\s*\n/gi,
      /Exercises\s*\n/gi,
      /Get Certified\s*\n/gi,
      /Previous\s+Next/gi,
      /❮\s*Previous\s+Next\s*❯/gi,
    ];

    navPatterns.forEach((pattern) => {
      text = text.replace(pattern, "");
    });

    return text;
  }

  extractEducationalPatterns() {
    console.log("Extracting educational patterns");

    // Look for educational content patterns
    const educationalSelectors = [
      "h1, h2, h3", // Headings are important in tutorials
      "p", // Main text content
      ".w3-example", // Code examples
      ".w3-note", // Important notes
      ".w3-panel", // Info panels
      "pre", // Code blocks
      "code", // Inline code
    ];

    let content = "";

    // Extract headings and their following content
    const headings = document.querySelectorAll("h1, h2, h3");
    for (const heading of headings) {
      const headingText = heading.textContent.trim();

      // Skip navigation headings
      if (this.isNavigationHeading(headingText)) continue;

      content += headingText + "\n\n";

      // Get content following this heading
      let nextElement = heading.nextElementSibling;
      let paragraphCount = 0;

      while (nextElement && paragraphCount < 3) {
        if (nextElement.tagName === "P") {
          const pText = nextElement.textContent.trim();
          if (pText.length > 50 && !this.isNavigationText(pText)) {
            content += pText + "\n\n";
            paragraphCount++;
          }
        } else if (
          nextElement.tagName === "H1" ||
          nextElement.tagName === "H2" ||
          nextElement.tagName === "H3"
        ) {
          break; // Stop at next heading
        }
        nextElement = nextElement.nextElementSibling;
      }
    }

    // If headings didn't give us enough content, get all paragraphs
    if (content.length < 300) {
      const paragraphs = document.querySelectorAll("p");
      for (const p of paragraphs) {
        const pText = p.textContent.trim();
        if (pText.length > 50 && !this.isNavigationText(pText)) {
          content += pText + "\n\n";
        }
      }
    }

    return content;
  }

  isNavigationHeading(text) {
    const navHeadings = [
      "tutorial",
      "examples",
      "references",
      "exercises",
      "get certified",
      "previous",
      "next",
      "menu",
      "navigation",
      "sidebar",
      "footer",
    ];

    const lowerText = text.toLowerCase();
    return navHeadings.some((nav) => lowerText.includes(nav));
  }

  isNavigationText(text) {
    const navPatterns = [
      /examples might be simplified/i,
      /w3schools is optimized/i,
      /get certified/i,
      /previous.*next/i,
      /tutorial.*references.*examples/i,
      /create your own website/i,
      /spaces provided by w3schools/i,
    ];

    return navPatterns.some((pattern) => pattern.test(text));
  }

  cleanEducationalContent(content) {
    if (!content) return "";

    // Remove common W3Schools footer/navigation text
    const cleanupPatterns = [
      /Examples might be simplified to improve reading and learning[\s\S]*$/i,
      /W3Schools is optimized for learning[\s\S]*$/i,
      /Get certified by completing[\s\S]*$/i,
      /Create your own website[\s\S]*$/i,
      /While using W3Schools[\s\S]*$/i,
      /Tutorials, references, and examples[\s\S]*$/i,
      /Previous\s+Next[\s\S]*$/i,
      /❮\s*Previous[\s\S]*$/i,
    ];

    cleanupPatterns.forEach((pattern) => {
      content = content.replace(pattern, "");
    });

    // Clean up extra whitespace
    content = content.replace(/\n\s*\n\s*\n/g, "\n\n");
    content = content.trim();

    return content;
  }
}

// Initialize content extractor
const contentExtractor = new ContentExtractor();
