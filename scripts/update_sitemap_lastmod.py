import subprocess
import re
from pathlib import Path

# Get modified html files from git diff
res = subprocess.run(["git", "diff", "--name-only"], capture_output=True, text=True, check=True)
modified_files = set(res.stdout.strip().splitlines())

# Also check git status for unstaged/staged modified files
res_status = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True, check=True)
for line in res_status.stdout.splitlines():
    parts = line.strip().split()
    if len(parts) >= 2:
        modified_files.add(parts[-1])

print(f"Total modified files detected by git: {len(modified_files)}")

# Build set of modified canonical URLs
modified_urls = set()
for f in modified_files:
    if f.endswith("index.html"):
        p = Path(f)
        if p.name == "index.html" and p.parent == Path("."):
            modified_urls.add("https://www.zavronsolutions.com/")
        else:
            # e.g. about-us/index.html -> https://www.zavronsolutions.com/about-us/
            url_path = p.parent.as_posix()
            modified_urls.add(f"https://www.zavronsolutions.com/{url_path}/")

print(f"Total modified canonical URLs: {len(modified_urls)}")
print("Sample modified URLs:", list(modified_urls)[:5])

sitemap_files = [Path("sitemap.xml"), Path("public/sitemap.xml")]

for sm_path in sitemap_files:
    if not sm_path.exists():
        continue
    content = sm_path.read_text(encoding="utf-8")
    
    # Process each <url> block
    def replace_lastmod(match):
        block = match.group(0)
        loc_match = re.search(r"<loc>(.*?)</loc>", block)
        if loc_match:
            loc = loc_match.group(1).strip()
            if loc in modified_urls:
                # Replace or insert lastmod
                if "<lastmod>" in block:
                    block = re.sub(r"<lastmod>.*?</lastmod>", "<lastmod>2026-10-10</lastmod>", block)
                else:
                    block = block.replace("</loc>", "</loc>\n    <lastmod>2026-10-10</lastmod>")
        return block

    updated_content = re.sub(r"<url>.*?</url>", replace_lastmod, content, flags=re.DOTALL)
    sm_path.write_text(updated_content, encoding="utf-8")
    
    # Count how many lastmods were updated to 2026-10-10
    updated_count = len(re.findall(r"<lastmod>2026-10-10</lastmod>", updated_content))
    print(f"Updated {sm_path}: {updated_count} URLs set to 2026-10-10.")
