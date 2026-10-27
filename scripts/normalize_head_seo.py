#!/usr/bin/env python3
"""
Site-wide <head> normalizer for Zavron Solutions.

Fixes issues flagged by SEO auditors on every HTML page:
  * exactly one <meta charset> and one <meta name="viewport">, first in <head>
  * one clean favicon set (.ico, .svg, 96px PNG, 180px apple-touch PNG, manifest)
  * non-render-blocking Google Fonts (preconnect + preload + async swap)
  * removes <meta http-equiv> security tags (now sent as real HTTP headers in vercel.json)
  * removes plain-text email addresses from HTML (obfuscated link decoded by /js/main.js)
  * footer column titles become <p> instead of <h3> (heading-to-text ratio)
  * optional GA4 tag injection: GA4_ID=G-XXXXXXX python3 scripts/normalize_head_seo.py

Idempotent: safe to run repeatedly.
"""
import glob
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EMAIL_USER, EMAIL_DOMAIN = "zavronsolutions", "gmail.com"
EMAIL = f"{EMAIL_USER}@{EMAIL_DOMAIN}"
GA4_ID = os.environ.get("GA4_ID", "").strip()

FONT_URL = ("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800"
            "&amp;family=Inter:wght@400;500;600;700&amp;display=swap")

HEAD_TOP = ('<meta charset="UTF-8">\n'
            '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n')

ICONS_AND_FONTS = f'''  <!-- zs:icons -->
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/favicon-96x96.png" type="image/png" sizes="96x96">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">
  <link rel="manifest" href="/site.webmanifest">
  <!-- zs:fonts (non-render-blocking) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="{FONT_URL}">
  <link rel="stylesheet" href="{FONT_URL}" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="{FONT_URL}"></noscript>
'''

GA4_SNIPPET = '''  <!-- zs:ga4 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id={id}"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','{id}');</script>
'''


def strip_tags(head: str) -> str:
    pats = [
        r'[ \t]*<meta\s+charset=[^>]*>[ \t]*\n?',
        r'[ \t]*<meta\s+[^>]*name="viewport"[^>]*>[ \t]*\n?',
        r'[ \t]*<meta\s+http-equiv="(?:X-Content-Type-Options|Content-Security-Policy)"[^>]*>[ \t]*\n?',
        r'[ \t]*<noscript>\s*<link[^>]*fonts\.googleapis\.com[^>]*>\s*</noscript>[ \t]*\n?',
        r'[ \t]*<link[^>]*fonts\.googleapis\.com/css2[^>]*>[ \t]*\n?',
        r'[ \t]*<link[^>]*rel="(?:preconnect|dns-prefetch)"[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*>[ \t]*\n?',
        r'[ \t]*<link[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*rel="(?:preconnect|dns-prefetch)"[^>]*>[ \t]*\n?',
        r'[ \t]*<link[^>]*rel="(?:icon|shortcut icon|apple-touch-icon|manifest)"[^>]*>[ \t]*\n?',
        r'[ \t]*<link[^>]*href="[^"]*"[^>]*rel="(?:icon|shortcut icon|apple-touch-icon|manifest)"[^>]*>[ \t]*\n?',
        r'[ \t]*<!-- zs:(?:icons|fonts)[^>]*-->[ \t]*\n?',
        r'[ \t]*<!-- (?:Favicon|Fonts Optimization)[^>]*-->[ \t]*\n?',
        r'[ \t]*<!-- zs:ga4 -->\s*<script async src="https://www\.googletagmanager\.com[^<]*</script>\s*<script>window\.dataLayer[^<]*</script>[ \t]*\n?',
    ]
    for p in pats:
        head = re.sub(p, '', head, flags=re.I)
    return head


def fix_jsonld(html: str) -> str:
    def repl(m):
        raw = m.group(2)
        try:
            data = json.loads(raw)
        except Exception:
            return m.group(0).replace(f'"{EMAIL}"', '"https://www.zavronsolutions.com/contact/"')

        def walk(node):
            if isinstance(node, dict):
                had_email = node.get("email") == EMAIL
                if had_email:
                    del node["email"]
                    t = node.get("@type")
                    types = t if isinstance(t, list) else [t]
                    if any(x in ("Organization", "ProfessionalService", "LocalBusiness") for x in types) \
                            and "contactPoint" not in node:
                        node["contactPoint"] = {
                            "@type": "ContactPoint",
                            "contactType": "sales",
                            "url": "https://www.zavronsolutions.com/contact/",
                            "areaServed": "US",
                            "availableLanguage": ["English"],
                        }
                for k, v in list(node.items()):
                    if isinstance(v, str) and EMAIL in v:
                        node[k] = v.replace(f"Email {EMAIL}", "Contact our team").replace(EMAIL, "our contact form")
                    else:
                        walk(v)
            elif isinstance(node, list):
                for x in node:
                    walk(x)
        walk(data)
        return m.group(1) + "\n" + json.dumps(data, indent=2, ensure_ascii=False) + "\n  " + m.group(3)
    return re.sub(r'(<script type="application/ld\+json">)(.*?)(</script>)', repl, html, flags=re.S)


def fix_emails(html: str) -> str:
    html = fix_jsonld(html)

    # mailto anchors -> obfuscated anchor decoded client-side by /js/main.js
    def a_repl(m):
        attrs = m.group(1)
        inner = m.group(2).replace(EMAIL, "Email our team")
        return (f'<a href="/contact/" data-eu="{EMAIL_USER}" data-ed="{EMAIL_DOMAIN}"{attrs}>{inner}</a>')
    html = re.sub(r'<a\s+href="mailto:' + re.escape(EMAIL) + r'"([^>]*)>(.*?)</a>', a_repl, html, flags=re.S)
    html = re.sub(r'<a([^>]*?)\s+href="mailto:' + re.escape(EMAIL) + r'"([^>]*)>(.*?)</a>',
                  lambda m: f'<a href="/contact/" data-eu="{EMAIL_USER}" data-ed="{EMAIL_DOMAIN}"{m.group(1)}{m.group(2)}>'
                            f'{m.group(3).replace(EMAIL, "Email our team")}</a>', html, flags=re.S)

    html = html.replace(f'action="https://formsubmit.co/{EMAIL}"', 'action="/api/send-email"')
    html = html.replace(f"Email {EMAIL} for", "Contact our team for")
    html = html.replace(f"email {EMAIL}", "use our contact form")
    html = html.replace(f"at {EMAIL}", "through our secure contact form")
    html = html.replace(EMAIL, "our contact form")
    return html


def process(path: str) -> bool:
    with open(path, encoding="utf-8") as f:
        orig = f.read()
    m = re.search(r'<head[^>]*>(.*?)</head>', orig, flags=re.S | re.I)
    if not m:
        return False
    head = strip_tags(m.group(1))
    head = re.sub(r'\n{3,}', '\n\n', head)
    block = ICONS_AND_FONTS + (GA4_SNIPPET.format(id=GA4_ID) if GA4_ID else '')
    # icons/fonts go right after <title>/description so they're discovered early
    if '</title>' in head:
        head = head.replace('</title>', '</title>\n' + block.rstrip('\n'), 1)
    else:
        head = head.rstrip() + '\n' + block
    new_head_open = orig[m.start():m.start(1)]
    html = orig[:m.start()] + new_head_open + '\n  ' + HEAD_TOP + head.lstrip('\n') + orig[m.end(1):]

    html = re.sub(r'<h3 class="footer-col-title">(.*?)</h3>', r'<p class="footer-col-title">\1</p>', html, flags=re.S)
    html = fix_emails(html)

    if html != orig:
        with open(path, "w", encoding="utf-8") as f:
            f.write(html)
        return True
    return False


def main():
    files = [p for p in glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True)
             if "/node_modules/" not in p and "/dist/" not in p and "google1a53f" not in p]
    changed = sum(process(p) for p in files)
    print(f"normalized {changed}/{len(files)} HTML files")


if __name__ == "__main__":
    main()
