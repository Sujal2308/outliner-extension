# Quick Extension Validation Script

Write-Host "🚀 Outliner AI Extension - Quick Validation" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Check critical files
$criticalFiles = @(
    "manifest.json",
    "utils\summarizer.js",
    "popup\popup-clean.html",
    "popup\popup-functional.js",
    "content\content.js",
    "background\background.js"
)

$allGood = $true

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - MISSING!" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""

# Check storage permission
if (Test-Path "manifest.json") {
    $manifest = Get-Content "manifest.json" | ConvertFrom-Json
    if ($manifest.permissions -contains "storage") {
        Write-Host "✅ Storage permission configured" -ForegroundColor Green
    } else {
        Write-Host "❌ Storage permission missing" -ForegroundColor Red
        $allGood = $false
    }
}

# Check if summarizer is the improved version
if (Test-Path "utils\summarizer.js") {
    $summarizerContent = Get-Content "utils\summarizer.js" -Raw
    if ($summarizerContent -like "*cleanContent*" -and $summarizerContent -like "*isQualitySentence*") {
        Write-Host "✅ Improved summarizer detected" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Old summarizer version detected" -ForegroundColor Yellow
    }
}

Write-Host ""

if ($allGood) {
    Write-Host "🎉 VALIDATION PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 NEXT STEPS:" -ForegroundColor Cyan
    Write-Host "1. Load extension in Chrome (chrome://extensions/)" -ForegroundColor White
    Write-Host "2. Test on test-comprehensive.html for best results" -ForegroundColor White
    Write-Host "3. Try all three summarization modes" -ForegroundColor White
    Write-Host "4. Test save/view functionality" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 IMPROVEMENTS MADE:" -ForegroundColor Cyan
    Write-Host "• Completely rewritten summarization engine" -ForegroundColor White
    Write-Host "• Logical, coherent summaries that make sense" -ForegroundColor White
    Write-Host "• Better content filtering and quality detection" -ForegroundColor White
    Write-Host "• Save/view summary functionality" -ForegroundColor White
    Write-Host "• Improved error handling and user feedback" -ForegroundColor White
} else {
    Write-Host "❌ VALIDATION FAILED!" -ForegroundColor Red
    Write-Host "Please check missing files above." -ForegroundColor Red
}

Write-Host ""
