# OneGoods Studio — V4 Visual Reference Standard

Date: 2026-06-30
Owner: Ken / Xiaomo
Status: Approved visual reference for future OneGoods UI and product visuals

## Reference image

Canonical V4 design board:

- Repo copy: `docs/visual-reference/onegoods-v4-inclusive-ui-board.png`
- Public preview path: `/images/visual-reference/onegoods-v4-inclusive-ui-board.png`

This board is the future visual baseline for OneGoods Studio unless Ken explicitly changes direction.

## Core direction

OneGoods Studio is a playful series-based everyday-object shop.

- Brand: `OneGoods Studio · 玩物工坊`
- Positioning: not a pure women-only charm boutique, not a hard-core maker/industrial site.
- Current product taxonomy: **series-first**, not function-first.
- Series examples:
  - `水果系列`
  - `美食系列`
  - `自然系列`
  - `工坊系列`
- Product selection values:
  - `解压`
  - `疗愈`
  - `好玩`
  - `好看`
  - `可爱`

## Visual tokens

- Warm cream canvas
- Coral/orange CTA
- Butter yellow
- Mint green
- Soft sky blue
- Clay / warm material tone
- Controlled lavender
- Minimal pink only as accent
- Warm charcoal text

## Icon standard

Use the V4 board’s sticker-like, simple icon style:

- Prefer simple geometric / hand-stamped / sticker marks.
- Use soft square or rounded-rectangle icon containers.
- Use thick warm-charcoal outline or high-contrast glyph.
- Use category/series color as the icon background.
- Keep icons abstract enough to avoid locking one product function.
- Avoid raw emoji as final UI icons.
- Avoid overly detailed illustrations inside tiny icons.
- Avoid cold, line-only enterprise icons.

Current site icon mapping:

| Series | Icon asset | Background token |
|---|---|---|
| 水果系列 | `/images/icons/v4-series-clean/fruit-squishy.png` | `--color-butter` |
| 美食系列 | `/images/icons/v4-series-clean/food-smile.png` | `--color-peach` |
| 自然系列 | `/images/icons/v4-series-clean/nature-sparkle.png` | `--color-mint` |
| 工坊系列 | `/images/icons/v4-series-clean/studio-block.png` | `--color-sky` |

Clean icon sheet and extraction notes:

- `docs/visual-reference/onegoods-v4-series-icons-clean.md`
- `public/images/icons/v4-series-clean/`

Future real icons should preserve the same sticker-container / soft 3D language, not switch to emoji.

## Card / layout standard

- Rounded cards with soft shadow.
- Product card should feel like a small tray / shelf for objects.
- Tags use pill badges.
- Preserve warmth and air; do not make it dense like a marketplace grid.
- Missing product images should use styled placeholders in the V4 style, never broken image boxes.

## Avoid

- Coffee machine as main subject or recurring brand motif.
- Pure pink charm shop.
- Hard industrial maker site.
- Generic Shopify template look.
- Functional taxonomy as the main browse layer (`玩一玩 / 挂一挂 / 用一用 / 造一造`) unless Ken re-approves it.
- Raw emoji icons as final UI standard.

## Implementation note

When future UI changes happen:

1. Check this reference board first.
2. Keep series-first taxonomy.
3. Keep selection values as badges: `解压 / 疗愈 / 好玩 / 好看 / 可爱`.
4. Preserve V4 icon treatment: sticker shape + simple glyph + warm pastel background.
5. Validate with `npm run lint`, `npm run build`, homepage screenshot, Shop screenshot.
