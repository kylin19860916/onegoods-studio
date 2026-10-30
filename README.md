# One Goods Studio website

Existing Sites project: `appgprj_6ae2086cabe08191b93babd61954edd2`.
Production: https://one-goods-studio.kylin1986.chatgpt.site

Edit `src/*.html`, `src/app.js`, `src/style.css`, `src/locale.js` and
`src/translations.json`; run `python3 build.py` to regenerate `dist/`.
Assets remain in `dist/assets/`. Do not hand-edit generated localized files.

Traditional Chinese (Taiwan vocabulary) is the default. Simplified Chinese is
under `/zh-cn/`; English is under `/en/`. The language selector preserves product
query parameters and remembers explicit language choices. Browser language does
not override the Traditional Chinese default for first-time visitors.
CSS and scripts use content-derived version query parameters to refresh caches.

The user selected Neo-Brutalism in the original website conversation. The latest
simplification keeps the existing identity and warm palette, reduces decorative
banners, stickers, borders and shadows, and preserves original logo geometry.
Physical product image slots contain no placeholder labels. Product categories
remain unverified listings; prices and sales links require actual product data.
The external physical-sales channel is 7-ELEVEN 賣貨便 and has not been connected.
The MakerWorld profile is an external link, not an account integration.

The 2026-10-30 multilingual and simplification changes were reconciled with the
production v8/v9 physical-label and image-slot fixes before publication. The
historical DNS and preview restrictions no longer occurred in this environment.
Validation covered 18 static routes, local links, script syntax, language
switching, product-parameter preservation, digital detail dialogs and mobile
layout. Current deployment evidence is stored outside this repository in
`../project/`, including the project manifest and task ledger.
