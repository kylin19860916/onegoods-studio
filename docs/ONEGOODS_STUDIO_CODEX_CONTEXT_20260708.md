# OneGoods Studio — Codex Context / System Map

Date: 2026-07-08
Owner: Ken / Xiaomo
Repo: `kylin19860916/onegoods-studio`
Local workdir: `/Users/withme/Projects/onegoods-studio`
Production URL: `https://onegoods.studio/`
Vercel fallback URL: `https://onegoods-studio.vercel.app/`

This is the source-of-truth handoff for Codex / TopCode / coding agents optimizing OneGoods Studio.

## 1. GitHub / deployment state

- GitHub repo: `https://github.com/kylin19860916/onegoods-studio`
- Visibility: public
- Default branch: `main`
- Production is connected to Vercel and deploys from GitHub `main`.
- Production domain: `https://onegoods.studio/`
- Fallback Vercel domain: `https://onegoods-studio.vercel.app/`

Main now contains the current OneGoods storefront repositioning, product images, product MDX updates, CMS admin scaffold, and this Codex context package.

## 2. Product direction

OneGoods Studio / 玩物工坊 is a brand and commerce hub for:

```text
3D-printed stress-relief / fidget / emotional-value small objects
```

Current operating loop:

```text
选品 → 打印 → 拍内容 → 上架 → 看反馈 → 放大爆款
```

Channel role:

- Independent site: brand hub + product landing + purchase routing.
- Shopee: listing, sales, logistics, reviews.
- Xiaohongshu: content seeding + Xiaohongshu shop conversion.
- Instagram: overseas visual proof + Reels + link-back.
- MagBlock: retained studio/maker line, but not the homepage lead.

Avoid:

- coffee-machine recurring motif;
- dark cyber / RGB / hard industrial maker look;
- generic Shopify template feeling;
- fake purchasable SKUs before product/pricing/logistics are confirmed.

## 3. Tech stack

- Framework: Next.js `16.2.4` App Router + Turbopack
- React: `19.2.4`
- Styling: Tailwind CSS v4 via `src/app/globals.css`
- Language: TypeScript
- Content: frontmatter MDX files parsed with `gray-matter`
- Checkout: Stripe Checkout API route
- Newsletter: Resend API route
- Analytics: GA4 + Microsoft Clarity public env vars

Important: read `AGENTS.md` and this file before editing. This project uses a newer Next.js version; do not assume older App Router conventions.

## 4. Core repo map

```text
.
├── START_HERE_FOR_CODEX.md
├── PRODUCT.md
├── DESIGN.md
├── AGENTS.md
├── docs/
│   ├── ONEGOODS_STUDIO_CODEX_CONTEXT_20260708.md
│   └── product-management.md
├── content/
│   ├── products/*.mdx
│   └── journal/*.mdx
├── public/images/products/
├── src/app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   ├── shop/
│   ├── brand-story/
│   ├── journal/
│   ├── contact/
│   ├── admin/
│   └── api/
│       ├── checkout/route.ts
│       ├── subscribe/route.ts
│       └── admin/*
├── src/components/
└── src/lib/content.ts
```

## 5. Product content model

Products live in `content/products/*.mdx` and load through `src/lib/content.ts`.

Important fields:

```ts
type Product = {
  slug: string;
  name: string;
  category: string;
  family?: string;
  sourceType?: string;
  badges?: string[];
  mood?: string[];
  motion?: string[];
  salesStatus?: 'idea' | 'testing' | 'sample-ready' | 'listed' | 'sold-out' | 'retired';
  purchaseLinks?: {
    shopee?: string;
    xiaohongshu?: string;
    instagram?: string;
    direct?: string;
  };
  priceUSD: number;
  priceLabel?: string;
  shortDesc: string;
  materials?: string;
  dimensions?: string;
  weight?: string;
  shipFrom?: string;
  shipTo?: string[];
  images?: string[];
  status: 'draft' | 'published';
  order: number;
  body: string;
};
```

Current products include:

- `strawberry-button-fidget` — 草莓按压解压钮
- `cloud-slide-mini-case` — 云朵滑盖小物盒
- `mushroom-spinner-desk-buddy` — 小蘑菇旋转摆件
- `magblock-starter-kit` — MagBlock 工坊候选套件

Safety rule: products with `priceUSD: 0` should not create Stripe Checkout sessions. Do not make a product actually purchasable until Ken confirms price, stock, fulfillment, and purchase channel.

## 6. Admin / CMS scaffold

Current main includes an admin scaffold:

- `/admin`
- `/admin/login`
- `/admin/products`
- `src/app/api/admin/login/route.ts`
- `src/app/api/admin/logout/route.ts`
- `src/app/api/admin/products/route.ts`

Docs: `docs/product-management.md`

Current intent:

- local/admin product management and `.mdx` product file generation;
- not a full production CMS yet;
- Vercel cannot persist repo file edits like Shopify without adding database, GitHub write-back, or a third-party CMS.

Admin env vars:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

Never expose or commit these values.

## 7. Domain / DNS / hosting

Observed production checks:

- `https://onegoods.studio/` → HTTP 200
- `https://www.onegoods.studio/` → redirects to root
- `https://onegoods-studio.vercel.app/` → HTTP 200
- `https://onegoods.studio/shop` → HTTP 200

DNS observed:

- Nameservers: Cloudflare
  - `garret.ns.cloudflare.com`
  - `liz.ns.cloudflare.com`
- Root domain points to Vercel edge IPs.

## 8. External services and env vars

Reference template: `.env.example`

```text
STRIPE_PUBLISHABLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
RESEND_API_KEY=...
RESEND_AUDIENCE_ID=...
NEXT_PUBLIC_SITE_URL=https://onegoods.studio
NEXT_PUBLIC_GA4_ID=...
NEXT_PUBLIC_CLARITY_ID=...
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
ADMIN_SESSION_SECRET=...
```

### Stripe

- Route: `src/app/api/checkout/route.ts`
- Base currency: USD
- Allowed shipping countries: `AU`, `CN`, `HK`, `MO`, `TW`
- Do not switch to live mode without Ken confirmation.

### Resend

- Route: `src/app/api/subscribe/route.ts`
- Uses `RESEND_API_KEY` and optionally `RESEND_AUDIENCE_ID`.
- If `RESEND_AUDIENCE_ID` is missing, current behavior logs a warning; no local DB persistence.

### Analytics

- Component: `src/components/Analytics.tsx`
- Env vars:
  - `NEXT_PUBLIC_GA4_ID`
  - `NEXT_PUBLIC_CLARITY_ID`

## 9. Visual / copy source of truth

Read:

- `PRODUCT.md`
- `DESIGN.md`
- `docs/product-management.md`
- `docs/visual-reference/onegoods-v4-visual-reference-standard.md`

Current visual direction:

- warm light product-gallery surface;
- physical product first;
- coral primary CTA;
- stress-relief / cute / tactile consumer-goods tone;
- not founder-first, not maker-process-first.

## 10. Suggested Codex task

```text
Optimize OneGoods Studio for the current 3D-printed stress-relief goods direction.

Read START_HERE_FOR_CODEX.md and docs/ONEGOODS_STUDIO_CODEX_CONTEXT_20260708.md first.

Improve homepage, shop, product detail pages, and purchase channel flow while preserving:
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

## 11. Validation commands

```bash
npm run lint
npm run build
curl -I https://onegoods.studio/
curl -I https://onegoods.studio/shop
```

## 12. Open decisions

- Real purchase links for Shopee / Xiaohongshu / Instagram are still pending.
- Stripe live checkout is not enabled for real sales until Ken confirms real product/pricing/logistics.
- Full production CMS persistence requires future decision: DB, GitHub write-back, or external CMS.
