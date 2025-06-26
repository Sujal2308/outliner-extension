# Installation Guide - Outliner AI Chrome Extension

## Quick Setup (5 minutes)

### Step 1: Prepare the Extension

1. Ensure all files are in the `Outliner AI` folder
2. **Important**: You need to create actual icon files for the extension to work properly

### Step 2: Create Icon Files (Required)

The extension needs these icon files in the `icons` folder:

- `icon16.png` (16x16 pixels)
- `icon32.png` (32x32 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

**Quick Solution**: Create simple square icons with:

- Purple/blue gradient background (#667eea to #764ba2)
- White document/text lines symbol
- Save as PNG files with the exact names above

### Step 3: Install in Chrome

1. Open Chrome browser
2. Type `chrome://extensions/` in the address bar
3. Enable **"Developer mode"** (toggle in top-right corner)
4. Click **"Load unpacked"** button
5. Navigate to and select the `Outliner AI` folder
6. Click **"Select Folder"**

### Step 4: Test the Extension

1. Open the included `test-page.html` file in Chrome
2. Click the Outliner AI icon in the Chrome toolbar
3. Select a summary mode (Brief/Detailed/Bullets)
4. Click "Summarize Page"
5. View the generated summary!

## Troubleshooting

### Extension Won't Load

- Check that all files are present
- Ensure icon files exist (create placeholder 16x16 PNG files if needed)
- Verify folder structure matches the manifest.json expectations

### Content Not Extracting

- Make sure you're on a webpage with actual text content
- The extension can't work on Chrome system pages (chrome://)
- Try the included test-page.html first

### Summary Not Generating

- Check the browser console (F12) for any JavaScript errors
- Ensure the content has enough text (minimum ~50 words)
- Try different summary modes

## File Structure Check

Your folder should look like this:

```
Outliner AI/
├── manifest.json
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── content/
│   └── content.js
├── background/
│   └── background.js
├── utils/
│   └── summarizer.js
├── icons/
│   ├── icon16.png  ← CREATE THESE
│   ├── icon32.png  ← CREATE THESE
│   ├── icon48.png  ← CREATE THESE
│   └── icon128.png ← CREATE THESE
├── test-page.html
└── README.md
```

## Next Steps

1. **Create proper icons** - Use any image editor to create simple PNG icons
2. **Test thoroughly** - Try the extension on various websites
3. **Customize** - Modify the summarization algorithms in `utils/summarizer.js`
4. **Package** - Use `npm run package` to create a ZIP file for distribution

## Publishing (Optional)

To publish to Chrome Web Store:

1. Create a developer account at [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Package your extension as a ZIP file
3. Upload and fill out the store listing
4. Submit for review

---

**Need Help?** Check the browser console (F12) for error messages or review the README.md for more details.
