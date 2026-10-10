import re
from pathlib import Path
from collections import defaultdict

blog_dir = Path("blog")
categories = defaultdict(list)
boilerplate_pattern = re.compile(r"1\.\s*The Strategic Imperative for Modern US Businesses", re.IGNORECASE)

for p in blog_dir.rglob("index.html"):
    if p.parent == blog_dir:
        continue
    content = p.read_text(encoding="utf-8")
    if boilerplate_pattern.search(content):
        h1_m = re.search(r"<h1[^>]*>(.*?)</h1>", content, re.DOTALL | re.IGNORECASE)
        h1 = h1_m.group(1).strip() if h1_m else p.parent.name
        cat_m = re.search(r'<span class="eyebrow-pill[^"]*"[^>]*>(.*?)</span>', content, re.DOTALL | re.IGNORECASE)
        cat = cat_m.group(1).strip() if cat_m else "General"
        categories[cat].append((p, h1))

print(f"Categories across 72 flagged articles ({len(categories)} unique categories):")
for cat, items in sorted(categories.items(), key=lambda x: len(x[1]), reverse=True):
    print(f"\n[{cat}] ({len(items)} articles):")
    for p, h1 in items[:3]:
        print(f"  - {p.parent.name}: {h1[:60]}...")
