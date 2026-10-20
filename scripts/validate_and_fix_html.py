import re
import html
from pathlib import Path

WORKSPACE = Path(".").resolve()
blog_index = (WORKSPACE / "blog" / "index.html").read_text(encoding="utf-8")

# Extract all blog cards from blog/index.html
pattern = r'<article\s+class="blog-card[^"]*"\s+data-category="([^"]+)"[^>]*>[\s\S]*?<img\s+[^>]*src="([^"]+)"[\s\S]*?<h2 class="blog-card-title">\s*<a\s+href="([^"]+)">([^<]+)</a>[\s\S]*?<p class="blog-card-desc">\s*([^<]+)</p>'
matches = re.findall(pattern, blog_index)

print(f"Total parsed articles from blog/index.html: {len(matches)}")

category_parent_map = {
    "web-development": ("/services/web-development/", "Custom Web Development Services"),
    "wordpress-development": ("/services/wordpress-development/", "Enterprise WordPress Solutions"),
    "ecommerce-development": ("/services/ecommerce-development/", "E-Commerce & Shopify Plus Solutions"),
    "seo": ("/services/seo/", "Technical SEO & Organic Growth Services"),
    "local-seo": ("/services/local-seo/", "Local SEO & Google Map Pack Solutions"),
    "technical-seo": ("/services/technical-seo/", "Technical SEO & Speed Engineering"),
    "ecommerce-seo": ("/services/ecommerce-seo/", "E-Commerce SEO & Catalog Architecture"),
    "digital-marketing": ("/services/digital-marketing/", "B2B Performance Marketing & PPC"),
    "google-ads": ("/services/google-ads/", "Google Ads & Paid Search Management"),
    "social-media-marketing": ("/services/social-media-marketing/", "Paid Social & Multi-Channel Marketing"),
    "ui-ux-design": ("/services/ui-ux-design/", "UI/UX Design Systems & Conversion Architecture"),
    "real-estate": ("/industries/real-estate/", "Real Estate Digital Platforms"),
    "healthcare": ("/industries/healthcare/", "Healthcare & Medical Web Systems"),
    "ecommerce": ("/industries/ecommerce/", "Retail & DTC E-Commerce Solutions"),
    "restaurants": ("/industries/restaurants/", "Hospitality & Restaurant Digital Systems"),
    "law-firms": ("/industries/law-firms/", "Legal Services & Law Firm Web Design"),
    "construction": ("/industries/construction/", "Commercial Contractor & Construction Marketing"),
    "saas-technology": ("/industries/saas-technology/", "B2B SaaS & Tech Web Systems"),
    "professional-services": ("/industries/professional-services/", "Professional Services & Consultancy Platforms"),
    "small-business": ("/industries/small-business/", "Small Business Growth & Digital Solutions")
}

category_labels = {
    "web-development": "Web Development",
    "wordpress-development": "WordPress Development",
    "ecommerce-development": "E-Commerce Development",
    "seo": "SEO & Growth",
    "local-seo": "Local SEO",
    "technical-seo": "Technical SEO",
    "ecommerce-seo": "E-Commerce SEO",
    "digital-marketing": "Digital Marketing",
    "google-ads": "Google Ads",
    "social-media-marketing": "Social Media Marketing",
    "ui-ux-design": "UI/UX Design",
    "real-estate": "Real Estate",
    "healthcare": "Healthcare",
    "ecommerce": "E-Commerce",
    "restaurants": "Restaurants & Hospitality",
    "law-firms": "Law Firms",
    "construction": "Construction & Contractors",
    "saas-technology": "SaaS & Technology",
    "professional-services": "Professional Services",
    "small-business": "Small Business"
}

from collections import defaultdict
clusters = defaultdict(list)
article_map = {}

for cat, img, href, title, desc in matches:
    slug = href.strip("/").split("/")[-1]
    info = {
        "slug": slug,
        "href": href,
        "title": title.strip(),
        "desc": desc.strip(),
        "img": img.strip(),
        "category": cat
    }
    clusters[cat].append(info)
    article_map[slug] = info

if "ai-driven-seo-playbook-2026" not in article_map:
    ai_seo = {
        "slug": "ai-driven-seo-playbook-2026",
        "href": "/blog/ai-driven-seo-playbook-2026/",
        "title": "AI Driven SEO Playbook 2026",
        "desc": "Discover how AI-driven SEO playbooks are powering organic search growth for US companies in 2026.",
        "img": "/blog/ai-driven-seo-playbook-2026/featured.svg",
        "category": "seo"
    }
    clusters["seo"].append(ai_seo)
    article_map["ai-driven-seo-playbook-2026"] = ai_seo

updated_count = 0

for slug, current_article in article_map.items():
    file_path = WORKSPACE / "blog" / slug / "index.html"
    if not file_path.exists():
        continue
    
    content = file_path.read_text(encoding="utf-8", errors="ignore")
    cat = current_article["category"]
    cat_label = category_labels.get(cat, "Strategic Insights")
    parent_url, parent_name = category_parent_map.get(cat, ("/services/", "Strategic Digital Services"))
    
    siblings = [a for a in clusters[cat] if a["slug"] != slug]
    if len(siblings) < 4:
        fallback = [a for a in clusters["technical-seo"] if a["slug"] != slug and a not in siblings]
        siblings.extend(fallback[:4 - len(siblings)])
    
    selected_siblings = siblings[:4]
    
    cards_html = []
    for sib in selected_siblings:
        img_src = sib["img"]
        sib_cat_label = category_labels.get(sib["category"], cat_label)
        # CRITICAL FIX: Escape quotes in HTML attributes!
        escaped_alt = html.escape(sib["title"], quote=True)
        # Ensure any text inside <h4> is also clean
        display_title = html.escape(html.unescape(sib["title"]))
        
        card = f'''<a class="related-post-card" href="{sib["href"]}">
<div class="related-post-img">
<img alt="{escaped_alt}" height="225" loading="lazy" src="{img_src}" width="400"/>
</div>
<div class="related-post-body">
<span class="related-post-cat">{sib_cat_label}</span>
<h4 class="related-post-title">{display_title}</h4>
<span class="related-post-link">Read Analysis →</span>
</div>
</a>'''
        cards_html.append(card)
    
    related_block = f'''<!-- Related Posts & Topic Cluster -->
<div class="related-posts-section">
<div class="related-posts-header">
<span class="related-posts-label">{cat_label.upper()} CLUSTER</span>
<h3 class="related-posts-title">Related Guides &amp; Analyses</h3>
</div>
<div class="related-posts-grid">
{"".join(cards_html)}
</div>
<div style="margin-top: 1.75rem; padding: 1.25rem; background: rgba(0, 210, 255, 0.05); border: 1px solid rgba(0, 210, 255, 0.2); border-radius: 10px; text-align: center; font-size: 0.95rem; color: #CBD5E1;">
Need specialized enterprise solutions? Explore our <a href="{parent_url}" style="color: #00D2FF; text-decoration: underline; font-weight: 600;">{parent_name}</a> or <a href="/get-a-free-quote/" style="color: #FF7A00; text-decoration: underline; font-weight: 600;">Request a Custom Proposal →</a>
</div>
</div>'''

    if 'class="related-posts-section"' in content:
        new_content = re.sub(
            r'<!--\s*Related Posts[\s\S]*?-->\s*<div class="related-posts-section">[\s\S]*?</div>\s*</div>',
            related_block,
            content,
            count=1
        )
        if new_content == content:
            new_content = re.sub(
                r'<div class="related-posts-section">[\s\S]*?</div>\s*</div>',
                related_block,
                content,
                count=1
            )
    else:
        if '<div class="blog-author-card">' in content:
            new_content = content.replace('<div class="blog-author-card">', related_block + '\n\n<div class="blog-author-card">', 1)
        elif '</div><!-- /.article-content-wrap -->' in content:
            new_content = content.replace('</div><!-- /.article-content-wrap -->', related_block + '\n</div><!-- /.article-content-wrap -->', 1)
        elif '</article>' in content:
            new_content = content.replace('</article>', related_block + '\n</article>', 1)
        else:
            new_content = content

    if new_content != content:
        file_path.write_text(new_content, encoding="utf-8")
        updated_count += 1

print(f"Updated {updated_count} articles with properly HTML-escaped attributes!")
