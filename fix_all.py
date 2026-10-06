import os
import re

base_dir = r'c:\Users\xcz\OneDrive\Desktop\Zavron Video\zavronsolutions'

# 1. Shorten Titles
def shorten_title(html_path):
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    def repl_title(m):
        title = m.group(1)
        if len(title) > 60:
            parts = [p.strip() for p in title.split('|')]
            if len(parts) >= 3:
                new_title = f'{parts[0]} | {parts[-1]}'
            elif len(parts) == 2:
                new_title = f'{parts[0]} | {parts[-1]}'
                if len(new_title) > 60:
                    new_title = f'{parts[0][:40]}... | {parts[-1]}'
            else:
                new_title = title[:56] + '...'
            return f'<title>{new_title}</title>'
        return m.group(0)
    
    new_content = re.sub(r'<title>(.*?)</title>', repl_title, content)
    
    # Let's also fix the og:title and twitter:title
    def repl_meta(m):
        attr = m.group(1)
        val = m.group(2)
        if len(val) > 60:
            parts = [p.strip() for p in val.split('|')]
            if len(parts) >= 3:
                new_val = f'{parts[0]} | {parts[-1]}'
            elif len(parts) == 2:
                new_val = f'{parts[0]} | {parts[-1]}'
                if len(new_val) > 60:
                    new_val = f'{parts[0][:40]}... | {parts[-1]}'
            else:
                new_val = val[:56] + '...'
            return f'<meta {attr}="{new_val}"'
        return m.group(0)

    new_content = re.sub(r'<meta (property="og:title" content|name="twitter:title" content)="([^"]+)"', repl_meta, new_content)

    if new_content != content:
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.html'):
            shorten_title(os.path.join(root, file))

# 2. Fix llms.txt
llms_path = os.path.join(base_dir, 'llms.txt')
with open(llms_path, 'r', encoding='utf-8') as f:
    text = f.read()
def repl_llms(m):
    url = m.group(0)
    return f'[{url}]({url})'
text = re.sub(r'(?<!\()https?://[^\s]+(?!\))', repl_llms, text)
with open(llms_path, 'w', encoding='utf-8') as f:
    f.write(text)

# 3. Fix index.html Learn More links
index_path = os.path.join(base_dir, 'index.html')
with open(index_path, 'r', encoding='utf-8') as f:
    content = f.read()
services = [
    'web-development',
    'wordpress-development',
    'ecommerce-development',
    'seo',
    'local-seo',
    'digital-marketing',
    'ui-ux-design'
]
for svc in services:
    content = re.sub(
        fr'<a href="/services/{svc}/" class="service-card-link">',
        f'<a href="/services/{svc}/" class="service-card-link" aria-label="Learn More about {svc.replace("-", " ").title()}">',
        content
    )
with open(index_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 4. Fix work/index.html broken links
work_path = os.path.join(base_dir, 'work', 'index.html')
with open(work_path, 'r', encoding='utf-8') as f:
    content = f.read()
for link in ['e5-events.com', 'blacklabelbio.com', 'parascope.co', 'bufordchiropractic.com']:
    content = content.replace(f'href="https://{link}/"', 'href="#"')
    content = content.replace(f'href="https://www.{link}/"', 'href="#"')
    content = content.replace(f'href="http://{link}/"', 'href="#"')
    content = content.replace(f'href="http://www.{link}/"', 'href="#"')
    content = content.replace(f'href="https://{link}"', 'href="#"')
with open(work_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 5. Fix blog link
blog_path = os.path.join(base_dir, 'blog', 'website-maintenance-and-security-for-small-business', 'index.html')
with open(blog_path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('href="/services/website-maintenance/"', 'href="/services/wordpress-development/"')
with open(blog_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('All fixes applied!')
