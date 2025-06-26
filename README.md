# Outliner AI - Chrome Extension

A powerful Chrome extension that summarizes webpage content in three different modes:

## Features

- **Brief Mode**: Quick overview in 1-3 sentences
- **Detailed Mode**: Comprehensive summary with key points
- **Bullets Mode**: Key information in bullet point format
- **🤖 Gemini API Integration**: Enhanced AI-powered summarization with Google's Gemini API
- **🔄 Smart Fallback**: Automatic fallback to local processing when API is unavailable
- **🔐 Secure API Key Management**: Encrypted storage with Chrome sync support
- **Smart Content Filtering**: AI-powered filtering removes ads, navigation, and irrelevant content
- **Quality Validation**: Built-in validation ensures summaries are coherent and meaningful
- **Dark Mode Support**: Toggle between light and dark themes
- **Save & Manage**: Save summaries for later reference with full management capabilities

## 🚀 Enhanced AI Processing

### Gemini API Integration

- **Higher Quality Summaries**: Leverage Google's advanced Gemini AI for superior summarization
- **Enhanced Understanding**: Better context comprehension and more coherent outputs
- **Mode-Specific Optimization**: Tailored prompts for Brief, Detailed, and Bullets modes
- **Automatic Fallback**: Seamlessly switches to local processing if API is unavailable

### API Key Setup

1. Get your free API key from [Google AI Studio](https://ai.google.dev/)
2. Click the "⚙️ API Settings" button in the extension popup
3. Enter your API key and click "Save Key"
4. The extension will automatically use Gemini API for enhanced results

### Processing Methods

- **🌟 GEMINI**: When API key is configured - uses Google's Gemini AI
- **⚡ LOCAL**: Fallback mode - uses built-in algorithms (no API key required)

## Modes

### 🔥 Brief Mode

- Perfect for quick scanning
- 1-3 sentences maximum
- Highlights the most essential information
- Ideal for busy professionals

### 📋 Detailed Mode

- Comprehensive analysis
- 4-8 sentences with full context
- Preserves important details and nuances
- Great for thorough understanding

### 📝 Bullets Mode

- Key points in clean bullet format
- 3-6 main takeaways
- Easy to scan and reference
- Perfect for note-taking

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The Outliner AI icon will appear in your toolbar

## Usage

1. Navigate to any webpage with text content
2. Click the Outliner AI extension icon
3. Select your preferred summary mode (Brief, Detailed, or Bullets)
4. Click "Summarize Page"
5. Copy or save the generated summary

## Technical Details

### Architecture

- **Manifest V3** compliant
- **Content Scripts** for webpage content extraction
- **Background Service Worker** for summarization processing
- **Modern UI** with responsive design

### Content Extraction

- Intelligent content detection
- Filters out navigation, ads, and noise
- Preserves article structure and context
- Handles various webpage layouts

### Summarization Engine

- Advanced sentence scoring algorithm
- Position-based importance weighting
- Keyword and title matching
- Length and readability optimization

## File Structure

```
chrome-extension/
├── manifest.json              # Extension configuration
├── popup/
│   ├── popup.html            # User interface
│   ├── popup.js              # UI logic and controls
│   └── popup.css             # Styling and layout
├── content/
│   └── content.js            # Content extraction logic
├── background/
│   └── background.js         # Background processing
├── utils/
│   └── summarizer.js         # Summarization algorithms
└── icons/
    └── [icon files]          # Extension icons
```

## Privacy

- No data is sent to external servers
- All processing happens locally in your browser
- No personal information is collected or stored

## Browser Compatibility

- Chrome 88+
- Edge 88+
- Other Chromium-based browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Git Workflow

### Initial Setup

```bash
git clone <repository-url>
cd outliner-ai
```

### Development Workflow

```bash
# Create a new feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to your branch
git push origin feature/your-feature-name
```

### Commit Message Convention

Follow conventional commits format:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation updates
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `hotfix/*` - Emergency fixes

## License

MIT License - see LICENSE file for details

## Support

For issues or feature requests, please create an issue in the repository.

---

**Outliner AI** - Making web content digestible, one summary at a time.
