import os
import re
from pathlib import Path

WORKSPACE = Path(r"c:\Users\Tech Planet\Desktop\Zavronsolutions\zavronsolutions")

fixes = {
    "services/seo/index.html": (
        "Strategic white-hat SEO for US businesses. Drive qualified commercial traffic, build topic authority, optimize for Google SGE, and dominate search rankings."
    ),
    "blog/linkedin-b2b-advertising-strategy-guide/index.html": (
        "Harnessing job title filters and Matched Audiences to place your brand before C-suite buyers and corporate procurement teams in the US market."
    ),
    "blog/full-funnel-attribution-modeling-guide/index.html": (
        "Moving beyond last-click to data-driven multi-touch attribution that reveals the true incremental value of every marketing touchpoint for US brands."
    ),
    "services/ecommerce-development/index.html": (
        "Custom e-commerce development for US brands. Shopify Plus and WooCommerce solutions built for sub-second load times, mobile checkout, and conversions."
    ),
    "blog/shopify-plus-vs-woocommerce-enterprise-comparison/index.html": (
        "A data-backed analysis comparing checkout scalability, customization, and transaction economics for 7-figure US online retailers selecting a platform."
    ),
    "services/ecommerce-seo/index.html": (
        "Specialized e-commerce SEO for Shopify, WooCommerce, and custom stores. Capture high-intent transactional queries and maximize product catalog visibility."
    )
}

print("=== Applying specific fixes ===")
for rel_path, new_desc in fixes.items():
    full_path = WORKSPACE / rel_path
    if not full_path.exists():
        print(f"NOT FOUND: {rel_path}")
        continue
    
    print(f"Fixing {rel_path} (new len: {len(new_desc)})...")
    content = full_path.read_text(encoding="utf-8", errors="replace")
    
    content = re.sub(
        r'<meta\s+name="description"\s+content="[^"]*"',
        f'<meta content="{new_desc}" name="description"',
        content
    )
    content = re.sub(
        r'<meta\s+content="[^"]*"\s+name="description"',
        f'<meta content="{new_desc}" name="description"',
        content
    )
    full_path.write_text(content, encoding="utf-8")

print("\n=== Scanning all HTML files for meta description length > 160 ===")
long_descs = []
missing_descs = []
total_checked = 0

for html_file in WORKSPACE.rglob("*.html"):
    if "admin" in str(html_file) or ".git" in str(html_file) or "node_modules" in str(html_file):
        continue
    total_checked += 1
    content = html_file.read_text(encoding="utf-8", errors="replace")
    
    match = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', content)
    if not match:
        match = re.search(r'<meta\s+content="([^"]*)"\s+name="description"', content)
        
    rel = html_file.relative_to(WORKSPACE)
    if match:
        desc = match.group(1)
        if len(desc) > 160:
            print(f"OVER 160 ({len(desc)}): {rel} -> {desc}")
            long_descs.append((rel, len(desc), desc))
        elif len(desc) < 40:
            print(f"SHORT ({len(desc)}): {rel} -> {desc}")
    else:
        print(f"NO META DESCRIPTION: {rel}")
        missing_descs.append(rel)

print(f"\nTotal checked: {total_checked}")
print(f"Total over 160: {len(long_descs)}")
print(f"Total missing: {len(missing_descs)}")
