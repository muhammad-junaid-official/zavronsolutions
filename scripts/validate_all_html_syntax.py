import re
from pathlib import Path

WORKSPACE = Path(".").resolve()
html_files = list(WORKSPACE.rglob("*.html"))

errors_found = []

# Pattern to find attributes where quotes might break attribute parsing
# e.g., alt="something "broken" here"
# A standard tag: <tag attr="value" attr2="value">
for f in html_files:
    if any(p in f.parts for p in [".git", "node_modules", "dist"]):
        continue
    content = f.read_text(encoding="utf-8", errors="ignore")
    # Find all <img> tags
    imgs = re.findall(r'<img[^>]*>', content)
    for img in imgs:
        # Check if alt attribute has unescaped quotes inside
        # e.g. alt="[^"]*"[^"]*"
        alt_match = re.search(r'alt="([^"]*)"', img)
        # If there are characters after the closing quote before the next attribute or / >
        # that look like unquoted words followed by quote
        # Let's test with html parser
        pass

# Even better: Use python html.parser to test if each file parses without error
from html.parser import HTMLParser

class StrictHTMLValidator(HTMLParser):
    def error(self, message):
        raise ValueError(message)

parse_errors = []
for f in html_files:
    if any(p in f.parts for p in [".git", "node_modules", "dist"]):
        continue
    content = f.read_text(encoding="utf-8", errors="ignore")
    validator = StrictHTMLValidator()
    try:
        validator.feed(content)
    except Exception as e:
        parse_errors.append((f.relative_to(WORKSPACE).as_posix(), str(e)))

print(f"Total HTML files checked: {len(html_files)}")
print(f"HTML Parser errors found: {len(parse_errors)}")
for p, err in parse_errors:
    print(f"  {p}: {err}")
