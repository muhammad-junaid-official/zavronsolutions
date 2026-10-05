import os
import re
from pathlib import Path
import xml.etree.ElementTree as ET

WORKSPACE = Path(r"c:\Users\Tech Planet\Desktop\Zavron Solutions\zavronsolutions")

print("=== 1. Checking for deleted URLs across entire codebase ===")
bad_strings = ["apex-health-tech", "how-seo-drives-us-business-growth"]
found_bad = False
for file in WORKSPACE.rglob("*"):
    if file.is_file() and not any(part.startswith(".") or part in ["node_modules", "scripts"] for part in file.parts):
        try:
            content = file.read_text(encoding="utf-8", errors="ignore")
            for b in bad_strings:
                if b in content:
                    print(f"FOUND {b} in {file.relative_to(WORKSPACE)}")
                    found_bad = True
        except Exception:
            pass

if not found_bad:
    print("ALL CLEAN: No references to deleted URLs anywhere in site!")

print("\n=== 2. Checking sitemap URLs ===")
sitemaps = [WORKSPACE / "sitemap.xml", WORKSPACE / "public" / "sitemap.xml"]
for sm in sitemaps:
    if not sm.exists():
        print(f"MISSING: {sm}")
        continue
    content = sm.read_text(encoding="utf-8")
    urls = re.findall(r'<loc>(https?://[^<]+)</loc>', content)
    print(f"{sm.name}: found {len(urls)} URLs")
    missing_pages = 0
    for u in urls:
        path_part = u.replace("https://www.zavronsolutions.com", "").strip("/")
        if not path_part:
            expected_file = WORKSPACE / "index.html"
        else:
            expected_file = WORKSPACE / path_part / "index.html"
            if not expected_file.exists():
                expected_file = WORKSPACE / f"{path_part}.html"
        
        if not expected_file.exists():
            print(f"  Missing file for sitemap URL: {u} -> expected {expected_file}")
            missing_pages += 1
    if missing_pages == 0:
        print(f"  ALL {len(urls)} URLs map to existing HTML files!")

print("\n=== 3. Canonical tags check ===")
dup_canonicals = 0
for html_file in WORKSPACE.rglob("*.html"):
    if "admin" in str(html_file) or ".git" in str(html_file) or "node_modules" in str(html_file) or "google" in html_file.name:
        continue
    content = html_file.read_text(encoding="utf-8", errors="ignore")
    canonicals = re.findall(r'<link[^>]+rel=["\']canonical["\'][^>]*>', content)
    if len(canonicals) > 1:
        print(f"Multiple canonicals in {html_file.relative_to(WORKSPACE)}: {canonicals}")
        dup_canonicals += 1
    elif len(canonicals) == 0 and html_file.name != "404.html":
        print(f"Missing canonical in {html_file.relative_to(WORKSPACE)}")

if dup_canonicals == 0:
    print("Canonical tags verified: No duplicates found.")

print("\n=== 4. Checking H1 tags ===")
multi_h1 = 0
no_h1 = 0
for html_file in WORKSPACE.rglob("*.html"):
    if "admin" in str(html_file) or ".git" in str(html_file) or "node_modules" in str(html_file) or "google" in html_file.name:
        continue
    content = html_file.read_text(encoding="utf-8", errors="ignore")
    h1s = re.findall(r'<h1[^>]*>([\s\S]*?)</h1>', content, re.IGNORECASE)
    if len(h1s) > 1:
        print(f"Multiple H1s ({len(h1s)}) in {html_file.relative_to(WORKSPACE)}")
        multi_h1 += 1
    elif len(h1s) == 0:
        print(f"No H1 in {html_file.relative_to(WORKSPACE)}")
        no_h1 += 1

print(f"H1 check complete: {multi_h1} multiple H1s, {no_h1} missing H1s.")

print("\n=== Verification finished ===")
