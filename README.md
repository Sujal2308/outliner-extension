# Outliner AI - AI-Powered Web Page Summarizer

A beautiful Chrome extension that uses Google's Gemini API to summarize webpage content in three intelligent modes.

## ✨ Features

- **⚡ Brief Mode**: Concise 2-3 sentence summaries for quick understanding
- **📝 Bullet Mode**: 5-7 key points extracted and formatted as bullets
- **📋 Comprehensive Mode**: Detailed 5-7 paragraph analysis with full context
- **🤖 Gemini AI Integration**: Powered by Google's latest Gemini 1.5 Flash model
- **🎨 Beautiful Modern UI**: Gradient design with smooth animations
- **🔐 Secure API Key Storage**: Your API key is stored securely in Chrome sync storage
- **📋 Copy to Clipboard**: One-click copy functionality for all summaries
- **⚡ Smart Content Extraction**: Intelligently extracts main content from web pages

## 🚀 Quick Start

### Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked** and select the `chrome-extension-package` folder
5. The Outliner AI icon will appear in your browser toolbar

### Setup API Key

1. Get your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click the Outliner AI extension icon
3. Click **⚙️ Settings** at the bottom
4. Enter your API key (starts with `AIza`)
5. Click **Save Key**

### Usage

1. Navigate to any webpage with content you want to summarize
2. Click the Outliner AI icon in your toolbar
3. Select your preferred mode:
   - **⚡ Brief** - Fast overview
   - **📝 Bullet** - Key points
   - **📋 Comprehensive** - Full analysis
4. Click **Summarize This Page**
5. Wait for the AI to generate your summary
6. Click **📋 Copy** to copy the result or **🔄 Start Over** for a new summary

## 📊 Summary Modes

### ⚡ Brief Mode

- **Output**: 2-3 concise sentences
- **Best for**: Quick scanning, getting the gist
- **Token limit**: 150 tokens
- **Use case**: Busy professionals who need instant understanding

### � Bullet Mode

- **Output**: 5-7 bullet points with • symbol
- **Best for**: Note-taking, presentations, quick reference
- **Token limit**: 400 tokens
- **Use case**: Extracting actionable insights and key facts

### � Comprehensive Mode

- **Output**: 5-7 well-structured paragraphs
- **Best for**: Deep understanding, research, detailed analysis
- **Token limit**: 600 tokens
- **Use case**: Academic research, thorough content review

## 🏗️ Technical Architecture

### Manifest V3 Compliance

- Service Worker background script for efficient processing
- Modern Chrome extension standards
- Secure permissions model

### Components

**Background Service Worker** (`background/background.js`)

- Handles Gemini API communication
- Manages API key storage and retrieval
- Processes summarization requests
- Error handling for API failures

**Content Script** (`content/content.js`)

- Extracts main content from web pages
- Intelligent selector fallback system
- Cleans and validates content
- Minimum 100 words validation

**Popup UI** (`popup/popup.html`, `popup.js`)

- Modern gradient design (#667eea → #764ba2)
- Interactive mode selection
- Real-time status updates
- Copy to clipboard functionality
- Collapsible settings panel

### Content Extraction Strategy

The extension uses a smart selector hierarchy:

1. `<article>` tags
2. `<main>` tags
3. `[role="main"]` attributes
4. `.post-content`, `.article-content` classes
5. `.entry-content`, `.content` classes
6. `#content`, `.main-content` IDs
7. Fallback to `<body>` with cleaning

### API Integration

**Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`

**Generation Config**:

- Temperature: 0.4 (balanced creativity)
- Top K: 40
- Top P: 0.95

**Error Handling**:

- 401: Invalid API key
- 429: Quota exceeded
- 400: Invalid request/content too long
- Network errors with user-friendly messages

## 📁 File Structure

```
Outliner AI/
├── chrome-extension-package/
│   ├── manifest.json           # Extension manifest (Manifest V3)
│   ├── background/
│   │   └── background.js       # Service worker with Gemini API integration
│   ├── content/
│   │   └── content.js          # Content extraction script
│   ├── popup/
│   │   ├── popup.html          # Extension popup UI
│   │   ├── popup.js            # Popup controller and logic
│   │   └── popup.css           # Popup styling
│   ├── icons/                  # Extension icons (16, 32, 48, 128)
│   └── utils/
│       └── summarizer.js       # (Optional) Additional utilities
├── test-article.html           # Test page for development
└── README.md                   # This file
```

## 🔒 Privacy & Security

- **Your API key is stored securely** in Chrome's sync storage (encrypted by Chrome)
- **No external tracking** - only communicates with Google's Gemini API
- **No data collection** - your browsing data is never stored or shared
- **Local processing** - content extraction happens in your browser
- **HTTPS only** - all API communications use secure connections

## 🌐 Browser Compatibility

- ✅ **Chrome** 88+ (Recommended)
- ✅ **Microsoft Edge** 88+
- ✅ **Brave** (Chromium-based)
- ✅ **Opera** (Chromium-based)
- ✅ **Vivaldi** (Chromium-based)

## 🧪 Testing

A test article is included at `test-article.html`. To test:

1. Load the extension in Chrome
2. Open `test-article.html` in your browser
3. Click the extension icon
4. Try all three summary modes

Expected results:

- **Brief**: 2-3 sentence overview of AI
- **Bullet**: 5-7 key points about AI applications and future
- **Comprehensive**: 5-7 paragraphs covering introduction, applications, ethics, and future

## ⚠️ Troubleshooting

### "API key not configured"

- Go to Settings and enter your Gemini API key
- Ensure it starts with `AIza`
- Get a free key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### "Content too short to summarize"

- Page must have at least 100 words of content
- Some pages may have content hidden or dynamically loaded

### "API quota exceeded"

- Free tier has daily limits
- Wait 24 hours or upgrade your API plan
- Check your quota at [Google AI Studio](https://aistudio.google.com/)

### Extension icon doesn't appear

- Ensure extension is enabled in `chrome://extensions/`
- Try disabling and re-enabling the extension
- Check browser console for errors

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with clear commit messages
4. Test thoroughly with all three modes
5. Submit a pull request with a description of changes

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/outliner-ai.git
cd outliner-ai

# Make changes to chrome-extension-package/

# Load extension in Chrome for testing
# chrome://extensions/ -> Load unpacked -> select chrome-extension-package/
```

## 📄 License

MIT License - Feel free to use and modify as needed.

## 🙏 Credits

- **AI Model**: Google Gemini 1.5 Flash
- **Icons**: (Add your icon attribution here)
- **UI Design**: Modern gradient design inspired by contemporary web apps

## 📞 Support

- 🐛 **Report bugs**: Create an issue in the repository
- 💡 **Feature requests**: Open a discussion or issue
- 📧 **Contact**: (Add your contact information)

---

**Outliner AI** - Transforming web content into digestible insights with the power of AI ✨
