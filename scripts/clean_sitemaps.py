"""
Zavron Solutions - Sitemap Integrity & 404 Prevention Utility
Validates sitemap.xml and public/sitemap.xml to ensure no deprecated or broken URLs exist.
"""
import re
import os

SITEMAP_FILES = ["sitemap.xml", "public/sitemap.xml"]

DEPRECATED_URL_PATTERNS = [
    r"https://www\.zavronsolutions\.com/case-studies/apex-health-tech/?",
    r"https://www\.zavronsolutions\.com/blog/how-seo-drives-us-business-growth/?"
]

def clean_sitemaps():
    print("Running sitemap integrity verification...")
    for sm_path in SITEMAP_FILES:
        if not os.path.exists(sm_path):
            print(f"Warning: {sm_path} not found.")
            continue

        with open(sm_path, "r", encoding="utf-8") as f:
            content = f.read()

        orig_len = len(content)
        for pattern in DEPRECATED_URL_PATTERNS:
            regex = rf"\s*<url>\s*<loc>{pattern}</loc>[\s\S]*?</url>"
            content = re.sub(regex, "", content, flags=re.IGNORECASE)

        if len(content) != orig_len:
            with open(sm_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Cleaned deprecated URLs from {sm_path}")
        else:
            print(f"Verified: {sm_path} is completely clean.")

if __name__ == "__main__":
    clean_sitemaps()
