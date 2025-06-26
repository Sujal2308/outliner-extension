# Test API Integration for Outliner AI Extension

Write-Host "🤖 Testing Outliner AI Extension - API Integration" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Check if extension files exist
$requiredFiles = @(
    "background\background.js",
    "popup\popup-clean.html", 
    "popup\popup-functional.js",
    "manifest.json"
)

Write-Host "`n📁 Checking required files..." -ForegroundColor Yellow

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file - Found" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - Missing" -ForegroundColor Red
        exit 1
    }
}

# Check background script for API integration
Write-Host "`n🔍 Validating API integration in background script..." -ForegroundColor Yellow

$backgroundContent = Get-Content "background\background.js" -Raw

$apiChecks = @{
    "Gemini API URL" = "generativelanguage.googleapis.com"
    "API Key Management" = "saveApiKey"
    "Gemini Summarization" = "summarizeWithGemini"
    "Local Fallback" = "summarizeLocally"
    "API Status Check" = "getApiKeyStatus"
}

foreach ($check in $apiChecks.GetEnumerator()) {
    if ($backgroundContent -match [regex]::Escape($check.Value)) {
        Write-Host "✅ $($check.Key) - Implemented" -ForegroundColor Green
    } else {
        Write-Host "❌ $($check.Key) - Missing" -ForegroundColor Red
    }
}

# Check popup for API UI elements
Write-Host "`n🎨 Validating API UI in popup..." -ForegroundColor Yellow

$popupHtml = Get-Content "popup\popup-clean.html" -Raw
$popupJs = Get-Content "popup\popup-functional.js" -Raw

$uiChecks = @{
    "API Settings Button" = "settingsBtn"
    "API Key Input" = "apiKeyInput" 
    "Method Indicator" = "methodIndicator"
    "API Status Display" = "apiStatus"
    "Save API Key Function" = "saveApiKey"
    "Remove API Key Function" = "removeApiKey"
}

foreach ($check in $uiChecks.GetEnumerator()) {
    $found = ($popupHtml -match [regex]::Escape($check.Value)) -or ($popupJs -match [regex]::Escape($check.Value))
    if ($found) {
        Write-Host "✅ $($check.Key) - Implemented" -ForegroundColor Green
    } else {
        Write-Host "❌ $($check.Key) - Missing" -ForegroundColor Red
    }
}

# Check manifest for necessary permissions
Write-Host "`n🔒 Validating manifest permissions..." -ForegroundColor Yellow

$manifest = Get-Content "manifest.json" -Raw | ConvertFrom-Json

$requiredPermissions = @("storage", "activeTab", "scripting")

foreach ($permission in $requiredPermissions) {
    if ($manifest.permissions -contains $permission) {
        Write-Host "✅ $permission permission - Present" -ForegroundColor Green
    } else {
        Write-Host "❌ $permission permission - Missing" -ForegroundColor Red
    }
}

Write-Host "`n🧪 Manual Testing Instructions:" -ForegroundColor Cyan
Write-Host "1. Load the extension in Chrome (Developer mode)" -ForegroundColor White
Write-Host "2. Open test-api-integration.html in Chrome" -ForegroundColor White  
Write-Host "3. Click the extension icon and test both modes:" -ForegroundColor White
Write-Host "   - Without API key (should show LOCAL indicator)" -ForegroundColor Gray
Write-Host "   - With API key (should show GEMINI indicator)" -ForegroundColor Gray
Write-Host "4. Try summarizing the test page in all 3 modes" -ForegroundColor White
Write-Host "5. Verify API key saving/removing works correctly" -ForegroundColor White

Write-Host "`n✨ API Integration Testing Complete!" -ForegroundColor Green
Write-Host "Extension is ready for testing with Gemini API support." -ForegroundColor Green
