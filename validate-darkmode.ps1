# Dark Mode Validation Script

Write-Host "🌙 Dark Mode Feature Validation" -ForegroundColor Magenta
Write-Host "===============================" -ForegroundColor Magenta
Write-Host ""

$htmlFile = "popup\popup-clean.html"
$jsFile = "popup\popup-functional.js"

if (Test-Path $htmlFile) {
    $htmlContent = Get-Content $htmlFile -Raw
    
    Write-Host "🎨 CSS Variables Check:" -ForegroundColor Cyan
    
    if ($htmlContent -like "*--bg-primary*") {
        Write-Host "  ✅ CSS custom properties defined" -ForegroundColor Green
    } else {
        Write-Host "  ❌ CSS custom properties missing" -ForegroundColor Red
    }
    
    if ($htmlContent -like "*[data-theme=`"dark`"]*") {
        Write-Host "  ✅ Dark theme styles defined" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Dark theme styles missing" -ForegroundColor Red
    }
    
    if ($htmlContent -like "*theme-toggle*") {
        Write-Host "  ✅ Theme toggle button present" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Theme toggle button missing" -ForegroundColor Red
    }
    
    Write-Host ""
}

if (Test-Path $jsFile) {
    $jsContent = Get-Content $jsFile -Raw
    
    Write-Host "⚙️ JavaScript Functionality Check:" -ForegroundColor Cyan
    
    if ($jsContent -like "*toggleTheme*") {
        Write-Host "  ✅ Theme toggle function implemented" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Theme toggle function missing" -ForegroundColor Red
    }
    
    if ($jsContent -like "*initializeTheme*") {
        Write-Host "  ✅ Theme initialization present" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Theme initialization missing" -ForegroundColor Red
    }
    
    if ($jsContent -like "*chrome.storage.sync*theme*") {
        Write-Host "  ✅ Theme persistence implemented" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Theme persistence missing" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "📋 Test Files Available:" -ForegroundColor Cyan
$testFiles = Get-ChildItem "test-*.html" -ErrorAction SilentlyContinue
if ($testFiles) {
    foreach ($file in $testFiles) {
        Write-Host "  📄 $($file.Name)" -ForegroundColor White
    }
} else {
    Write-Host "  ⚠️ No test files found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Ready to Test Dark Mode!" -ForegroundColor Green
Write-Host "1. Load extension in Chrome" -ForegroundColor White
Write-Host "2. Look for 🌙 Dark button in header" -ForegroundColor White
Write-Host "3. Click to toggle between light/dark themes" -ForegroundColor White
Write-Host "4. Test theme persistence by closing/reopening extension" -ForegroundColor White
Write-Host "5. Verify all UI elements work in both themes" -ForegroundColor White
