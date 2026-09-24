$root = 'c:\Users\xcz\OneDrive\Desktop\Zavron Solutions\zavronsolutions'
$htmlFiles = Get-ChildItem -Path $root -Recurse -Filter '*.html' | Where-Object { $_.FullName -notmatch '\.git' }
Write-Host "Found $($htmlFiles.Count) HTML files to process..."

$totalReplaced = 0

foreach ($file in $htmlFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $original = $content

    # Update X/Twitter URL
    $content = $content -replace 'https://twitter\.com/zavronsolutions', 'https://x.com/ZavronSolutions'
    $content = $content -replace 'https://www\.twitter\.com/zavronsolutions', 'https://x.com/ZavronSolutions'

    # Update Facebook URL
    $content = $content -replace 'https://www\.facebook\.com/zavronsolutions', 'https://www.facebook.com/share/1HNXmAM7ay'
    $content = $content -replace 'https://facebook\.com/zavronsolutions', 'https://www.facebook.com/share/1HNXmAM7ay'

    # Update aria-labels for Twitter -> X
    $content = $content -replace 'Zavron Solutions on X / Twitter', 'Zavron Solutions on X (Twitter)'
    $content = $content -replace 'aria-label="Zavron Solutions on Twitter"', 'aria-label="Zavron Solutions on X (Twitter)"'

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
        $relPath = $file.FullName.Replace($root, '')
        Write-Host "Updated: $relPath"
        $totalReplaced++
    }
}

Write-Host ""
Write-Host "Done! Updated $totalReplaced files with corrected social links."
