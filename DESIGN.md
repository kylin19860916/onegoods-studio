# Design

## Identity

OneGoods Studio should feel like a polished small-batch consumer goods brand for tactile 3D printed stress-relief objects. The site should lead with the physical product and its feeling before explaining the making process.

Design words: tactile, cheerful, neatly crafted.

## Color

The current visual system uses a warm light canvas with one primary coral CTA accent and a small supporting palette for product moods.

- Background: `--color-bg`
- Surface: `--color-bg-elevated`
- Text: `--color-fg`
- Muted text: `--color-fg-muted`
- Primary CTA: `--color-accent`
- Soft CTA background: `--color-accent-soft`
- Mood accents: butter, mint, sky, peach, lavender

Use the coral accent consistently for primary actions and key highlights. Supporting colors should indicate mood categories, not random decoration.

## Typography

The site uses `Space Grotesk` for display, `Inter` plus system Chinese fallbacks for body, and `JetBrains Mono` only where a technical label is genuinely useful.

Headlines should be short, balanced, and consumer-facing. Avoid internal process language in hero or product card titles.

## Layout

Use generous product photography, soft surfaces, and clear purchase modules. Cards are acceptable for product tiles and channel choices, but avoid nested cards and long rows of dividers.

Primary landing flow:

1. Hero with product image and purchase-oriented CTA.
2. First-batch product shelf.
3. Mood / action browsing.
4. Why small-batch 3D printed goods.
5. Where to buy.

## Components

- `.primary-cta`: coral primary action, one-line label.
- `.secondary-cta`: white outlined secondary action.
- `.soft-panel`: neutral grouped section surface.
- `.studio-card`: elevated product card.
- `.pill-badge`: product tag and status badge.
- `.product-photo`: product image treatment.

## Imagery

Use real or generated product photography whenever possible. Do not ship colored placeholders as the main hero. Product images should show the physical object, texture, scale, and tabletop context.

Current hero/product image:

`/public/images/products/onegoods-stress-relief-goods.png`

## Copy

Voice should be warm, clear, and purchase-aware.

Prefer:

- "解压一点，日子可爱一点。"
- "首批小物"
- "开放购买前通知"
- "小批量 3D 打印"

Avoid:

- Founder-first copy.
- Internal maker jargon.
- Overly poetic labels.
- Version labels and build metadata.
- Claims that sound like finished mass production while products are still being tested.

## Accessibility

Target WCAG AA contrast. Buttons must keep one-line labels on desktop and remain at least 44px high on mobile. Form fields need visible labels, not placeholder-only labels. Motion should be light and nonessential.
