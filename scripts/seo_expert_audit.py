import os
import re
from pathlib import Path
from collections import defaultdict
from urllib.parse import urlparse

WORKSPACE = Path(".").resolve()
print(f"Auditing workspace: {WORKSPACE}")

html_files = [f for f in WORKSPACE.rglob("*.html") if not any(p in f.parts for p in ['node_modules', '.git', 'dist', '.gemini', 'tmp'])]
print(f"Total HTML files found: {len(html_files)}")

# 1. Collect all valid URLs and link graph
url_to_file = {}
file_to_url = {}

for f in html_files:
    rel = f.relative_to(WORKSPACE).as_posix()
    if 'admin' in rel:
        continue
    if rel == 'index.html':
        url = '/'
    elif rel.endswith('/index.html'):
        url = '/' + rel[:-10]
    else:
        url = '/' + rel
    url_to_file[url] = f
    file_to_url[f] = url

# Incoming links counter
incoming_links = defaultdict(set)
links_without_slash = []
http_links = []
meta_too_long = []
meta_too_short = []
missing_canonicals = []
canonical_mismatches = []
robots_blocked_links = []

for f in html_files:
    rel = f.relative_to(WORKSPACE).as_posix()
    if 'admin' in rel:
        continue
    current_url = file_to_url.get(f, '')
    content = f.read_text(encoding='utf-8', errors='ignore')

    # Check meta description
    d_match = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', content, re.IGNORECASE)
    if not d_match:
        d_match = re.search(r'<meta\s+content=["\'](.*?)["\']\s+name=["\']description["\']', content, re.IGNORECASE)
    if d_match:
        desc = d_match.group(1).strip()
        if len(desc) > 160:
            meta_too_long.append((rel, len(desc), desc))
        elif len(desc) < 50:
            meta_too_short.append((rel, len(desc), desc))

    # Check canonical
    c_match = re.search(r'<link\s+rel=["\']canonical["\']\s+href=["\'](.*?)["\']', content, re.IGNORECASE)
    if not c_match:
        c_match = re.search(r'<link\s+href=["\'](.*?)["\']\s+rel=["\']canonical["\']', content, re.IGNORECASE)
    if not c_match and f.name != '404.html':
        missing_canonicals.append(rel)
    elif c_match:
        can = c_match.group(1).strip()
        expected = f"https://www.zavronsolutions.com{current_url}"
        if can != expected and not (current_url == '/' and can == 'https://www.zavronsolutions.com/'):
            canonical_mismatches.append((rel, can, expected))

    # Extract all hrefs
    hrefs = re.findall(r'<a\s+[^>]*href=["\'](.*?)["\']', content, re.IGNORECASE)
    for href in hrefs:
        href = href.strip()
        if not href or href.startswith('#') or href.startswith('mailto:') or href.startswith('tel:'):
            continue
        if href.startswith('http://zavronsolutions.com') or href.startswith('http://www.zavronsolutions.com'):
            http_links.append((rel, href))
        if href.startswith('/admin'):
            robots_blocked_links.append((rel, href))
        
        # Check internal links without trailing slash
        if href.startswith('/') and not href.startswith('//') and not '.' in href.split('?')[0].split('#')[0]:
            clean_href = href.split('?')[0].split('#')[0]
            if not clean_href.endswith('/'):
                links_without_slash.append((rel, href))
            # Track incoming internal link
            target_url = clean_href if clean_href.endswith('/') else clean_href + '/'
            if target_url in url_to_file and current_url != target_url:
                incoming_links[target_url].add(current_url)
        elif href.startswith('https://www.zavronsolutions.com/'):
            parsed = urlparse(href)
            clean_path = parsed.path
            if clean_path in url_to_file and current_url != clean_path:
                incoming_links[clean_path].add(current_url)

print("\n--- AUDIT RESULTS ---")
print(f"Meta descriptions too long (>160 chars): {len(meta_too_long)}")
for r, l, d in meta_too_long[:10]:
    print(f"  [{l} chars] {r}: {d[:70]}...")

print(f"\nLinks without trailing slash (causes 301/308 redirects): {len(links_without_slash)}")
for r, h in links_without_slash[:10]:
    print(f"  From {r} -> {h}")

print(f"\nHTTP links to own domain (causes HTTP to HTTPS redirect): {len(http_links)}")
for r, h in http_links[:10]:
    print(f"  From {r} -> {h}")

print(f"\nInternal links to /admin/ (blocked by robots.txt): {len(robots_blocked_links)}")
for r, h in set(robots_blocked_links):
    print(f"  From {r} -> {h}")

# Pages with only 1 incoming link
only_one_incoming = []
zero_incoming = []
for url in url_to_file:
    if url == '/' or url == '/404.html':
        continue
    count = len(incoming_links[url])
    if count == 1:
        only_one_incoming.append((url, list(incoming_links[url])[0]))
    elif count == 0:
        zero_incoming.append(url)

print(f"\nPages with ZERO incoming internal links (Orphan Pages): {len(zero_incoming)}")
for u in zero_incoming[:10]:
    print(f"  {u}")

print(f"\nPages with ONLY ONE incoming internal link: {len(only_one_incoming)}")
for u, src in only_one_incoming[:10]:
    print(f"  {u} (only from {src})")
