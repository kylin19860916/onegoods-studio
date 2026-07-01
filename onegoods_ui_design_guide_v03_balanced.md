# OneGoods Studio — UI Design Guide v0.3 Balanced

Date: 2026-06-29
Owner: Ken / Xiaomo
Visual source: GPT-image 2 balanced guide board
Image reference: `/Users/withme/.hermes/cache/images/openai_codex_gpt-image-2-medium_20260629_204303_5dab05d7.png`

## 1. Strategic adjustment

Ken liked the cute / playful / healing direction, but asked whether it makes the brand too strongly young-female oriented. The answer: yes, the previous v0.2 board naturally leaned young female because of pink, hearts, kawaii softness, and charm-shop cues.

v0.3 adjusts the balance:

- Keep: cute, fun, healing, tactile, small-product shop.
- Reduce: overly pink, heart-heavy, women-only ornament feeling.
- Add: mint, butter yellow, soft blue, warm charcoal, maker/3D-print details, desk/EDC utility.
- Positioning: **young lifestyle small-goods brand** with young women as likely first adopter group, but not visually locked to women-only.

## 2. Market positioning

OneGoods Studio is a curated small-object shop for:

- 解压 / fidget / tactile desk objects
- 挂件 / keychain hangers / small accessories
- MagBlock / 3D printed / maker objects
- 网络热门小物精选 + 调整款
- Small giftable / collectible everyday goods

Primary conversion group:

- Young lifestyle shoppers, especially 小红书 / TikTok / IG users.
- Young women remain the strongest first audience.

But brand should also work for:

- Desk setup users
- EDC small-object users
- Maker / 3D printing audience
- Gift buyers
- Office stress-relief shoppers

Positioning line:

> 可爱、好玩、解压的小物集合。女性友好，但不是女性限定。

## 3. Visual balance rules

### 3.1 Keep cute, not childish

Use:

- rounded cards
- sticker-like icons
- soft object shadows
- tactile product photos/renders
- playful badges
- friendly Chinese copy

Avoid:

- too many hearts
- too many animal faces
- overly pink backgrounds
- baby-toy / kindergarten feeling
- beauty/accessory-only feeling

### 3.2 Keep healing, add utility

The site should feel soft and comforting, but also useful.

Add more cues for:

- desk use
- hand-feel / tactile interaction
- attach / hang / carry
- 3D print layer lines
- magnet points
- modular blocks
- curated / trending / remix tags

## 4. Balanced color system

Use cream as the global base. Use pastels as accents, but distribute them evenly.

```css
--color-bg: #FFF8EF;          /* warm cream canvas */
--color-bg-elevated: #FFFFFF; /* white product cards */
--color-fg: #2B211C;          /* warm charcoal */
--color-fg-muted: #776A60;    /* cozy muted brown */

--color-coral: #FF8F70;       /* primary CTA */
--color-peach: #FFD4BC;       /* warm friendly accent */
--color-butter: #FFE28A;      /* playful yellow */
--color-mint: #BFE8D4;        /* calming gender-neutral accent */
--color-sky: #BFDDF6;         /* light utility / desk accent */
--color-lavender: #D8D0FF;    /* controlled cute accent */
--color-pink: #FFD3E1;        /* use sparingly */

--color-accent: #FF7F5C;
--color-accent-soft: #FFE5D8;
--color-border: #F0DDD0;
--color-border-subtle: #F8EDE5;
```

### Accent assignment

- 解压小物: butter + coral
- 挂件与小配饰: lavender + peach, small amount of pink
- MagBlock / 3D 打印: mint + sky + charcoal
- 热门精选 / 调整改造: coral + butter

## 5. Icon balance

### Icon style

- Chubby rounded outline.
- Warm charcoal stroke.
- Pastel fills.
- Sticker feeling.
- Slight 3D / tactile detail allowed.

### Must-have icons

1. charm ring / 挂件圈
2. keychain / 钥匙扣
3. fidget puck / 解压旋钮
4. squishy blob / 捏捏小物
5. magnet dot / 磁吸点
6. modular block / 模块方块
7. 3D layer lines / 打印层纹
8. printer nozzle / 打印喷头
9. sparkle / 闪光
10. smile / 治愈笑脸
11. package box / 包裹
12. price tag / 标签
13. trending flame / 热门
14. remix arrows / 调整改造
15. heart / 喜欢 — use sparingly, not as brand core

### Icon usage rule

Every product family card should have one icon, but icon choice should avoid over-feminizing:

- 解压: fidget puck / blob
- 挂件: charm ring / keychain
- MagBlock: modular block / magnet dot / 3D layers
- 热门精选: trending flame / remix arrows

## 6. Layout rules

### Header

- Light sticky header.
- Cream translucent background.
- Coral CTA.
- No black nav bar.

### Hero

Hero should be a “small object shelf”, not a pure cute accessory poster.

Must show or imply:

- hand-sized objects
- attachable/hangable objects
- tactile desk toys
- 3D printed/maker object detail

Hero copy direction:

> 可爱、好玩、解压的小物集合。  
> 挂在包上，放在桌上，拿在手里玩。

Alternative broader copy:

> 把日常小物，做得更有手感。  
> 精选、调整、制作一批可玩的小东西。

### Product family cards

Cards should show four families:

1. 解压小物
2. 挂件与小配饰
3. 3D 打印 / MagBlock
4. 热门精选 / 调整改造

The fourth family is important because Ken clarified products are not all self-designed.

### Shop product cards

Add support for product source tags:

- 自研设计
- 3D 打印
- 热门精选
- 调整改造
- 即将上架

Cards should not imply every product is made from scratch by Ken.

## 7. Copy rules

Use “curated + adjusted + made” language.

Good:

- “精选、调整、制作值得玩的日常小物”
- “有些是 3D 打印，有些是热门小物的改良款”
- “可挂、可摆、可玩、可送礼”
- “放在桌上，挂在包上，拿在手里解压”

Avoid:

- “全部原创设计”
- “全手工制作”
- “女性饰品店”
- “高端工业硬件品牌”

## 8. Implementation changes from current local draft

The current local draft is too warm-minimal and still uses CSS geometric hero.

Next implementation should:

1. Replace 3-family homepage with 4-family balanced category system.
2. Add cute outlined icons directly in React/CSS, or SVG inline components.
3. Update global tokens toward v0.3 palette.
4. Add product source tags to product MDX schema or derive from optional frontmatter.
5. Update homepage copy to “可爱、好玩、解压的小物集合”.
6. Replace CSS geometric hero with product-shelf visual slot. If no final image, use a more UI-like illustrated placeholder with icons, not Bauhaus blocks.
7. Shop grouping supports 热门精选 / 调整改造 in addition to 解压 / 挂件 / MagBlock.

## 9. QA checklist

- Within 3 seconds, site feels cute / playful / healing.
- It does not feel like women-only accessories.
- Pink and hearts are present only as accents.
- Mint / sky / butter / charcoal balance the palette.
- Product source model supports curated/trending/adjusted goods.
- 3D-print and maker DNA remains visible.
- Product categories are clear and scalable.
