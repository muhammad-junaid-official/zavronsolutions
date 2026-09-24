$root = 'c:\Users\xcz\OneDrive\Desktop\Zavron Solutions\zavronsolutions'
$htmlFiles = Get-ChildItem -Path $root -Recurse -Filter '*.html' | Where-Object { $_.FullName -notmatch '\.git' -and $_.FullName -notmatch '\\admin\\' }
Write-Host "Found $($htmlFiles.Count) HTML files to process..."

$totalReplaced = 0

# New social icons to insert AFTER the X/Twitter link block
# Pattern for the typical footer social block ending with </a> for X/Twitter followed by </div></div>
# We look for the X/Twitter closing </a> before </div></div> in footer context

$tiktokHtml = @'
<a aria-label="Zavron Solutions on TikTok" class="footer-social-link" href="https://www.tiktok.com/@zavronsolutions" rel="noopener noreferrer" target="_blank">
<svg fill="currentColor" height="18" viewBox="0 0 24 24" width="18"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.84 1.55V6.79a4.85 4.85 0 0 1-1.07-.1z"/></svg>
</a>
<a aria-label="Zavron Solutions on YouTube" class="footer-social-link" href="https://www.youtube.com/@ZavronSolutions" rel="noopener noreferrer" target="_blank">
<svg fill="currentColor" height="18" viewBox="0 0 24 24" width="18"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="#fff" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
</a>
<a aria-label="Zavron Solutions on Pinterest" class="footer-social-link" href="https://www.pinterest.com/zavronsolutions" rel="noopener noreferrer" target="_blank">
<svg fill="currentColor" height="18" viewBox="0 0 24 24" width="18"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
</a>
'@

# For the regular footer pages, the X/Twitter link ends with the svg path and then </svg></a>
# followed by </div></div> (closing footer-social div and brand div)
# We need to match the X twitter closing and insert before the first </div>

# Pattern: the X twitter link in typical pages (non-index) ends like:
# </svg>
# </a>
# </div>
# </div>
# <!-- Col 2 -->

# For index.html the structure is slightly different

foreach ($file in $htmlFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $original = $content

    # Check if already has TikTok (skip if already updated)
    if ($content -match 'tiktok\.com/@zavronsolutions') {
        continue
    }

    # Check if this file has a footer social section with X/Twitter
    if (-not ($content -match 'x\.com/ZavronSolutions')) {
        continue
    }

    # Pattern 1: typical pages - X twitter link followed by closing divs
    # Match: the X twitter link block (aria-label X/Twitter) followed by </a> then </div></div>
    $pattern1 = '(aria-label="Zavron Solutions on X \(Twitter\)"[^>]*>[\s\S]*?ZavronSolutions[\s\S]*?</a>\s*)(</div>\s*</div>)'
    
    if ($content -match $pattern1) {
        $content = $content -replace $pattern1, ("`$1" + $tiktokHtml + "`n`$2")
        
        if ($content -ne $original) {
            [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
            $relPath = $file.FullName.Replace($root, '')
            Write-Host "Added TikTok/YouTube/Pinterest to: $relPath"
            $totalReplaced++
        }
    }
}

Write-Host ""
Write-Host "Done! Added new social icons to $totalReplaced files."
