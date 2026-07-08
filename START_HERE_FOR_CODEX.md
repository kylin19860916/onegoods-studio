# START HERE FOR CODEX — OneGoods Studio

Read this first when using Codex / TopCode to optimize OneGoods Studio.

## 1. Project

- Repo: `https://github.com/kylin19860916/onegoods-studio`
- Production: `https://onegoods.studio/`
- Framework: Next.js 16.2.4 + React 19 + Tailwind v4
- Content: `content/products/*.mdx` and `content/journal/*.mdx`

## 2. Required context

Read the full system map before editing:

```text
docs/ONEGOODS_STUDIO_CODEX_CONTEXT_20260708.md
```

Also read:

```text
PRODUCT.md
DESIGN.md
docs/product-management.md
AGENTS.md
```

## 3. Current product direction

OneGoods Studio is a selection-led ecommerce/content brand for:

```text
3D-printed stress-relief / fidget / emotional-value small objects
```

Near-term loop:

```text
选品 → 打印 → 拍内容 → 上架 → 看反馈 → 放大爆款
```

MagBlock remains a studio/maker line, but should not dominate the homepage.

## 4. Do not do these without Ken confirmation

- Do not expose, print, or commit secrets.
- Do not commit `.env.local`.
- Do not make draft products purchasable.
- Do not switch Stripe to live mode.
- Do not change shipping/payment rules.
- Do not replace the MDX content model with hardcoded products.
- Do not turn the design into a generic Shopify template.
- Do not assume the admin CMS can persist on Vercel without DB/GitHub write-back/external CMS.

## 5. Suggested Codex task prompt

```text
Optimize OneGoods Studio for the current 3D-printed stress-relief goods direction.

Read START_HERE_FOR_CODEX.md and docs/ONEGOODS_STUDIO_CODEX_CONTEXT_20260708.md first.

Improve homepage, shop, product detail pages, and channel purchase flow while preserving:
- Next.js 16 App Router architecture;
- MDX product data model;
- Shopee / Xiaohongshu / Instagram / direct purchase channel model;
- warm bright product-gallery visual direction;
- draft product safety: no fake purchasable SKUs.

Before final response, run:
- npm run lint
- npm run build

Report changed files and validation output.
```

## 6. Validation commands

```bash
npm run lint
npm run build
curl -I https://onegoods.studio/
curl -I https://onegoods.studio/shop
```
