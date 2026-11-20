"""Generate immutable Unicode-block subsets; original fonts remain manufacturing sources."""

from pathlib import Path
from io import BytesIO
from hashlib import sha256
from fontTools import subset
from fontTools.ttLib import TTFont
import json, re, sys

root = Path(__file__).resolve().parents[1]
fonts = root / "public/assets/fonts/keyring"

mapping = {
    a or b: c
    for a, b, c in re.findall(
        r"(?:'([^']+)'|([a-z]+)):\s*'([^']+\.woff)'",
        (root / "src/keyring-font-picker.js").read_text(),
    )
}
output = root / "public/assets/fonts/subsets"
output.mkdir(exist_ok=True)
manifest = {}
css = []


def split_font(item):
    key, filename = item
    source_hash = sha256((fonts / filename).read_bytes()).hexdigest()
    prior = (
        json.loads((output / "sources.json").read_text())
        if (output / "sources.json").exists()
        else {}
    )
    if "--resume" in sys.argv and prior.get(key) != source_hash:
        raise ValueError("Font source changed. Rebuild without --resume.")
    local_css = []
    font = TTFont(fonts / filename)
    cmap = font.getBestCmap()
    blocks = {}
    for code in cmap:
        blocks.setdefault(code // 256, []).append(code)
    entries = {}
    for block, codes in blocks.items():
        cached = list(output.glob(key + "-" + str(block) + "-*.woff"))
        if "--resume" in sys.argv and cached:
            name = cached[0].name
        else:
            small = TTFont(fonts / filename)
            options = subset.Options()
            options.layout_features = ["kern", "liga"]
            options.notdef_outline = True
            worker = subset.Subsetter(options=options)
            worker.populate(unicodes=codes)
            worker.subset(small)
            small.flavor = "woff"
            buffer = BytesIO()
            small.save(buffer)
            payload = buffer.getvalue()
            name = (
                key
                + "-"
                + str(block)
                + "-"
                + sha256(payload).hexdigest()[:12]
                + ".woff"
            )
            (output / name).write_bytes(payload)
        entries[str(block)] = name
        ranges = ",".join("U+" + format(c, "X") for c in codes)
        local_css.append(
            '@font-face{font-family:"OGS Full '
            + key
            + '";src:url("/assets/fonts/subsets/'
            + name
            + '") format("woff");font-display:swap;unicode-range:'
            + ranges
            + "}"
        )
    return key, entries, local_css
    print(key, len(entries), flush=True)


from concurrent.futures import ProcessPoolExecutor
import multiprocessing

with ProcessPoolExecutor(
    max_workers=4, mp_context=multiprocessing.get_context("fork")
) as pool:
    for key, entries, local_css in pool.map(split_font, mapping.items()):
        manifest[key] = entries
        css.extend(local_css)
(root / "src/font-subsets.json").write_text(json.dumps(manifest, separators=(",", ":")))
font_css = "\n".join(css)
font_css_name = "full-fonts-" + sha256(font_css.encode()).hexdigest()[:12] + ".css"
(output / font_css_name).write_text(font_css)
(root / "preview/font-style-entry.txt").write_text(font_css_name)
# Use source text for the heading glyph inventory, including all locale copy.
text = "".join(
    p.read_text()
    for p in (root / "src").glob("*")
    if p.suffix in [".html", ".js", ".json"]
)
font = TTFont(fonts / "NotoSansTC-Bold.woff")
worker = subset.Subsetter()
worker.populate(text=text)
worker.subset(font)
font.flavor = "woff2"
buffer = BytesIO()
font.save(buffer)
payload = buffer.getvalue()
name = "site-heading-" + sha256(payload).hexdigest()[:12] + ".woff2"
(output / name).write_bytes(payload)
style = root / "src/style.css"
s = style.read_text()
s = re.sub(
    r'@font-face\{font-family:"OGS Site Heading";.*?\}',
    '@font-face{font-family:"OGS Site Heading";src:url("/assets/fonts/subsets/'
    + name
    + '") format("woff2");font-weight:700;font-display:swap}',
    s,
)
s = re.sub(r'@font-face\{font-family:"OGS Full [^"]+";.*?\}', "", s)
s = s.replace("@import url('/assets/fonts/chiron-web/css/vf.css');", "")
style.write_text(s)

(output / "sources.json").write_text(
    json.dumps(
        {
            key: sha256((fonts / name).read_bytes()).hexdigest()
            for key, name in mapping.items()
        },
        indent=2,
    )
    + "\n"
)
