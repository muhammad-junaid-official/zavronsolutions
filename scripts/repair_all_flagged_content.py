import re
from pathlib import Path
from build_content_repair_dict import CATEGORY_KNOWLEDGE

blog_dir = Path("blog")
boilerplate_pattern = re.compile(r"<h2>1\.\s*The Strategic Imperative for Modern US Businesses</h2>", re.IGNORECASE)
end_pattern = re.compile(r"(<!-- Contextual Service Navigation Pills -->|<div style=\"background:var\(--color-bg-alt\))", re.IGNORECASE)

repaired_count = 0
all_articles_count = 0
updated_reading_times = 0

for p in blog_dir.rglob("index.html"):
    if p.parent == blog_dir:
        continue  # skip blog index
    all_articles_count += 1
    content = p.read_text(encoding="utf-8")
    original_content = content
    
    # Check if article has the boilerplate
    start_match = boilerplate_pattern.search(content)
    if start_match:
        h1_m = re.search(r"<h1[^>]*>(.*?)</h1>", content, re.DOTALL | re.IGNORECASE)
        h1 = h1_m.group(1).strip() if h1_m else p.parent.name
        clean_title = re.sub(r"<[^>]+>", "", h1).strip()
        
        cat_m = re.search(r'<span class="eyebrow-pill[^"]*"[^>]*>(.*?)</span>', content, re.DOTALL | re.IGNORECASE)
        raw_cat = cat_m.group(1).strip() if cat_m else "WEB DEVELOPMENT"
        cat_key = raw_cat.replace("&amp;", "&").upper()
        cat_info = CATEGORY_KNOWLEDGE.get(cat_key, CATEGORY_KNOWLEDGE["WEB DEVELOPMENT"])
        
        new_sections = f"""<h2>1. Strategic Imperative: {clean_title}</h2>
<p>
  In today's digital landscape, executing effectively on <strong>{clean_title}</strong> requires moving beyond surface-level design templates. {cat_info['s1_desc']} For US mid-market leaders and enterprise stakeholders, digital architecture must be engineered to deliver measurable operational throughput and lasting competitive advantage.
</p>
<div class="article-callout">
  <strong>Key Strategic Principle:</strong>
  <p>
    Sustainable market differentiation is achieved when high-performance web engineering directly aligns with customer intent and zero-latency transaction paths. Explore our dedicated <a href="/services/">engineering and digital capabilities</a> to review our technical standards.
  </p>
</div>

<h2>2. Core Architectural Framework &amp; Technical Execution</h2>
<p>
  Successfully implementing this strategy requires adhering to rigorous engineering standards across infrastructure, data layer, and user interaction design:
</p>
<ul>
  <li><strong>{cat_info['pillars'][0][0]}:</strong> {cat_info['pillars'][0][1]}</li>
  <li><strong>{cat_info['pillars'][1][0]}:</strong> {cat_info['pillars'][1][1]}</li>
  <li><strong>{cat_info['pillars'][2][0]}:</strong> {cat_info['pillars'][2][1]}</li>
</ul>

<h2>3. Quantifying Performance Impact &amp; Commercial ROI</h2>
<p>
  Superficial vanity metrics offer zero commercial clarity. Sustainable leadership teams focus on attributable revenue metrics, conversion velocity, and total cost of ownership. {cat_info['kpis']}
</p>
<p>
  By aligning real-time telemetry with enterprise conversion pipelines, organizations can isolate exactly which technical enhancements drive high-margin client acquisition. Review our <a href="/work/">verified client case studies</a> to examine real production outcomes.
</p>

<h2>4. Actionable Next Steps: Implementation Roadmap</h2>
<p>
  Begin by conducting a comprehensive audit of your existing system architecture and conversion funnels. Identify critical friction points, latency bottlenecks, and unoptimized customer touchpoints. For tailored guidance, explore our specialized <a href="/industries/">industry solutions</a> or consult with our technical architects.
</p>"""
        
        start_pos = start_match.start()
        end_match = end_pattern.search(content, start_pos)
        if end_match:
            end_pos = end_match.start()
            content = content[:start_pos] + new_sections + "\n" + content[end_pos:]
            repaired_count += 1
        else:
            print(f"Warning: End marker not found for {p}")
            
    # Calculate real reading time based on total word count
    text_only = re.sub(r"<[^>]+>", " ", content)
    words = len(text_only.split())
    real_rt = max(3, round(words / 220))
    
    # Update reading time badges
    new_content = re.sub(r"•\s*\d+\s*min read", f"• {real_rt} min read", content)
    new_content = re.sub(r'<span class="hero-pill-badge">\d+\s*min read</span>', f'<span class="hero-pill-badge">{real_rt} min read</span>', new_content)
    
    if new_content != original_content:
        p.write_text(new_content, encoding="utf-8")
        updated_reading_times += 1

print(f"Processed {all_articles_count} total articles.")
print(f"Successfully repaired {repaired_count} boilerplate articles.")
print(f"Updated {updated_reading_times} articles with accurate word count-based reading times.")
