@echo off
echo Creating Chrome extension icons...

:: Check if PowerShell is available
powershell -Command "& {Write-Host 'PowerShell is available'}" >nul 2>&1
if %errorlevel% equ 0 (
    echo Running PowerShell script to create icons...
    powershell -ExecutionPolicy Bypass -File "create-icons.ps1"
) else (
    echo PowerShell not available. Please create icons manually.
    echo.
    echo You need to create these PNG files in the icons folder:
    echo - icon16.png (16x16 pixels)
    echo - icon32.png (32x32 pixels) 
    echo - icon48.png (48x48 pixels)
    echo - icon128.png (128x128 pixels)
    echo.
    echo Use any image editor to create simple square icons with:
    echo - Purple/blue gradient background
    echo - White document lines
    echo - Small gold circle for AI indicator
)

pause
