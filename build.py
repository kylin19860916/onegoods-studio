"""Build static, independently readable Traditional Chinese, Simplified and English pages."""
from pathlib import Path
import json, re, hashlib

root = Path(__file__).resolve().parent
src, dist = root / 'src', root / 'dist'
translations = json.loads((src / 'translations.json').read_text())
pattern = re.compile('|'.join(re.escape(k) for k in sorted(translations, key=len, reverse=True)))
origin = 'https://one-goods-studio.kylin1986.chatgpt.site'
build_id = hashlib.sha256(b''.join(p.read_bytes() for p in sorted(src.glob('*')) if p.is_file())).hexdigest()[:12]
locales = [('zh-Hant', '', 0), ('zh-Hans', 'zh-cn', None), ('en', 'en', 1)]

for lang, folder, column in locales:
    target = dist / folder
    target.mkdir(exist_ok=True)
    def translate(text):
        return text if column is None else pattern.sub(lambda m: translations[m[0]][column], text)
    for page in src.glob('*.html'):
        text = translate(page.read_text()).replace('lang="zh-Hans"', f'lang="{lang}"')
        if folder:
            text = text.replace('href="assets/', 'href="../assets/').replace('src="assets/', 'src="../assets/')
            text = text.replace('href="style.css"', 'href="../style.css"')
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
                label = {'zh-Hant': '繁體', 'zh-Hans': '简体', 'en': 'EN'}[alternate]
                current = ' aria-current="true"' if lang == alternate else ''
                options.append(f'<a href="{url}" lang="{alternate}" hreflang="{alternate}" data-language="{alternate}"{current}>{label}</a>')
            nav = '<nav class="language-switch" aria-label="Language">' + ''.join(options) + '</nav>'
            text = text.replace('</header>', nav + '</header>')
            prefix = '../' if folder else ''
            text = text.replace('<script src="app.js"', f'<script src="{prefix}locale.js" defer></script><script src="app.js"')
        if lang == 'en':
            text = text.replace('makerworld.com/zh/', 'makerworld.com/en/')
        for asset in ['style.css', 'app.js', 'locale.js']:
            text = re.sub(r'((?:src|href)="[^"?]*' + re.escape(asset) + r')(")', lambda m: m[1] + "?v=" + build_id + m[2], text)
        (target / page.name).write_text(text)
    script = translate((src / 'app.js').read_text())
    if lang == 'en':
        script = script.replace('makerworld.com/zh/', 'makerworld.com/en/')
    (target / 'app.js').write_text(script)
(dist / 'style.css').write_text((src / 'style.css').read_text())
(dist / 'locale.js').write_text((src / 'locale.js').read_text())
print('Built 3 locales × 6 routes, localized product data and metadata.')
