# OneGoods Studio — V4 Clean Icon Assets

Date: 2026-06-30
Owner: Ken / Xiaomo
Status: usable local asset set for website UI

## Why this exists

Ken pointed out that the V4 design board already contains a rich icon set on the left side and asked whether those can be used as website icons.

Conclusion:

- The original design-board icons are the right visual direction.
- Direct screenshot cropping from the board is not ideal for production because labels/edges/shadows can be cut from a flattened board image.
- Therefore we keep the original board as the visual reference, and generated a clean no-label 4×4 icon sheet in the same V4 style for site use.

## Source references

Original V4 board:

- `docs/visual-reference/onegoods-v4-inclusive-ui-board.png`
- `public/images/visual-reference/onegoods-v4-inclusive-ui-board.png`

Clean site icon sheet:

- `docs/visual-reference/onegoods-v4-clean-icon-sheet-no-border.png`
- `public/images/icons/v4-clean/_icon-sheet-no-border.png`

Previous bordered sheet is kept for reference, but the active site icons use the no-border version.

## Extracted / cropped site icons

All icons are PNG files under:

`public/images/icons/v4-clean/`

Available icons:

- `/images/icons/v4-clean/fidget-puck.png`
- `/images/icons/v4-clean/squishy-blob.png`
- `/images/icons/v4-clean/charm-ring.png`
- `/images/icons/v4-clean/keychain-loop.png`
- `/images/icons/v4-clean/mini-tool-clip.png`
- `/images/icons/v4-clean/holder.png`
- `/images/icons/v4-clean/package.png`
- `/images/icons/v4-clean/tag.png`
- `/images/icons/v4-clean/3d-print-layers.png`
- `/images/icons/v4-clean/printer-nozzle.png`
- `/images/icons/v4-clean/magnet-dot.png`
- `/images/icons/v4-clean/modular-block.png`
- `/images/icons/v4-clean/remix-arrows.png`
- `/images/icons/v4-clean/trending-flame.png`
- `/images/icons/v4-clean/sparkle.png`
- `/images/icons/v4-clean/smile.png`

## Current site mapping

| Site series | Current icon |
|---|---|
| 水果系列 | `squishy-blob.png` |
| 美食系列 | `smile.png` |
| 自然系列 | `sparkle.png` |
| 工坊系列 | `modular-block.png` |

This is a first mapping. Future product-specific cards can use more precise icons, e.g. `fidget-puck`, `charm-ring`, `keychain-loop`, `3d-print-layers`, `magnet-dot`, etc.

## Usage guideline

Use these as medium/large decorative UI icons:

- category/series cards
- product placeholder cards
- feature sections
- empty states
- badges / sticker callouts

Avoid using them as tiny 16–24px micro icons; the 3D details are designed for 48px+ usage.
