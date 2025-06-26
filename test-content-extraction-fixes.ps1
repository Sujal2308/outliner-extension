Write-Host "Testing content extraction improvements..." -ForegroundColor Green

# Reload Chrome extension and test
Write-Host "Reloading extension in Chrome..." -ForegroundColor Yellow

# Launch Chrome with our extension and test page
$chromeArgs = @(
    "--load-extension=`"d:\Outliner AI`""
    "--new-window"
    "`"file:///d:/Outliner AI/test-filtering-debug.html`""
)

Start-Process "chrome" -ArgumentList $chromeArgs

Write-Host "Chrome launched with test page. Please check:" -ForegroundColor Cyan
Write-Host "1. Open the extension popup" -ForegroundColor White
Write-Host "2. Click 'Summarize Current Page'" -ForegroundColor White
Write-Host "3. Verify that meaningful content is extracted" -ForegroundColor White
Write-Host "4. Check that footer/boilerplate content is filtered out" -ForegroundColor White

Write-Host "`nChanges made to improve content extraction:" -ForegroundColor Green
Write-Host "- Reduced minimum line length from 20 to 15 chars for sentences" -ForegroundColor White
Write-Host "- Reduced minimum heading length from 30 to 25 chars" -ForegroundColor White
Write-Host "- Added support for 10+ char lines with 3+ words" -ForegroundColor White
Write-Host "- Reduced final filter from 30 chars to 20 chars" -ForegroundColor White
Write-Host "- Reduced word count requirement from 5 to 3 words" -ForegroundColor White
Write-Host "- Reduced short fragment filter from 15 to 8 chars" -ForegroundColor White
Write-Host "- Lowered content extraction thresholds" -ForegroundColor White

Write-Host "`nPress any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
