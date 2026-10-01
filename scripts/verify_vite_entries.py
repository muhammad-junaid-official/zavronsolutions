import re
from pathlib import Path

WORKSPACE = Path(r"c:\Users\Tech Planet\Desktop\Zavronsolutions\zavronsolutions")
vite_config = WORKSPACE / "vite.config.js"

content = vite_config.read_text(encoding="utf-8")
input_block = re.search(r'input:\s*\{([\s\S]*?)\}', content)
if not input_block:
    print("Could not find input block in vite.config.js")
    exit(1)

lines = input_block.group(1).strip().splitlines()
missing = 0
total = 0

for line in lines:
    line = line.strip()
    if not line or line.startswith("//"):
        continue
    match = re.search(r'"([^"]+)"\s*:\s*"([^"]+)"', line)
    if match:
        key, rel_path = match.group(1), match.group(2)
        total += 1
        full_path = WORKSPACE / rel_path
        if not full_path.exists():
            print(f"MISSING ENTRY: key='{key}', path='{rel_path}'")
            missing += 1
        else:
            # print(f"OK: {key} -> {rel_path}")
            pass

print(f"\nTotal entries in vite.config.js: {total}")
print(f"Missing entries: {missing}")
if missing == 0:
    print("All entries in vite.config.js exist on disk!")
