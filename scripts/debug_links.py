from pathlib import Path
import re

html_files = list(Path('blog').glob('*/index.html'))
for f in html_files[:10]:
    content = f.read_text(encoding='utf-8', errors='ignore')
    cards = re.findall(r'href="([^"]+)"[^>]*class="related-post-card"|class="related-post-card"[^>]*href="([^"]+)"', content)
    flattened = [a or b for a, b in cards]
    print(f"{f.parent.name} -> {flattened}")
