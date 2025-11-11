# Outliner AI - Setup & Testing Guide

## 🎯 Quick Setup (5 Minutes)

### Step 1: Load Extension in Chrome

1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Toggle **Developer mode** ON (top right corner)
4. Click **Load unpacked**
5. Select the `chrome-extension-package` folder from this directory
6. ✅ You should see "Outliner AI" appear in your extensions list

### Step 2: Get Your Free Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Copy your API key (starts with `AIza...`)

### Step 3: Configure the Extension

1. Click the Outliner AI icon in your Chrome toolbar (puzzle piece icon if hidden)
2. Click **⚙️ Settings** at the bottom of the popup
3. Paste your API key in the input field
4. Click **Save Key**
5. ✅ Settings will collapse automatically when saved

### Step 4: Test with Sample Article

1. Open the included `test-article.html` file in Chrome:
   - Right-click the file → Open with → Chrome
   - Or drag the file into Chrome
2. Click the Outliner AI extension icon
3. Select **⚡ Brief** mode
4. Click **Summarize This Page**
5. ✅ You should see a 2-3 sentence summary within 3-5 seconds

## 🧪 Testing All Modes

### Test Brief Mode (⚡)

**Expected Output**: 2-3 concise sentences

```
Example: "Artificial Intelligence has evolved from theory to a
transformative technology reshaping industries. AI systems now
perform complex tasks in healthcare, finance, and other fields
with accuracy matching human experts."
```

### Test Bullet Mode (📝)

**Expected Output**: 5-7 bullet points

```
Example:
• AI has evolved from theoretical concept to transformative technology
• Healthcare applications include disease diagnosis from medical images
• Machine learning enables pattern recognition without explicit programming
• Ethical considerations include algorithmic bias and job displacement
• Future advances in quantum computing could lead to more powerful AI
```

### Test Comprehensive Mode (📋)

**Expected Output**: 5-7 detailed paragraphs covering:

- Introduction and context
- Current applications
- Technical details
- Ethical considerations
- Future outlook
- Conclusion

## 🔍 Testing Real Websites

Try these types of pages for best results:

**✅ Great Content for Summarization:**

- News articles (CNN, BBC, TechCrunch)
- Blog posts (Medium, Dev.to)
- Research articles
- Documentation pages
- Wikipedia articles
- Long-form content websites

**⚠️ May Not Work Well:**

- Social media feeds (dynamic content)
- Search results pages
- Pages with minimal text (< 100 words)
- Paywalled content (if not accessible)
- Pages requiring JavaScript rendering

## 🎨 UI Features to Test

### Mode Selection

- Click each mode button - should highlight with purple background
- Only one mode can be selected at a time

### Summarize Button

- Click "Summarize This Page"
- Button should show loading spinner
- Status text should appear: "Extracting content..." → "Generating summary..."

### Results Display

- Summary appears in white card with rounded corners
- Gradient border animation on the card
- Custom scrollbar if content is long

### Action Buttons

- **📋 Copy**: Copies summary to clipboard, shows "✓ Copied!"
- **🔄 Start Over**: Clears result and returns to mode selection

### Settings Panel

- Click **⚙️ Settings** to expand
- API key input field (password type)
- Link to get API key
- Save button

## 🐛 Common Issues & Solutions

### Issue: "API key not configured"

**Solution:**

1. Click **⚙️ Settings**
2. Enter your Gemini API key
3. Ensure it starts with `AIza`
4. Click **Save Key**

### Issue: "Content too short to summarize"

**Causes:**

- Page has less than 100 words
- Content is dynamically loaded (JavaScript)
- Content is in iframes

**Solution:**

- Try a different webpage with more content
- Ensure the page has finished loading

### Issue: "API quota exceeded"

**Cause:** Free tier limits reached (usually 60 requests per minute)

**Solution:**

- Wait a few minutes and try again
- Check your quota at [Google AI Studio](https://aistudio.google.com/)
- Consider upgrading your API plan if needed

### Issue: "Invalid API key"

**Solution:**

1. Double-check your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Make sure you copied the entire key
3. Re-enter it in Settings
4. Click Save Key

### Issue: Extension icon doesn't appear

**Solution:**

1. Go to `chrome://extensions/`
2. Find "Outliner AI" and ensure it's **Enabled**
3. Click the puzzle piece icon in Chrome toolbar
4. Pin "Outliner AI" to toolbar

## 📊 Performance Expectations

| Mode             | Expected Time | Token Usage |
| ---------------- | ------------- | ----------- |
| ⚡ Brief         | 2-4 seconds   | ~150 tokens |
| 📝 Bullet        | 3-6 seconds   | ~400 tokens |
| 📋 Comprehensive | 5-10 seconds  | ~600 tokens |

_Times may vary based on content length and API response time_

## 🔒 Security Checklist

- ✅ API key is stored in Chrome's sync storage (encrypted)
- ✅ No external tracking scripts
- ✅ HTTPS-only communication with Gemini API
- ✅ No data is stored on external servers
- ✅ Content extraction happens locally in your browser

## 📝 Developer Console

For debugging, open Chrome DevTools:

1. Right-click extension icon → **Inspect popup**
2. Or press `F12` on any webpage to see content script logs
3. Check for errors in the console

**Useful log messages:**

- `[Popup] Mode selected: brief`
- `[Content] Extracted X characters of content`
- `[Background] Summarization successful`
- `[Background] API Error: [details]`

## 🚀 Next Steps

1. ✅ Test all three modes with `test-article.html`
2. ✅ Try summarizing 3-5 real websites
3. ✅ Test the copy functionality
4. ✅ Verify API key persistence (close and reopen browser)
5. ✅ Test error handling (try with no API key)

## 💡 Tips for Best Results

1. **Choose the right mode:**

   - Brief: Quick scans, news headlines
   - Bullet: Note-taking, key points extraction
   - Comprehensive: Research, detailed understanding

2. **Content quality matters:**

   - Well-structured articles work best
   - Pages with clear headings and paragraphs
   - Avoid pages with mostly navigation/ads

3. **API key management:**
   - Keep your API key secure
   - Don't share it publicly
   - Monitor your usage in Google AI Studio

## 📚 Additional Resources

- [Google AI Studio](https://aistudio.google.com/) - Manage API keys and quota
- [Gemini API Documentation](https://ai.google.dev/docs) - API details
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/) - Extension development

---

**Ready to start?** Follow Step 1 above to load the extension! 🎉
