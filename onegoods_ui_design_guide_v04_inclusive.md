# OneGoods Studio — UI Design Guide v0.4 Inclusive

Date: 2026-06-29
Owner: Ken / Xiaomo
Scope: OneGoods Studio / 玩物工坊 website visual system
Status: Proposed direction after v0.3 balance review

## 1. Core positioning

OneGoods Studio should not be limited to a cute female-oriented charm shop, nor a hard maker / 3D-printing brand.

v0.4 positions OneGoods as:

> OneGoods Studio 是一个收集、改造、制作有趣日常小物的玩物工坊。

Short line:

> 把日常小物，变得更好玩。

This direction keeps the approachable, cute, healing quality from v0.3, but expands the brand to cover more product types and more user groups.

## 2. Market logic

The brand should be easy to enter through low-decision products:

- charms / hangers
- fidget / stress-relief toys
- desk objects
- small tools
- useful lifestyle gadgets
- curated trending goods
- adjusted / remixed popular products
- 3D printed / maker-built products
- MagBlock / modular products

Important product-source rule:

OneGoods products are not necessarily all designed from scratch by Ken.

Valid sources:

1. Original self-designed goods
2. 3D-printed maker products
3. Curated trending online goods
4. Adjusted / improved versions of popular goods
5. Small bundled gift sets
6. Seasonal / limited drops

Website copy should communicate:

- curated
- adjusted
- made
- small-batch
- playful everyday objects

Avoid implying every product is fully original or fully handmade.

## 3. Audience balance

v0.4 target audience:

- Young lifestyle shoppers
- Young women as an important first adopter group
- Desk setup users
- EDC / small accessory users
- Gift buyers
- Office stress-relief users
- Maker / 3D-printing curious users
- People who enjoy small useful/fun objects

Audience principle:

> 女性友好，但不是女性限定。可爱友好，但不是纯可爱饰品店。Maker 友好，但不是硬核技术站。

## 4. Visual mood

Overall mood:

- playful
- warm
- inclusive
- tactile
- light
- collectible
- useful
- healing but not overly sweet

Visual ratio:

- 40% cute / healing
- 25% useful little tools
- 20% maker / 3D print / modular
- 15% trending / giftable / curated

Avoid:

- women-only accessory shop feeling
- overuse of pink / hearts / cute animals
- black industrial hardware site feeling
- generic Shopify template
- cold SaaS minimalism
- cyberpunk / RGB / game UI

## 5. Category architecture

Use inclusive action-based categories instead of narrow product-type categories.

### 5.1 玩一玩

For:

- fidget toys
- stress-relief objects
- tactile desk toys
- squishy / click / spin / press objects

Tone:

- fun
- hand-feel
- decompress
- desk break

Icon candidates:

- fidget puck
- squishy blob
- smile
- sparkle

### 5.2 挂一挂

For:

- charms
- keychains
- bag hangers
- phone charms
- small attachable accessories

Tone:

- attach
- carry
- collect
- gift

Icon candidates:

- charm ring
- keychain
- loop
- tag

### 5.3 用一用

For:

- small tools
- useful daily gadgets
- desk helpers
- simple storage
- cable / phone / bag accessories

Tone:

- useful
- clever
- small improvement
- everyday helper

Icon candidates:

- package box
- mini tool
- clip
- holder
- check mark

### 5.4 造一造

For:

- 3D-printed products
- MagBlock
- modular systems
- maker experiments
- adjusted / remixed products

Tone:

- maker
- modular
- customizable
- small-batch

Icon candidates:

- 3D print layer lines
- printer nozzle
- magnet dot
- modular block
- remix arrows

## 6. Color system

v0.4 should be more inclusive than v0.3 by reducing pink dominance and adding utility colors.

```css
--color-bg: #FFF8EF;          /* warm cream canvas */
--color-bg-elevated: #FFFFFF; /* product card surface */
--color-fg: #2B211C;          /* warm charcoal */
--color-fg-muted: #756A60;    /* warm muted brown */

--color-coral: #FF8A68;       /* primary playful CTA */
--color-peach: #FFD3B8;       /* warm soft accent */
--color-butter: #FFE28A;      /* playful / fidget */
--color-mint: #BFE8D4;        /* calm / utility */
--color-sky: #BFDDF6;         /* useful / desk / tool */
--color-lavender: #D8D0FF;    /* charm / collectible */
--color-clay: #D8A878;        /* maker / material warmth */
--color-pink: #FFD3E1;        /* limited accent only */

--color-accent: #FF7F5C;
--color-accent-soft: #FFE5D8;
--color-border: #F0DDD0;
--color-border-subtle: #F8EDE5;
--color-bg-dark: #2B211C;
--color-fg-dark: #FFF8EF;
```

Category accent mapping:

- 玩一玩: butter + coral
- 挂一挂: lavender + peach, tiny pink only
- 用一用: mint + sky
- 造一造: clay + mint + charcoal

## 7. Shape system

Shapes should feel soft, tactile, and object-like.

```css
--radius-card: 28px;
--radius-soft: 20px;
--radius-pill: 999px;
--shadow-card: 0 18px 50px rgba(86, 55, 34, 0.10);
--shadow-float: 0 24px 70px rgba(86, 55, 34, 0.14);
```

Rules:

- Product cards: rounded 24–32px.
- Buttons: pill.
- Category chips: pill / sticker style.
- Image cards: soft rounded rectangles.
- Icons: chubby rounded outline.

## 8. Icon system

Icon style:

- warm charcoal outline
- pastel fills
- chubby rounded shape
- sticker-like but not childish
- readable at small sizes
- no thin SaaS line icons

Core icon set:

1. fidget puck
2. squishy blob
3. smile
4. sparkle
5. charm ring
6. keychain loop
7. small tag
8. package box
9. mini tool / clip
10. holder / stand
11. 3D print layer lines
12. printer nozzle
13. magnet dot
14. modular block
15. remix arrows
16. trending flame
17. heart — limited use only

Usage:

- Each category gets one main icon.
- Product cards may show 1–3 badges.
- Heart icon should not dominate brand identity.

## 9. Layout rules

### 9.1 Header

- Cream translucent sticky header.
- Logo left, nav center/right, shop CTA right.
- Small playful mark allowed near logo.
- Avoid black navigation bar.

### 9.2 Hero

Hero should express the broad brand idea:

> 把日常小物，变得更好玩。

Hero structure:

- Left: headline, short explanation, CTA.
- Right: product shelf / object tray / category cluster visual.
- Show a mix of:
  - fidget object
  - charm / hanger
  - useful small tool
  - 3D printed / modular object

Hero should not look like only jewelry/accessories.
Hero should not look like only maker hardware.

### 9.3 Category section

Use four action categories:

1. 玩一玩
2. 挂一挂
3. 用一用
4. 造一造

Each card includes:

- icon
- category name
- one-line use case
- example product types
- pastel accent color

### 9.4 Shop page

Shop should group by category/action family.

Product card fields:

- image / placeholder
- category badge
- source badge: 自研 / 3D打印 / 热门精选 / 调整改造 / 即将上架
- product name
- shortDesc
- price or status

### 9.5 Product detail page

Product details should show source type clearly:

- 商品来源: 自研 / 精选 / 调整改造 / 3D打印
- 材质
- 尺寸
- 发货地
- 配送地区

This helps avoid the false impression that all products are self-designed.

## 10. Copy rules

Use inclusive copy:

Good copy:

- “把日常小物，变得更好玩。”
- “收集、调整、制作一批值得玩的日常小物。”
- “挂在包上，放在桌上，拿在手里玩。”
- “有些是 3D 打印，有些是热门小物的改良款。”
- “可玩、可挂、可用、可改造。”

Avoid:

- “全部原创设计”
- “女性饰品店”
- “硬核 3D 打印品牌”
- “高端工业硬件”
- “只做可爱挂件”

## 11. Implementation implications

Current local v0.3 draft should be revised as follows:

1. Homepage headline changes to “把日常小物，变得更好玩。”
2. Product families become four action categories: 玩一玩 / 挂一挂 / 用一用 / 造一造.
3. Add inline icon components or CSS/SVG icons for each category.
4. Product MDX supports optional `sourceType` / `badges` / `family`.
5. Shop cards show source badges.
6. Hero visual slot should show mixed object shelf, not only cute charms.
7. Pink is reduced; mint/sky/clay increase.
8. 3D print remains visible but not dominant.

## 12. QA checklist

- Within 3 seconds, user understands this is a playful everyday objects shop.
- Site feels cute and healing, but not women-only.
- Site can sell charms, fidgets, tools, curated goods, and 3D-printed products.
- Category system is broad enough for future SKUs.
- Product source does not falsely imply every item is original.
- UI uses icons as part of the brand language.
- No full-site dark industrial mood.
