Add-Type -AssemblyName System.Drawing

function Crop-ImageMargins {
    param(
        [string]$InputPath,
        [string]$OutputPath
    )

    $fullIn = [System.IO.Path]::GetFullPath($InputPath)
    $fullOut = [System.IO.Path]::GetFullPath($OutputPath)

    $src = [System.Drawing.Bitmap]::FromFile($fullIn)
    $w = $src.Width
    $h = $src.Height

    $minX = $w
    $maxX = 0
    $minY = $h
    $maxY = 0

    for ($y = 0; $y -lt $h; $y += 3) {
        for ($x = 0; $x -lt $w; $x += 3) {
            $px = $src.GetPixel($x, $y)
            # consider pixel non-empty if alpha > 20 and not pure white background
            if ($px.A -gt 25 -and -not ($px.R -gt 245 -and $px.G -gt 245 -and $px.B -gt 245)) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }

    Write-Host "Processed $InputPath : Box ($minX,$minY) to ($maxX,$maxY)"

    if ($maxX -gt $minX -and $maxY -gt $minY) {
        $cropW = $maxX - $minX + 1
        $cropH = $maxY - $minY + 1
        $cropped = New-Object System.Drawing.Bitmap($cropW, $cropH)
        $g = [System.Drawing.Graphics]::FromImage($cropped)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $srcRect = New-Object System.Drawing.Rectangle($minX, $minY, $cropW, $cropH)
        $destRect = New-Object System.Drawing.Rectangle(0, 0, $cropW, $cropH)
        $g.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
        $g.Dispose()
        $src.Dispose()
        $cropped.Save($fullOut, [System.Drawing.Imaging.ImageFormat]::Png)
        $cropped.Dispose()
        Write-Host "Saved tightly cropped: $OutputPath ($cropW x $cropH)"
    } else {
        $src.Dispose()
    }
}

Crop-ImageMargins -InputPath "ADSC_Removed_BG_Logo.png" -OutputPath "public/brand/adsc-logo.png"
Crop-ImageMargins -InputPath "atmiya_logo.png" -OutputPath "public/brand/atmiya-logo.png"
