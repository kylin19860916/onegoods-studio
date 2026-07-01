# OneGoods Studio — UI Layout Rules v0.1

Date: 2026-06-29
Owner: Ken / Xiaomo
Scope: `https://onegoods.studio/` visual layout system

## 1. Direction

Ken clarified: the priority is not only image generation. The website needs a coherent **overall layout visual system**: page regions, rhythm, cards, whitespace, hierarchy, and CSS rules. GPT Image can support product/scene assets later, but the page layout itself should be defined as UI rules first, then implemented in CSS/React.

## 2. Visual positioning

Current structure is acceptable. Upgrade the visual layer from:

- old: dark industrial single-product concept site
- new: warm, bright, multi-product maker ecommerce studio

Keywords:

- warm product studio
- light product gallery
- maker / 3D print / modular objects
- useful but playful
- small objects: stress-relief, charms/hangers, MagBlock

Avoid:

- pure black full-site background
- generic Shopify template
- cyber/RGB/game UI
- coffee-machine visual motif
- CSS-only abstract shapes as the main visual identity

## 3. Page region rules

### 3.1 Header

- Sticky, light glass layer.
- Background: warm canvas with blur, not black glass.
- Logo left, nav center/right, shop CTA right.
- Height around 64px.
- Border should be soft warm-gray.

### 3.2 Hero region

Goal: above-the-fold should immediately say “this is a bright physical product studio”.

Layout:

- Two-column desktop layout.
- Left: brand line, big Chinese headline, short product promise, 2 CTAs.
- Right: visual asset zone.
- Right visual zone should eventually be real product/scene image, not CSS geometry.
- Keep enough negative space.

Hero content should support these product families:

- 解压小物 / fidget / tactile desk objects
- 挂件与小配饰 / charms / hangers / accessories
- MagBlock / modular desk system

### 3.3 Product family region

Goal: users understand the site will carry multiple SKUs.

Layout:

- 3 cards on desktop, stacked on mobile.
- Each card = category label + family name + plain-language use case.
- Cards should feel like product tiles, not article cards.
- Use light cards with soft shadow and warm borders.

Families:

1. 解压小物
2. 挂件与小配饰
3. MagBlock 系统

### 3.4 Shop listing region

Goal: scalable browsing for many products.

Layout:

- Group products by family/category.
- Each section has title, count, and product grid.
- Product card image ratio: 4:3 or square; use warm placeholder when no image.
- Cards show category, name, shortDesc, price/status.

Rules:

- Do not hardcode SKU cards in React; products come from MDX.
- Category grouping may be implemented from `product.category`.
- Draft/prototype products can appear during early stage, but if not purchasable use priceUSD 0 and show 即将上架.

### 3.5 Detail page region

Goal: product page should feel like a clean product sheet.

Layout:

- Two-column desktop: image left, product info right.
- Large light image card.
- Metadata rows: material, dimensions, ship from, ship to.
- CTA clear but not aggressive.

### 3.6 Dark contrast region

Dark is allowed only as an accent panel, not global background.

Use for:

- Why OneGoods / philosophy block
- footer contrast, if needed

Rules:

- One dark panel per page max in primary flow.
- Dark panel should use warm charcoal, not pure black.
- Text contrast must stay readable.

## 4. CSS token rules

### 4.1 Color tokens

Recommended token direction:

```css
--color-bg: #F6F1E8;          /* warm studio canvas */
--color-bg-elevated: #FFFCF6; /* product card surface */
--color-fg: #211D18;          /* charcoal text */
--color-fg-muted: #6F665B;    /* warm muted text */
--color-accent: #D97706;      /* amber */
--color-accent-soft: #FFE2AE; /* amber wash */
--color-border: #DED2C1;
--color-border-subtle: #EAE1D3;
--color-bg-dark: #171411;
--color-fg-dark: #F8F3EA;
```

### 4.2 Card rules

Use one reusable visual language:

```css
.studio-card {
  background: color-mix(in srgb, var(--color-bg-elevated) 88%, white 12%);
  border: 1px solid var(--color-border);
  box-shadow: 0 18px 60px rgba(62, 49, 34, 0.08);
}
```

### 4.3 Background rules

Body can have subtle warm radial washes. Do not use full black as default.

```css
body {
  background:
    radial-gradient(circle at 20% 0%, rgba(255, 226, 174, 0.55), transparent 32rem),
    radial-gradient(circle at 100% 18%, rgba(222, 210, 193, 0.5), transparent 28rem),
    var(--color-bg);
}
```

## 5. Asset rules

- Layout should be CSS/React driven.
- Product/scene visuals can be GPT Image generated.
- GPT Image should produce actual product photography/render assets, not decide page layout.
- Hero visual zone can later use `/public/images/hero-*.png`.
- Product family cards can later use category images.

## 6. Implementation order

1. Define UI layout rules. ✅
2. Encode global CSS tokens and reusable classes. ✅ first pass done.
3. Implement homepage regions against these rules. ✅ first pass done.
4. Implement shop grouping and product card rules. ✅ first pass done.
5. Replace CSS abstract shapes with real image asset slots or GPT Image assets. NEXT.
6. Run build/lint and local screenshot QA. NEXT once terminal approval is available.

## 7. QA checklist

- Homepage no longer feels too dark.
- Header, hero, product families, and shop use one coherent light system.
- Multi-product direction is clear.
- 解压 / 挂件 / MagBlock all visible.
- No SKU hardcoding in shop grid.
- Placeholder products are not purchasable.
- Product details still work.
- Mobile layout stacks cleanly.
