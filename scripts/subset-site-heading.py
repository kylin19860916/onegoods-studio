from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools import subset
from hashlib import sha256
from io import BytesIO
import re, json, html

root = Path(__file__).resolve().parents[1]
text = "".join(
    html.unescape(re.sub("<[^>]*>", "", heading))
    for p in (root / "public").rglob("*.html")
    for heading in re.findall(r"<h[123][^>]*>(.*?)</h[123]>", p.read_text(), re.S)
)
data = json.loads((root / "preview/catalog.json").read_text())
for item in data["items"]:
    text += item.get("name", "")
    for variant in item.get("translations", {}).values():
        text += variant.get("name", "")
text += "商品介紹規格與隨附內容關於這件小物沒有找到這件商品。商品介绍规格与随附内容关于这件小物Product detailsSpecificationsIncluded items"
font = TTFont(root / "public/assets/fonts/keyring/NotoSansTC-Bold.woff")
worker = subset.Subsetter()
worker.populate(text=text)
worker.subset(font)
font.flavor = "woff2"
buffer = BytesIO()
font.save(buffer)
payload = buffer.getvalue()
name = "site-heading-" + sha256(payload).hexdigest()[:12] + ".woff2"
(root / "public/assets/fonts/subsets" / name).write_bytes(payload)
p = root / "src/style.css"
s = p.read_text()
s = re.sub(
    r"/assets/fonts/subsets/site-heading-[a-z0-9]+.woff2",
    "/assets/fonts/subsets/" + name,
    s,
)
p.write_text(s)
print(len(set(text)), "heading characters;", len(payload), "bytes")
