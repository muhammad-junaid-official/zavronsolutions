import os
import shutil
import re
from pathlib import Path

WORKSPACE = Path(r"c:\Users\Tech Planet\Desktop\Zavronsolutions\zavronsolutions")

print("=== 1. Removing docs directory ===")
docs_dir = WORKSPACE / "docs"
if docs_dir.exists():
    shutil.rmtree(docs_dir)
    print("Deleted docs/ directory successfully.")
else:
    print("docs/ directory already does not exist.")

print("\n=== 2. Cleaning sitemaps ===")
sitemaps = [WORKSPACE / "sitemap.xml", WORKSPACE / "public" / "sitemap.xml"]
for sm in sitemaps:
    if sm.exists():
        content = sm.read_text(encoding="utf-8")
        orig_len = len(content)
        content = re.sub(r'\s*<url>\s*<loc>https://www\.zavronsolutions\.com/docs/</loc>[\s\S]*?</url>', '', content, flags=re.IGNORECASE)
        if len(content) != orig_len:
            sm.write_text(content, encoding="utf-8")
            print(f"Removed /docs/ from {sm.name}")
        else:
            print(f"/docs/ not found in {sm.name}")

print("\n=== 3. Updating 404.html and public/404.html ===")
pages_404 = [WORKSPACE / "404.html", WORKSPACE / "public" / "404.html"]
for p in pages_404:
    if not p.exists():
        continue
    content = p.read_text(encoding="utf-8")
    
    # 1. Remove from nav dropdown:
    # <a class="dropdown-item" href="/docs/">...</a>
    content = re.sub(
        r'\s*<a\s+class="dropdown-item"\s+href="/docs/">[\s\S]*?</a>',
        '',
        content,
        flags=re.IGNORECASE
    )
    
    # 2. Replace Card 4 (docs) with Portfolio / Work card:
    old_card_pattern = r'<!-- Card 4: Agency Documentation -->\s*<a\s+href="/docs/"\s+class="not-found-card">[\s\S]*?</a>'
    new_card = '''<!-- Card 4: Client Portfolio & Work -->
          <a href="/work/" class="not-found-card">
            <div class="not-found-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <div>
              <div class="not-found-card-title">
                Client Portfolio &amp; Work
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>
              <p class="not-found-card-desc">Explore verified case studies, technical deliverables, and measurable growth results.</p>
            </div>
          </a>'''
    content = re.sub(old_card_pattern, new_card, content, flags=re.IGNORECASE)
    
    # 3. Remove /docs/ links from footer:
    content = re.sub(r'\s*<a\s+href="/docs/"\s+class="footer-link">[^<]*</a>', '', content, flags=re.IGNORECASE)
    
    p.write_text(content, encoding="utf-8")
    print(f"Updated {p.name}")

print("\n=== Done removing docs ===")
