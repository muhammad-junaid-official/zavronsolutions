import re
from pathlib import Path
from collections import defaultdict

WORKSPACE = Path(".").resolve()
blog_index = (WORKSPACE / "blog" / "index.html").read_text(encoding="utf-8")

# Extract all blog cards
pattern = r'<article\s+class="blog-card[^"]*"\s+data-category="([^"]+)"[^>]*>[\s\S]*?<h2 class="blog-card-title">\s*<a\s+href="([^"]+)">([^<]+)</a>[\s\S]*?<p class="blog-card-desc">\s*([^<]+)</p>'
matches = re.findall(pattern, blog_index)

print(f"Total matched cards: {len(matches)}")

clusters = defaultdict(list)
article_map = {}

for cat, href, title, desc in matches:
    slug = href.strip("/").split("/")[-1]
    info = {
        "slug": slug,
        "href": href,
        "title": title.strip(),
        "desc": desc.strip(),
        "category": cat
    }
    clusters[cat].append(info)
    article_map[slug] = info

print("\nClusters breakdown:")
for cat, items in clusters.items():
    print(f"  {cat}: {len(items)} posts")

# Check if each blog directory exists
missing_dirs = []
for slug in article_map:
    dir_path = WORKSPACE / "blog" / slug
    if not dir_path.exists():
        missing_dirs.append(slug)

print(f"\nMissing blog directories: {len(missing_dirs)}")
