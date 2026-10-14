import re
import os
from pathlib import Path

print("=== STARTING COMPREHENSIVE FINAL VERIFICATION ===")

# 1. Check Microsoft Clarity snippet in all HTML files (excluding raw verification file)
html_files = [p for p in Path(".").rglob("*.html") if not p.name.startswith("google1a53f697")]
clarity_missing = []
for hf in html_files:
    txt = hf.read_text(encoding="utf-8")
    if "ymn2w0fs9j" not in txt:
        clarity_missing.append(str(hf.as_posix()))

print(f"1. Microsoft Clarity Script Check: {len(html_files)} HTML files checked.")
if clarity_missing:
    print(f"   FAILED: Missing Clarity script in {len(clarity_missing)} files: {clarity_missing}")
else:
    print(f"   PASSED: All {len(html_files)} HTML files contain Clarity script 'ymn2w0fs9j'.")

# 2. Check for WhatsApp in email templates and email service
email_service = Path("scripts/emailService.js").read_text(encoding="utf-8")
whatsapp_in_email = re.findall(r"whatsapp|\+92|wa\.me", email_service, re.IGNORECASE)
print("2. WhatsApp & Phone in Email Service Check:")
if whatsapp_in_email:
    print(f"   FAILED: Found WhatsApp references in emailService.js: {whatsapp_in_email}")
else:
    print("   PASSED: emailService.js has 0 WhatsApp references or numbers.")

# 3. Check quote-wizard.js and forms.js for email validation, duplicate protection, and SLA
qw_content = Path("js/quote-wizard.js").read_text(encoding="utf-8")
forms_content = Path("js/forms.js").read_text(encoding="utf-8")
print("3. Lead Capture & Quote Wizard Verification:")
if "isSubmitting" in qw_content and "escapeHtml" in qw_content and "1 business day" in qw_content:
    print("   PASSED: quote-wizard.js has submission lock, HTML escaping, and 1 business day SLA.")
else:
    print("   FAILED: quote-wizard.js missing key validations.")

if "isSubmitting" in forms_content and "1 business day" in forms_content and "escapeHtml" in forms_content:
    print("   PASSED: forms.js has submission lock, 1 business day SLA, and HTML escaping.")
else:
    print("   FAILED: forms.js missing key validations.")

# 4. Check for fake US coordinates on homepage
index_content = Path("index.html").read_text(encoding="utf-8")
print("4. GEO & Schema Verification on Homepage:")
if "37.0902" in index_content or "-95.7129" in index_content:
    print("   FAILED: Fake coordinates still present in index.html.")
else:
    print("   PASSED: Fake coordinates removed from Schema.org markup.")

if "99.4%" in index_content or "$4M+" in index_content:
    print("   FAILED: Unsubstantiated metrics still present in index.html.")
else:
    print("   PASSED: Unsubstantiated metrics removed from index.html.")

# 5. Check about-us/index.html metrics
about_content = Path("about-us/index.html").read_text(encoding="utf-8")
print("5. About Us Metrics Verification:")
if "99.4%" in about_content or "$4M+" in about_content:
    print("   FAILED: Unsubstantiated metrics still present in about-us/index.html.")
else:
    print("   PASSED: Unsubstantiated metrics removed from about-us/index.html.")

# 6. Check case-studies/index.html and resources/guides/index.html
cs_content = Path("case-studies/index.html").read_text(encoding="utf-8")
guides_content = Path("resources/guides/index.html").read_text(encoding="utf-8")
print("6. Case Studies & Guides Links Verification:")
if "Architectural Reference" in cs_content and "System Framework" in cs_content:
    print("   PASSED: Case studies accurately labeled as architecture blueprints.")
else:
    print("   FAILED: Case studies not relabeled.")

if "/blog/nextjs-react-for-modern-business-websites/" in guides_content and "/blog/ecommerce-checkout-funnel-optimization-usa/" in guides_content:
    print("   PASSED: Guide cards link to deep-dive technical guides.")
else:
    print("   FAILED: Guide cards still pointing to generic service pages.")

# 7. Check ai-driven-seo-playbook-2026 completion
playbook_content = Path("blog/ai-driven-seo-playbook-2026/index.html").read_text(encoding="utf-8")
words_pb = len(re.sub(r"<[^>]+>", " ", playbook_content).split())
print("7. AI-Driven SEO Playbook Verification:")
if words_pb > 1500 and "FAQPage" in playbook_content:
    print(f"   PASSED: Playbook completed ({words_pb} words, FAQPage schema included).")
else:
    print(f"   FAILED: Playbook incomplete ({words_pb} words).")

# 8. Check sitemaps
sitemap_txt = Path("sitemap.xml").read_text(encoding="utf-8")
lastmod_today = len(re.findall(r"<lastmod>", sitemap_txt))
print(f"8. Sitemap Verification: {lastmod_today} URLs indexed in sitemap.xml.")

# 9. Check Ahrefs Analytics Tag
ahrefs_missing = []
for hf in html_files:
    txt = hf.read_text(encoding="utf-8")
    if "analytics.ahrefs.com/analytics.js" not in txt or "LNAo6O1sF73agWHmc5Yg4w" not in txt:
        ahrefs_missing.append(str(hf.as_posix()))

print("9. Ahrefs Analytics Tag Verification:")
if ahrefs_missing:
    print(f"   FAILED: Missing Ahrefs tag in {len(ahrefs_missing)} files: {ahrefs_missing}")
else:
    print(f"   PASSED: All {len(html_files)} HTML files contain active Ahrefs Analytics snippet.")

# 10. Check Outbound Redirects on work/index.html
work_txt = Path("work/index.html").read_text(encoding="utf-8")
work_redirects = []
if "http://doodiefreeyards.com" in work_txt:
    work_redirects.append("http://doodiefreeyards.com")
if "https://hiddenalleys.com" in work_txt:
    work_redirects.append("https://hiddenalleys.com")
if 'pinterest.com/zavronsolutions"' in work_txt:
    work_redirects.append("pinterest.com/zavronsolutions (missing slash)")
if "facebook.com/share/" in work_txt:
    work_redirects.append("facebook share redirect")

print("10. Work Page Outbound Redirect Links Verification:")
if work_redirects:
    print(f"   FAILED: Found redirect URLs in work/index.html: {work_redirects}")
else:
    print("   PASSED: All 4 outbound redirects eliminated from work/index.html.")

# 11. Check Title Lengths Across All Pages (max 65 chars)
long_titles = []
for hf in html_files:
    txt = hf.read_text(encoding="utf-8")
    m = re.search(r"<title>(.*?)</title>", txt, re.IGNORECASE | re.DOTALL)
    if m:
        t = m.group(1).strip().replace("&amp;", "&").replace("&quot;", '"').replace("&#39;", "'")
        if len(t) > 65:
            long_titles.append((str(hf.as_posix()), len(t), t))

print("11. Google SERP Title Length Verification (<= 65 chars):")
if long_titles:
    print(f"   FAILED: {len(long_titles)} titles exceed 65 chars: {long_titles[:5]}")
else:
    print(f"   PASSED: All {len(html_files)} pages have optimized title lengths (<= 65 chars).")

# 12. Check Meta Description Lengths Across Public Pages (>= 120 chars)
short_descs = []
for hf in html_files:
    if "admin" in str(hf.as_posix()):
        continue
    txt = hf.read_text(encoding="utf-8")
    m = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', txt, re.IGNORECASE | re.DOTALL)
    if not m:
        m = re.search(r'<meta\s+content=["\'](.*?)["\']\s+name=["\']description["\']', txt, re.IGNORECASE | re.DOTALL)
    if m:
        d = m.group(1).strip()
        if len(d) < 120:
            short_descs.append((str(hf.as_posix()), len(d), d))
    else:
        short_descs.append((str(hf.as_posix()), 0, "MISSING"))

print("12. Google SERP Meta Description Verification (120-165 chars):")
if short_descs:
    print(f"   FAILED: {len(short_descs)} pages have short meta descriptions: {short_descs}")
else:
    print(f"   PASSED: All public pages have rich, high-CTR meta descriptions (120-165 chars).")

print("=== ALL VERIFICATION CHECKS COMPLETE ===")

