# Content Extraction Verification Script
# Tests the improved content filtering for Outliner AI

Write-Host "=== Outliner AI Content Extraction Test ===" -ForegroundColor Green
Write-Host ""

# Test 1: Check if extension files exist
Write-Host "1. Checking extension files..." -ForegroundColor Yellow
$extensionFiles = @(
    "d:\Outliner AI\manifest.json",
    "d:\Outliner AI\content\content.js",
    "d:\Outliner AI\background\background.js",
    "d:\Outliner AI\popup\popup.html"
)

foreach ($file in $extensionFiles) {
    if (Test-Path $file) {
        Write-Host "   ✓ $file exists" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file missing" -ForegroundColor Red
    }
}

Write-Host ""

# Test 2: Check content extraction improvements
Write-Host "2. Checking content extraction improvements..." -ForegroundColor Yellow

$contentJs = Get-Content "d:\Outliner AI\content\content.js" -Raw

$improvements = @(
    @{ Pattern = "examples might be simplified"; Description = "W3Schools footer filtering" },
    @{ Pattern = "warrant full correctness"; Description = "Disclaimer filtering" },
    @{ Pattern = "terms of use"; Description = "Legal text filtering" },
    @{ Pattern = "contact support"; Description = "Support text filtering" },
    @{ Pattern = "technical support"; Description = "Help text filtering" },
    @{ Pattern = "footer"; Description = "Footer element filtering" },
    @{ Pattern = "\.contact"; Description = "Contact class filtering" },
    @{ Pattern = "\.support"; Description = "Support class filtering" }
)

foreach ($improvement in $improvements) {
    if ($contentJs -match $improvement.Pattern) {
        Write-Host "   ✓ $($improvement.Description)" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Missing: $($improvement.Description)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 3: List test pages
Write-Host "3. Available test pages..." -ForegroundColor Yellow

$testPages = @(
    "d:\Outliner AI\test-content-filtering.html",
    "d:\Outliner AI\test-w3schools-filtering.html"
)

foreach ($page in $testPages) {
    if (Test-Path $page) {
        Write-Host "   ✓ Test page: $page" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Missing test page: $page" -ForegroundColor Red
    }
}

Write-Host ""

# Test instructions
Write-Host "=== Manual Testing Instructions ===" -ForegroundColor Magenta
Write-Host ""
Write-Host "1. Use the VS Code task 'Test Outliner AI Extension' to load Chrome" -ForegroundColor White
Write-Host "2. Navigate to a test page or any webpage" -ForegroundColor White
Write-Host "3. Click the Outliner AI extension icon in the toolbar" -ForegroundColor White
Write-Host "4. Test content extraction and verify:" -ForegroundColor White
Write-Host "   • Footer content is NOT included in summaries" -ForegroundColor White
Write-Host "   • Contact/support text is filtered out" -ForegroundColor White
Write-Host "   • W3Schools disclaimers are removed" -ForegroundColor White
Write-Host "   • Main article content is preserved" -ForegroundColor White
Write-Host "5. Try both local and API summarization modes" -ForegroundColor White
Write-Host ""

Write-Host "=== Specific Test Cases ===" -ForegroundColor Magenta
Write-Host ""
Write-Host "Test the extension on these types of content:" -ForegroundColor White
Write-Host "• W3Schools tutorials (should filter footer text)" -ForegroundColor White
Write-Host "• News articles (should preserve main content)" -ForegroundColor White
Write-Host "• Blog posts (should filter navigation/sidebar)" -ForegroundColor White
Write-Host "• Documentation pages (should filter support links)" -ForegroundColor White
Write-Host ""

Write-Host "Content extraction improvements completed!" -ForegroundColor Green
Write-Host "Extension ready for testing." -ForegroundColor Green
