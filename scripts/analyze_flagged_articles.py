import os
import re
from pathlib import Path

blog_dir = Path("blog")
flagged = []
all_articles = []

boilerplate_pattern = re.compile(r"1\.\s*The Strategic Imperative for Modern US Businesses", re.IGNORECASE)

for p in blog_dir.rglob("index.html"):
    if p.parent == blog_dir:
        continue # skip blog index
    content = p.read_text(encoding="utf-8")
    title_match = re.search(r"<h1[^>]*>(.*?)</h1>", content, re.DOTALL | re.IGNORECASE)
    h1 = title_match.group(1).strip() if title_match else p.parent.name
    
    # Check reading time
    rt_match = re.search(r"(\d+)\s*min read", content, re.IGNORECASE)
    current_rt = rt_match.group(1) if rt_match else "None"
    
    # Strip HTML to estimate real word count in article body
    article_match = re.search(r"<article[^>]*>(.*?)</article>", content, re.DOTALL | re.IGNORECASE)
    if article_match:
        text = re.sub(r"<[^>]+>", " ", article_match.group(1))
        words = len(text.split())
    else:
        text = re.sub(r"<[^>]+>", " ", content)
        words = len(text.split())
        
    calc_rt = max(1, round(words / 220))
    
    is_boilerplate = bool(boilerplate_pattern.search(content))
    if is_boilerplate:
        flagged.append((str(p.as_posix()), h1, words, current_rt, calc_rt))
    all_articles.append((str(p.as_posix()), h1, words, current_rt, calc_rt, is_boilerplate))

print(f"Total blog articles found: {len(all_articles)}")
print(f"Total articles with generic boilerplate sections: {len(flagged)}")
print("\nSample of flagged articles:")
for f in flagged[:10]:
    print(f"  {f[0]}: '{f[1]}' (Words: {f[2]}, Cur RT: {f[3]}m, Calc RT: {f[4]}m)")
