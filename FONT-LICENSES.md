# Website heading font

Traditional Chinese h1/h2 use OGS Heading Rounded, a web subset of **Chiron GoRound TC VF / 昭源環方**, release branch v1.011. Original source: https://github.com/chiron-fonts/chiron-go-round-tc (VAR_TTF/ChironGoRoundTCVF.ttf).

Licensed under SIL Open Font License 1.1; copyright and license are distributed at dist/assets/fonts/OFL-Chiron-GoRound-TC.txt. The subset retains outline geometry, variable weights and font copyright metadata; its family name is changed to OGS Heading Rounded. Source processing uses fontTools subset with all current source/translation characters plus ASCII. Additional copy may require regenerating the subset; missing characters use the system fallback. No font is installed on the visitor's device.

Only Traditional Chinese large/medium headings change. Logo artwork, body text, Simplified Chinese and English typography retain the established styling.

2026-11-02 CMS extension: all 146 official Chiron GoRound TC WS v1.011 unicode-range WOFF2 subsets are self-hosted at public/assets/fonts/chiron-web/ with upstream CSS and OFL notice. The compact OGS subset remains the first face for existing headings, and the full WS coverage supplies newly entered Traditional Chinese titles without relying on the visitor's system font. Browsers request only ranges needed by rendered titles.

## Custom nameplate and clicker fonts

The customer picker uses the full static WOFF files for glyph checks, 3D previews
and print exports. The separate WOFF2 subsets contain only the localized picker
labels. Older font files remain available for saved drafts and order exports.

| Picker label | Upstream font | Source and license |
| --- | --- | --- |
| 昭源環方 | Chiron GoRound TC 700, v1.011 | [Chiron Fonts](https://github.com/chiron-fonts/chiron-go-round-tc/tree/v1.011) · [OFL 1.1](public/assets/fonts/chiron-web/OFL.txt) |
| 源泉圓體 | GenSen Rounded 2 TW Bold, v2.100 | [ButTaiwan](https://github.com/ButTaiwan/gensen-font/releases/tag/v2.100) · [OFL 1.1](public/assets/fonts/keyring/GenSenRounded-OFL.txt) |
| 臺灣正楷 | 全字庫正楷體 TW-Kai-98_1 v11508.01 | [數位發展部 CNS11643 全字庫](https://www.cns11643.gov.tw/opendata/Fonts_Kai.zip) · [OFL 1.1](public/assets/fonts/keyring/TW-Kai-OFL.txt) |
| 源雲明體 | GenWan Mincho 2 TW SemiBold, v2.100 | [ButTaiwan](https://github.com/ButTaiwan/genwan-font/releases/tag/v2.100) · [OFL 1.1](public/assets/fonts/keyring/GenWanMin-OFL.txt) |
