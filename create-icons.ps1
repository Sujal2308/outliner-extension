# PowerShell script to create simple icon files for Chrome extension
# Run this script to generate the required PNG icon files

Add-Type -AssemblyName System.Drawing

function Create-Icon {
    param(
        [int]$Size,
        [string]$OutputPath
    )
    
    # Create bitmap
    $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Enable anti-aliasing
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    
    # Create gradient brush
    $rect = New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, [System.Drawing.Color]::FromArgb(102, 126, 234), [System.Drawing.Color]::FromArgb(118, 75, 162), 45)
    
    # Fill background
    $graphics.FillRectangle($brush, $rect)
    
    # Create white pen for lines
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [Math]::Max(1, $Size / 16))
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    
    # Draw document lines
    $margin = $Size * 0.2
    $lineSpacing = $Size * 0.15
    
    for ($i = 0; $i -lt 3; $i++) {
        $y = $margin + ($i * $lineSpacing)
        $graphics.DrawLine($pen, $margin, $y, $Size - $margin, $y)
    }
    
    # Add AI indicator (golden circle)
    $goldBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Gold)
    $circleSize = $Size / 4
    $graphics.FillEllipse($goldBrush, $Size - $margin, $margin/2, $circleSize, $circleSize)
    
    # Save as PNG
    $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Cleanup
    $graphics.Dispose()
    $bitmap.Dispose()
    $brush.Dispose()
    $pen.Dispose()
    $goldBrush.Dispose()
    
    Write-Host "Created: $OutputPath"
}

# Create icons directory if it doesn't exist
$iconsDir = ".\icons"
if (!(Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir
}

# Create all required icon sizes
Create-Icon -Size 16 -OutputPath ".\icons\icon16.png"
Create-Icon -Size 32 -OutputPath ".\icons\icon32.png"
Create-Icon -Size 48 -OutputPath ".\icons\icon48.png"
Create-Icon -Size 128 -OutputPath ".\icons\icon128.png"

Write-Host "All icons created successfully!"
Write-Host "You can now load the extension in Chrome."
