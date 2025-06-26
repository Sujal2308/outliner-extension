# Outliner AI Extension - File Verification Script

Write-Host "🔍 Checking Outliner AI Extension Files..." -ForegroundColor Cyan
Write-Host ""

$extensionPath = "d:\Outliner AI"
$missingFiles = @()
$foundFiles = @()

# Required files
$requiredFiles = @(
    "manifest.json",
    "popup\popup-clean.html", 
    "popup\popup-functional.js",
    "popup\popup.css",
    "content\content.js",
    "background\background.js",
    "utils\summarizer.js",
    "test-page.html",
    "TESTING.md"
)

# Check each required file
foreach ($file in $requiredFiles) {
    $fullPath = Join-Path $extensionPath $file
    if (Test-Path $fullPath) {
        $foundFiles += $file
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        $missingFiles += $file
        Write-Host "❌ $file" -ForegroundColor Red
    }
}

Write-Host ""

# Check icon files
$iconPath = Join-Path $extensionPath "icons"
if (Test-Path $iconPath) {
    $iconFiles = Get-ChildItem $iconPath -Filter "*.png" | Measure-Object
    Write-Host "📁 Icons folder: $($iconFiles.Count) PNG files found" -ForegroundColor Green
} else {
    Write-Host "📁 Icons folder: Missing (run create-icons.ps1)" -ForegroundColor Yellow
}

Write-Host ""

# Summary
Write-Host "📊 SUMMARY:" -ForegroundColor Cyan
Write-Host "Found: $($foundFiles.Count)/$($requiredFiles.Count) required files" -ForegroundColor Green

if ($missingFiles.Count -eq 0) {
    Write-Host "🎉 All required files present!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Ready to test! Follow these steps:" -ForegroundColor Cyan
    Write-Host "1. Open Chrome and go to chrome://extensions/" -ForegroundColor White
    Write-Host "2. Enable 'Developer mode' (top right)" -ForegroundColor White  
    Write-Host "3. Click 'Load unpacked' and select: $extensionPath" -ForegroundColor White
    Write-Host "4. Test on the included test-page.html file" -ForegroundColor White
} else {
    Write-Host "⚠️  Missing files: $($missingFiles -join ', ')" -ForegroundColor Red
}

Write-Host ""

# Check manifest.json content
$manifestPath = Join-Path $extensionPath "manifest.json"
if (Test-Path $manifestPath) {
    Write-Host "📋 Checking manifest.json..." -ForegroundColor Cyan
    try {
        $manifest = Get-Content $manifestPath | ConvertFrom-Json
        Write-Host "   Name: $($manifest.name)" -ForegroundColor White
        Write-Host "   Version: $($manifest.version)" -ForegroundColor White
        Write-Host "   Permissions: $($manifest.permissions -join ', ')" -ForegroundColor White
        
        if ($manifest.permissions -contains "storage") {
            Write-Host "   ✅ Storage permission included (required for save feature)" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Storage permission missing!" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ❌ Invalid JSON format" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📖 See TESTING.md for detailed testing instructions" -ForegroundColor Cyan
