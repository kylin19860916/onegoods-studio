from pathlib import Path
from PIL import Image
from hashlib import sha256
import json

root = Path(__file__).resolve().parents[1]
public = root / "public"
output = public / "assets/optimized"
output.mkdir(exist_ok=True)
mapping = (
    json.loads((public / "image-variants.json").read_text())
    if (public / "image-variants.json").exists()
    else {}
)
sources = [
    (str(p.relative_to(public)), p)
    for p in (public / "assets").rglob("*")
    if p.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp"]
    and "optimized" not in p.parts
    and p.stat().st_size > 75000
]
originals = Path("/tmp/ogs-r1-originals")
if originals.exists():
    sources += [("/media/" + p.name, p) for p in originals.iterdir() if p.is_file()]
for source, p in sources:
    image = Image.open(p)
    variants = []
    for width in [480, 960, 1440]:
        if width > image.width and variants:
            continue
        rendered = image.copy()
        rendered.thumbnail((width, 10000))
        from io import BytesIO

        buffer = BytesIO()
        rendered.save(buffer, format="WEBP", quality=82, method=5)
        payload = buffer.getvalue()
        name = sha256(payload).hexdigest()[:16] + ".webp"
        (output / name).write_bytes(payload)
        variants.append({"url": "assets/optimized/" + name, "width": rendered.width})
    mapping[source] = {"url": variants[-1]["url"], "variants": variants}
(public / "image-variants.json").write_text(json.dumps(mapping, separators=(",", ":")))
data = "window.OGS_IMAGE_VARIANTS=" + json.dumps(mapping, separators=(",", ":")) + ";"
name = "image-variants-" + sha256(data.encode()).hexdigest()[:12] + ".js"
(public / name).write_text(data)
(root / "preview/image-map-script.txt").write_text(name)
print("Prepared", len(mapping), "image sets.")
