import json
import re
import urllib.request
from pathlib import Path

WORKSPACE = Path(r"c:\Users\Tech Planet\Desktop\Zavron Solutions\zavronsolutions")
sitemap_path = WORKSPACE / "sitemap.xml"
sitemap_content = sitemap_path.read_text(encoding="utf-8")

urls = list(set(re.findall(r'<loc>(https://www\.zavronsolutions\.com/[^<]*)</loc>', sitemap_content)))
urls.sort()

print(f"Found {len(urls)} canonical URLs in sitemap for IndexNow.")

payload = {
    "host": "www.zavronsolutions.com",
    "key": "9f28a2c2d79d42988ea95f313ac7acec",
    "keyLocation": "https://www.zavronsolutions.com/9f28a2c2d79d42988ea95f313ac7acec.txt",
    "urlList": urls
}

data = json.dumps(payload).encode("utf-8")

req = urllib.request.Request(
    "https://api.indexnow.org/indexnow",
    data=data,
    headers={
        "Content-Type": "application/json; charset=utf-8",
        "User-Agent": "ZavronSolutions-IndexNow/1.0"
    },
    method="POST"
)

try:
    print("Submitting to IndexNow API (https://api.indexnow.org/indexnow)...")
    with urllib.request.urlopen(req, timeout=15) as response:
        status = response.getcode()
        print(f"IndexNow Response Status: {status} {response.msg}")
        if status in [200, 202]:
            print("✅ IndexNow submission successful! All canonical URLs queued for search engine indexing.")
        else:
            print(f"Response: {response.read().decode('utf-8', errors='ignore')}")
except urllib.error.HTTPError as e:
    print(f"IndexNow HTTP Response: {e.code} {e.reason}")
    print(f"Body: {e.read().decode('utf-8', errors='ignore')}")
    print("Note: If the key was just added or is waiting for deployment to the live web server, IndexNow will validate once live.")
except Exception as e:
    print(f"IndexNow Submission Error: {e}")
