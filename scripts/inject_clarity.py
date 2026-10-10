import re
from pathlib import Path

CLARITY_SNIPPET = """  <script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "ymn2w0fs9j");
  </script>
"""

workspace = Path(".")
html_files = [f for f in workspace.rglob("*.html") if not any(p in f.parts for p in ["node_modules", ".git", "dist", ".gemini", "tmp"])]

count = 0
for f in html_files:
    # Skip google site verification file
    if "google1a53f697314249ec" in f.name:
        continue
    content = f.read_text(encoding="utf-8")
    if "ymn2w0fs9j" in content:
        continue
    
    if re.search(r"<head[^>]*>", content, re.IGNORECASE):
        new_content = re.sub(r"(<head[^>]*>)", r"\1\n" + CLARITY_SNIPPET, content, count=1, flags=re.IGNORECASE)
        f.write_text(new_content, encoding="utf-8")
        count += 1
    else:
        print(f"Skipping (no head): {f}")

print(f"Clarity tracking code successfully inserted into {count} HTML files.")
