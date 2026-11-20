"""Build static, independently readable Traditional Chinese, Simplified and English pages."""
from pathlib import Path
import json, re, hashlib, subprocess

root = Path(__file__).resolve().parent
src, dist = root / 'src', root / 'public'
translations = json.loads((src / 'translations.json').read_text())
pattern = re.compile('|'.join(re.escape(k) for k in sorted(translations, key=len, reverse=True)))
origin = 'https://onegoods.studio'
build_id = hashlib.sha256(b''.join(p.read_bytes() for p in sorted(src.glob('*')) if p.is_file()) + (root / 'server' / 'keyring-geometry.mjs').read_bytes()).hexdigest()[:12]
locales = [('zh-Hant', '', 0), ('zh-Hans', 'zh-cn', None), ('en', 'en', 1)]

for lang, folder, column in locales:
    target = dist / folder
    target.mkdir(exist_ok=True)
    def translate(text):
        return text if column is None else pattern.sub(lambda m: translations[m[0]][column], text)
    for page in src.glob('*.html'):
        if page.name == 'internal-checkout.html' and folder:
            continue
        text = translate(page.read_text()).replace('lang="zh-Hans"', f'lang="{lang}"')
        if folder:
            text = text.replace('href="assets/', 'href="../assets/').replace('src="assets/', 'src="../assets/')
            for asset in ('href="style.css"', 'src="nameplate.js"', 'src="locale.js"'):
                text = text.replace(asset, asset.replace('="', '="../'))
        # All locale pages have static content and metadata even without JavaScript.
        canonical = f'{origin}/{folder + "/" if folder else ""}{page.name}'
        text = re.sub(r'<link rel="canonical"[^>]*>', '', text)
        meta = f'<link rel="canonical" href="{canonical}">'
        for alt, directory, _ in locales:
            meta += f'<link rel="alternate" hreflang="{alt}" href="{origin}/{directory + "/" if directory else ""}{page.name}">'
        text = text.replace('</head>', meta + '</head>')
        if '</header>' in text:
            options = []
            for alternate, directory, _ in locales:
                prefix = '../' if folder else ''
                url = prefix + (directory + '/' if directory else '') + page.name
                label = {'zh-Hant': '繁體中文', 'zh-Hans': '简体中文', 'en': 'English'}[alternate]
                current = ' aria-current="true"' if lang == alternate else ''
                options.append(f'<a href="{url}" lang="{alternate}" hreflang="{alternate}" data-language="{alternate}"{current}>{label}</a>')
            current_label = {'zh-Hant': '繁', 'zh-Hans': '简', 'en': 'en'}[lang]
            switch_label = {'zh-Hant': '切換語言，目前：繁體中文', 'zh-Hans': '切换语言，当前：简体中文', 'en': 'Change language. Current: English'}[lang]
            nav = f'<nav class="language-switch" aria-label="Language"><details class="language-menu"><summary aria-label="{switch_label}">{current_label}<span class="language-chevron" aria-hidden="true"></span></summary><div class="language-options">' + ''.join(options) + '</div></details></nav>'
            text = text.replace('</header>', nav + '</header>')
            prefix = '../' if folder else ''
            for script_name in ('app.js', f'{prefix}nameplate.js'):
                tag = f'<script src="{script_name}"'
                text = text.replace(tag, f'<script src="{prefix}locale.js" defer></script>' + tag)
        if lang == 'en':
            text = text.replace('makerworld.com/zh/', 'makerworld.com/en/')
        for asset in ['style.css', 'app.js', 'locale.js', 'nameplate.js']:
            text = re.sub(r'((?:src|href)="[^"?]*' + re.escape(asset) + r')(")', lambda m: m[1] + "?v=" + build_id + m[2], text)
        (target / page.name).write_text(text)
    script = translate((src / 'app.js').read_text())
    if lang == 'en':
        script = script.replace('makerworld.com/zh/', 'makerworld.com/en/')
    (target / 'app.js').write_text(script)
(dist / 'style.css').write_text((src / 'style.css').read_text())
for script_name in ('checkout-preview.js', 'checkout-preview-shipping.js'):
    (dist / script_name).write_text((src / script_name).read_text())
(dist / 'locale.js').write_text((src / 'locale.js').read_text())
subprocess.run([
    str(root / 'node_modules' / '.bin' / 'esbuild'), 'src/nameplate.js',
    '--bundle', '--platform=browser', '--format=iife', '--minify', '--legal-comments=eof',
    '--outfile=public/nameplate.js',
], cwd=root, check=True)
print(f'Built 3 locales × {len(list(src.glob("*.html")))} routes, localized product data and metadata.')

# Shared admin assets are private-data free; record access is enforced by the server.
import shutil
for name in ["admin.css", "admin.js"]:
    shutil.copy2(root / "admin" / name, dist / name)

subprocess.run([
    str(root / 'node_modules' / '.bin' / 'esbuild'), 'src/admin-shipping-pdf.js',
    '--bundle', '--platform=browser', '--format=esm', '--minify', '--legal-comments=eof',
    '--outfile=public/admin-shipping-pdf.js',
], cwd=root, check=True)

# Sharing metadata is embedded in the initial HTML for link previews.
from html import escape
from opencc import OpenCC
traditional = OpenCC('s2twp')
for lang, folder, _ in locales:
    directory = dist / folder
    for page in directory.glob('*.html'):
        text = page.read_text()
        if lang == 'zh-Hant':
            text = traditional.convert(text)
        # Strip sharing metadata from earlier builds so pages not regenerated from src/ stay idempotent.
        text = re.sub(r'<meta property="og:[^"]*" content="[^"]*">|<meta name="twitter:card" content="[^"]*">', '', text)
        title = re.search(r'<title>(.*?)</title>', text).group(1)
        description = re.search(r'<meta name="description" content="([^"]*)"', text)
        description = description.group(1) if description else title
        canonical = f'{origin}/{folder + "/" if folder else ""}{page.name}'
        metadata = (f'<meta property="og:type" content="website"><meta property="og:title" content="{escape(title, quote=True)}">'
                    f'<meta property="og:description" content="{escape(description, quote=True)}"><meta property="og:url" content="{canonical}">'
                    f'<meta property="og:image" content="{origin}/assets/ogs-sharing.jpg"><meta property="og:image:width" content="1200">'
                    f'<meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image">')
        page.write_text(text.replace('</head>', metadata + '</head>'))
public_pages = ['index.html', 'products.html', 'custom.html', 'about.html', 'nameplate.html', 'purchase-policy.html', 'privacy.html']
urls = [f'{origin}/{folder + "/" if folder else ""}{page}' for _, folder, _ in locales for page in public_pages]
(dist / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    + ''.join('<url><loc>' + url + '</loc></url>' for url in urls) + '</urlset>')
(dist / 'robots.txt').write_text('User-agent: *\nDisallow: /admin\nDisallow: /api/\nDisallow: /internal-checkout\nSitemap: ' + origin + '/sitemap.xml\n')
