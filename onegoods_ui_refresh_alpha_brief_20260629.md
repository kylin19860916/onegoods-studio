# OneGoods Studio — UI Refresh + Multi-product Expansion Brief

Date: 2026-06-29
Owner: Ken / Xiaomo
Executor: Alpha
Workdir: `/Users/withme/Projects/onegoods-studio`
Production: `https://onegoods.studio/` / Vercel project backed by OneGoods Studio repo

## 0. Ken's latest direction

Ken reviewed the current OneGoods Studio website and said:

- Site structure is OK. Do not rebuild IA from scratch.
- Current UI is too dark; upgrade the UI to feel brighter / lighter / more approachable.
- The site will carry multiple products, mainly:
  - 解压类商品 / stress-relief, fidget, desk-play products
  - 挂件类商品 / charms, keychain-like accessories, small attachable items

This is a UI and product-surface upgrade, not a full business pivot.

## 1. Design direction

### Keep
- OneGoods Studio / 玩物工坊 brand: maker, modular, playful but curated.
- MagBlock / 3D printing / magnetic structures / desktop organization / maker workbench as visual anchor.
- Product-led ecommerce + content structure.
- Existing MDX product architecture; new products should still be content-driven from `content/products/*.mdx`.

### Change
- Current look is too dark. Move from nearly black industrial UI to a lighter “warm studio / product gallery” UI.
- Keep premium/material feel, but reduce heavy black background usage.
- Recommended palette direction:
  - background: warm off-white / soft beige / light clay
  - cards: white / warm ivory / very light stone
  - text: charcoal, not pure black
  - accent: keep warm amber/orange as brand highlight
  - dark sections only as controlled contrast blocks, not the whole site
- More whitespace, larger product cards, clearer shop browsing.
- Make site feel suitable for small physical products, not only one dark hero concept.

### Avoid
- Do not make it generic Shopify template.
- Do not overuse coffee machine / café visuals.
- Do not turn into cyber/RGB/game UI.
- Do not remove maker/3D-print/MagBlock DNA.
- Do not hardcode SKU in React; keep products via MDX.

## 2. Product taxonomy update

Add/prepare navigation and product presentation for multiple product families:

1. **MagBlock / modular desk system**
   - modular blocks, magnetic accessories, desk organization.
2. **Stress-relief / fidget products（解压）**
   - tactile, desk toys, squeeze/fidget/spinner/click/press style products.
   - Tone: decompression, playful, desk ritual, hand-feel.
3. **Charms / hangers / accessories（挂件）**
   - bag charms, keychain-like accessories, magnetic charms, decorative hangers.
   - Tone: small, collectible, attachable, giftable.

Implementation suggestion:
- Add category metadata in product MDX if not already present.
- Shop page should support multiple products and category filtering or at least category sections.
- Homepage should introduce OneGoods as a multi-product studio, not only MagBlock.

## 3. Homepage requirements

Keep structure but refresh UI:

- Hero: brighter, product-studio feeling.
- Above-the-fold should say OneGoods Studio is a studio for “playable, useful, modular little objects”.
- Add clear entry points:
  - Shop all
  - Stress-relief objects
  - Charms / hangers
  - MagBlock system
- Add a “new drops / product families” section with 3 category cards.
- Add a “why OneGoods” section:
  - playful utility
  - 3D printed / maker-built
  - small batch / iterative
  - desk, bag, everyday carry use-cases

## 4. Shop / product listing requirements

- Product grid should be brighter and easier to scan.
- Cards should show:
  - product image
  - family/category
  - short value prop
  - price/status if available
- Prepare for many SKUs, not just 1-2 placeholders.
- If product category filter is lightweight, implement it. If risky, at least group by category sections.

## 5. Content / placeholder handling

If real product images/content are not ready:
- Use neutral product placeholder cards that clearly say “coming soon” or “prototype drop”, but do not make the whole site look empty.
- Do not invent final product claims.
- It is OK to create 2-3 placeholder MDX products for the new categories if labeled as draft/prototype and hidden from checkout, but avoid fake purchasable SKUs.

## 6. Engineering constraints

- Project uses Next.js App Router, TypeScript, Tailwind v4, MDX products.
- Read `AGENTS.md` first.
- Preserve existing Stripe/Resend logic.
- Do not commit `.env.local` or secrets.
- Do not change payment country/currency rules unless explicitly required.
- Do not remove existing products; adapt them into the new category/product-family model.
- If changing design tokens, do it intentionally and document the palette shift. Existing AGENTS.md says not to modify globals.css design tokens without discussion; Ken has now explicitly requested lighter UI, so palette update is allowed, but keep brand DNA.

## 7. Validation required

Alpha should return 4-part report with:

## Results
- What changed in user-facing UI and product model.

## Changes
- Files changed, especially `src/app/page.tsx`, `src/app/globals.css`, shop pages/components, product MDX.

## Validation
- `npm run lint` or equivalent if available.
- `npm run build`.
- Local screenshot or production screenshot after deploy.
- Production smoke:
  - `https://onegoods.studio/` loads 200
  - shop page loads 200
  - no obvious console/runtime error

## Blockers
- If real product images/content are needed from Ken, list exactly what is needed.

## 8. Definition of done

- Site no longer feels “too dark”.
- Structure remains intact.
- Homepage and shop clearly support multiple product lines.
- Product families include stress-relief / fidget and charms / hangers.
- Deployed to production only after build passes.
