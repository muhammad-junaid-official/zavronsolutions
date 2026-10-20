from pathlib import Path
import re
from collections import Counter

html_files = list(Path('blog').glob('*/index.html'))
incoming_counts = Counter()

for f in html_files:
    content = f.read_text(encoding='utf-8', errors='ignore')
    cards = re.findall(r'href="(/blog/[^"/]+/)', content)
    for target in set(cards):
        incoming_counts[target] += 1

print(f"Total distinct blog URLs receiving internal links from blog posts: {len(incoming_counts)}")
print("Top 10 most linked articles:")
for url, count in incoming_counts.most_common(10):
    print(f"  {url}: {count} links")

unlinked = []
for f in html_files:
    slug = f"/blog/{f.parent.name}/"
    if slug not in incoming_counts:
        unlinked.append(slug)

print(f"\nArticles with ZERO incoming links from other blog posts: {len(unlinked)} out of {len(html_files)}")
print("First 15 unlinked articles:")
for u in unlinked[:15]:
    print(f"  {u}")
