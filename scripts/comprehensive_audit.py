import os
import re
import json
from pathlib import Path

workspace = Path(r"c:\Users\Tech Planet\Desktop\Zavron Solutions\zavronsolutions")
html_files = [f for f in workspace.rglob("*.html") if not any(p in f.parts for p in ['node_modules', '.git', 'dist', '.gemini', 'tmp'])]

print(f"Total HTML files found: {len(html_files)}")

issues = {
    'missing_title': [],
    'missing_desc': [],
    'missing_canonical': [],
    'non_https_canonical': [],
    'canonical_mismatch': [],
    'missing_h1': [],
    'multi_h1': [],
    'missing_og_title': [],
    'missing_og_desc': [],
    'missing_og_image': [],
    'missing_og_url': [],
    'missing_twitter_card': [],
    'missing_schema': [],
    'invalid_schema_json': [],
    'noindex_files': [],
    'broken_internal_links': [],
    'images_missing_alt': []
}

schema_types = {}
all_urls = set()
all_internal_links = []

# First collect all valid relative URLs
for f in html_files:
    rel = f.relative_to(workspace).as_posix()
    if rel == 'index.html':
        url_path = '/'
    elif rel.endswith('/index.html'):
        url_path = '/' + rel[:-10]
    else:
        url_path = '/' + rel
    all_urls.add(url_path)

print(f"Valid relative site paths: {len(all_urls)}")

for f in html_files:
    rel = f.relative_to(workspace).as_posix()
    content = f.read_text(encoding='utf-8', errors='ignore')
    
    is_admin = 'admin' in rel
    is_404 = '404' in rel
    is_google_verify = 'google' in rel
    
    if is_google_verify:
        continue
        
    # Title
    t_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE | re.DOTALL)
    if not t_match or not t_match.group(1).strip():
        issues['missing_title'].append(rel)
        
    # Meta desc
    d_match = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', content, re.IGNORECASE)
    if not d_match:
        d_match = re.search(r'<meta\s+content=["\'](.*?)["\']\s+name=["\']description["\']', content, re.IGNORECASE)
    if not d_match or not d_match.group(1).strip():
        if not is_admin and not is_404:
            issues['missing_desc'].append(rel)
            
    # Canonical
    c_match = re.search(r'<link\s+rel=["\']canonical["\']\s+href=["\'](.*?)["\']', content, re.IGNORECASE)
    if not c_match:
        c_match = re.search(r'<link\s+href=["\'](.*?)["\']\s+rel=["\']canonical["\']', content, re.IGNORECASE)
    if not c_match:
        if not is_admin and not is_404:
            issues['missing_canonical'].append(rel)
    else:
        can_url = c_match.group(1).strip()
        if not can_url.startswith('https://www.zavronsolutions.com/'):
            issues['non_https_canonical'].append((rel, can_url))
            
    # H1
    h1s = re.findall(r'<h1[^>]*>([\s\S]*?)</h1>', content, re.IGNORECASE)
    if len(h1s) == 0 and not is_admin and not is_404:
        issues['missing_h1'].append(rel)
    elif len(h1s) > 1 and not is_admin and not is_404:
        issues['multi_h1'].append((rel, len(h1s)))
        
    # Robots noindex
    rob = re.search(r'<meta\s+name=["\']robots["\']\s+content=["\'](.*?)["\']', content, re.IGNORECASE)
    if rob and 'noindex' in rob.group(1).lower():
        issues['noindex_files'].append((rel, rob.group(1)))
        
    # OG tags
    if not is_admin and not is_404:
        if not re.search(r'<meta\s+property=["\']og:title["\']', content, re.IGNORECASE):
            issues['missing_og_title'].append(rel)
        if not re.search(r'<meta\s+property=["\']og:description["\']', content, re.IGNORECASE):
            issues['missing_og_desc'].append(rel)
        if not re.search(r'<meta\s+property=["\']og:image["\']', content, re.IGNORECASE):
            issues['missing_og_image'].append(rel)
        if not re.search(r'<meta\s+property=["\']og:url["\']', content, re.IGNORECASE):
            issues['missing_og_url'].append(rel)
        if not re.search(r'<meta\s+name=["\']twitter:card["\']', content, re.IGNORECASE):
            issues['missing_twitter_card'].append(rel)
            
    # Schema
    schemas = re.findall(r'<script\s+type=["\']application/ld\+json["\']>([\s\S]*?)</script>', content, re.IGNORECASE)
    if not schemas and not is_admin and not is_404:
        issues['missing_schema'].append(rel)
    for s_txt in schemas:
        try:
            s_json = json.loads(s_txt.strip())
            if isinstance(s_json, dict):
                stype = s_json.get('@type', 'Graph' if '@graph' in s_json else 'Unknown')
                schema_types[stype] = schema_types.get(stype, 0) + 1
            elif isinstance(s_json, list):
                for item in s_json:
                    stype = item.get('@type', 'Unknown')
                    schema_types[stype] = schema_types.get(stype, 0) + 1
        except Exception as e:
            issues['invalid_schema_json'].append((rel, str(e)))
            
    # Images alt check
    img_tags = re.findall(r'<img\s+[^>]*>', content, re.IGNORECASE)
    for img in img_tags:
        if 'alt=' not in img.lower():
            issues['images_missing_alt'].append((rel, img[:60]))

print("\n=== AUDIT SUMMARY ===")
for k, v in issues.items():
    print(f"{k}: {len(v)}")
    if len(v) > 0 and len(v) <= 10:
        print(f"   -> {v}")
    elif len(v) > 10:
        print(f"   -> first 5: {v[:5]}")

print(f"\nSchema Types found: {schema_types}")
