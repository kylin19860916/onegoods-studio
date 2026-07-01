# OneGoods Studio — UI Design Guide v0.2

Date: 2026-06-29
Owner: Ken / Xiaomo
Visual source: GPT-image 2 guide board
Image reference: `/Users/withme/.hermes/cache/images/openai_codex_gpt-image-2-medium_20260629_203522_b965ef32.png`

## 1. Brand direction

OneGoods Studio should feel like a **cute, playful, healing small-product shop**.

The site is not only for self-designed MagBlock products. It can also curate trending online products, adjust/improve them, and sell them under the OneGoods Studio product selection system. A portion of SKUs are 3D-printed or maker-built.

Core product families:

1. 解压小物 / stress-relief / fidget toys
2. 挂件与小配饰 / charms / hangers / keychain-like accessories
3. MagBlock / 3D-printed / modular maker products
4. Curated trending goods / 网络热门小物调整款

Brand feeling:

- cute but not childish
- playful but still curated
- healing / soft / comfortable
- tactile / squishy / hand-feel
- small-batch / maker / 3D-print friendly

Avoid:

- heavy dark industrial UI as the main style
- generic Shopify template
- cyberpunk / RGB / gaming
- coffee-machine motif
- cold minimal luxury
- sharp hard-edged tech UI

## 2. Visual language

### 2.1 Keywords

- soft product playground
- healing desk toys
- charm shop / keychain wall
- tactile fidget shelf
- pastel maker studio
- curated little objects
- 3D-printed texture / layer lines

### 2.2 Mood

The site should feel like opening a small, warm, organized drawer full of cute useful objects.

Not “serious hardware brand”.
Not “dark industrial concept”.
More like: warm studio + toy shelf + craft market + product curation.

## 3. Color system

Use a warm cream base with pastel product-family accents.

```css
--color-bg: #FFF8EF;          /* warm cream canvas */
--color-bg-elevated: #FFFFFF; /* card surface */
--color-fg: #2B211C;          /* warm charcoal */
--color-fg-muted: #7B6D63;    /* cozy muted brown */

--color-peach: #FFC7A8;       /* healing peach */
--color-coral: #FF8F70;       /* primary CTA / playful accent */
--color-butter: #FFE48A;      /* soft yellow */
--color-mint: #BFEAD7;        /* calm mint */
--color-lavender: #D9CCFF;    /* cute lavender */
--color-pink: #FFCFE1;        /* charm / kawaii accent */

--color-accent: #FF7F5C;      /* main orange-coral */
--color-accent-soft: #FFE5D8;
--color-border: #F0DDD0;
--color-border-subtle: #F7EAE0;
--color-bg-dark: #2B211C;     /* only for small contrast zones */
--color-fg-dark: #FFF8EF;
```

Rules:

- Full page background stays cream/off-white.
- Use pastel accents by product family.
- Text uses warm charcoal, not pure black.
- Dark background is only for small contrast badges or footer panels.

## 4. Shape and spacing rules

### 4.1 Border radius

Everything should feel rounded / soft / tactile.

```css
--radius-card: 28px;
--radius-soft: 20px;
--radius-pill: 999px;
```

Rules:

- Product cards: 24–32px radius.
- Buttons: pill radius.
- Image placeholders: rounded rectangle, not sharp square.
- Small badges: pill or sticker style.

### 4.2 Shadow

Soft, low contrast, object-on-table feeling.

```css
--shadow-card: 0 18px 50px rgba(86, 55, 34, 0.10);
--shadow-float: 0 24px 70px rgba(86, 55, 34, 0.14);
```

Do not use harsh black shadows.

## 5. Typography

Direction: friendly rounded sans + clean product information hierarchy.

Rules:

- H1: large, rounded, friendly, high whitespace.
- H2/H3: clear and product-led.
- Labels: mono or small uppercase only for product metadata, but do not overuse.
- Chinese headlines should be warm and direct, not too industrial.

Example headline tone:

- “可爱、好玩、解压的小物集合。”
- “把日常小物，做得更有手感。”
- “挂在包上，放在桌上，拿在手里玩。”

## 6. Icon system

Icon style should be detailed enough to become part of brand memory.

### 6.1 Icon visual rules

- Chubby rounded outline.
- Dark warm-brown stroke.
- Pastel fill.
- Slight sticker feeling.
- Simple, readable at small size.
- No thin-line tech icons.
- No sharp monochrome SaaS icons.

### 6.2 Core icon set

Required icons:

1. tiny charm / 挂件
2. keychain ring / 钥匙圈
3. fidget puck / 解压旋钮
4. squishy blob / 软萌捏捏
5. magnetic dot / 磁吸点
6. modular block / 模块方块
7. 3D print layer lines / 打印层纹
8. 3D printer nozzle / 打印喷头
9. sparkle / 闪光
10. smile / 治愈笑脸
11. package box / 包裹
12. heart / 喜欢
13. tag / 价格标签
14. trending flame / 热门
15. remix / 调整改造

### 6.3 Icon usage

- Homepage product family cards should have icons.
- Shop category headers should have icons.
- Product cards can use small badges: New / Trending / 3D Print / Curated / Coming Soon.

## 7. Page layout rules

### 7.1 Header

- Light sticky header.
- Logo left, nav right/center, Shop CTA.
- Add tiny playful dot/mark near logo if needed.
- Background: cream glass, not black.

### 7.2 Hero

Hero should look like a playful product shelf.

Layout:

- Left: headline + subcopy + CTA.
- Right: large rounded product-shelf image area or illustrated product card stack.
- No CSS-only abstract geometry as final hero.
- If no final product images yet, use soft product-placeholder illustrations / GPT Image assets.

Hero copy direction:

> 可爱、好玩、解压的小物集合。  
> 挂在包上，放在桌上，拿在手里玩。

CTA:

- 逛逛小物
- 看解压新品
- 查看挂件系列

### 7.3 Product family cards

Three/four family cards:

1. 解压小物
   - accent: butter yellow / coral
   - icon: fidget puck / squishy blob
2. 挂件与小配饰
   - accent: pink / lavender
   - icon: charm / keychain ring
3. MagBlock / 3D 打印
   - accent: mint / amber
   - icon: modular block / 3D layer lines
4. 热门小物调整款
   - accent: peach / coral
   - icon: trending flame / remix

Cards should feel like clickable product shelves.

### 7.4 Shop page

- Group by product family.
- Each group has pastel header chip + icon.
- Product cards should support curated/trending/3D-print tags.
- Image zone should be warm and cute, with rounded placeholder if no real image.
- Price/status should be clear but soft.

### 7.5 Product card

Card content:

- Image / placeholder
- Family badge
- Product name
- Short one-line use case
- Tags: 3D Printed / Curated / Trending / Coming Soon
- Price or status

Card style:

- white card
- pastel top strip or floating badge
- soft shadow
- rounded 28px
- optional small sticker icon top-right

## 8. Product-source rule

OneGoods products are not limited to self-designed original products.

Valid SKU sources:

1. 自研设计 / original design
2. 3D 打印改造 / 3D-printed maker adaptation
3. 网络热门小物精选 / curated trending product
4. 热门产品微调 / adjusted/remixed popular item
5. 小批量组合套装 / bundled small goods

Website copy must allow this:

- “精选 + 调整 + 小批量制作”
- “我们挑选、改造、组合值得玩的日常小物”
- “部分商品为 3D 打印或小批量 maker 制作”

Avoid saying every product is fully self-designed.

## 9. Current implementation implications

Replace current first-pass warm minimal UI with this v0.2 direction:

- More cute / playful / healing.
- Add icons into family cards and shop sections.
- Change headline from maker-industrial to small-object playful ecommerce.
- Replace abstract CSS geometry with product shelf / image slot.
- Add Curated / 3D Print / Trending / Coming Soon tags in product data model if needed.

## 10. QA checklist

- Site feels cute, playful, healing within 3 seconds.
- Product families are instantly clear: 解压 / 挂件 / 3D打印 / 热门精选.
- Icons feel custom and brand-specific, not generic.
- Shop supports products not designed by Ken personally.
- 3D printed products are present but not the only product identity.
- UI is light, warm, and comfortable.
- No full-site dark industrial mood.
