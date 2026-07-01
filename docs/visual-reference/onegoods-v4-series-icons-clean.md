# OneGoods Studio — V4 Series Icons Clean Set

Date: 2026-06-30
Owner: Ken / Xiaomo
Status: active website icon set

## Why this set replaced the cropped icons

Ken pointed out that the previous icon extraction was not clean enough. The reason: cropping from the full V4 board is fragile — edges, shadows, labels, or board artifacts can get included.

Decision: do **not** use cropped icons from the full board as production assets. Keep the board as a visual reference only, and use individually generated clean series icons for the website.

## Active icon files

Located under:

`public/images/icons/v4-series-clean/`

Current active mapping:

| Series | Icon file |
|---|---|
| 水果系列 | `/images/icons/v4-series-clean/fruit-squishy.png` |
| 美食系列 | `/images/icons/v4-series-clean/food-smile.png` |
| 自然系列 | `/images/icons/v4-series-clean/nature-sparkle.png` |
| 工坊系列 | `/images/icons/v4-series-clean/studio-block.png` |

Contact sheet:

- `public/images/icons/v4-series-clean/_series-icons-contact-sheet.png`

## Style rules

- No crop artifacts.
- No text / labels / watermark.
- No outer sticker border.
- No UI frame around the object itself.
- Keep warm cream background, soft shadow, 3D clay/plastic feel.
- Use as medium/large category icons, product placeholders, or section illustration icons.

## Avoid

- Do not use the rough crops from `public/images/icons/v4-board/` as active website icons.
- Do not use raw emoji as final icons.
- Do not use tiny 16–24px sizes for these; they are visual assets, not micro UI symbols.
