# OneGoods Studio — Codex Context / System Map

Date: 2026-07-08
Owner: Ken / Xiaomo
Repo: `kylin19860916/onegoods-studio`
Local workdir: `/Users/withme/Projects/onegoods-studio`
Production URL: `https://onegoods.studio/`
Vercel fallback URL: `https://onegoods-studio.vercel.app/`

> Purpose: this document is the source-of-truth handoff for Codex/TopCode or any coding agent that needs to optimize OneGoods Studio from GitHub/repo context. It summarizes what exists, what is currently local-only, and which external channels the site touches.

## 1. Current GitHub / local sync status

### GitHub

- GitHub repo: `https://github.com/kylin19860916/onegoods-studio`
- Visibility: public
- Default branch: `main`
- Current local HEAD / `origin/main`: `0fdf321 Add OneGoods clean icon assets`
- Git remote: `origin=https://github.com/kylin19860916/onegoods-studio.git`

### Important: not everything is pushed yet

At the time of this handoff, the local repo contains uncommitted product-positioning and UI/content changes. They are **not yet on GitHub** and therefore cannot be used by Codex if Codex only reads GitHub.

Current local-only changed files:

- `content/journal/welcome.mdx`
- `content/products/desk-fidget-puck.mdx`
- `content/products/everyday-charm-hanger.mdx`
- `content/products/magblock-hub-module.mdx`
- `content/products/magblock-starter-kit.mdx`
- `src/app/brand-story/page.tsx`
- `src/app/contact/page.tsx`
- `src/app/journal/page.tsx`
- `src/app/page.tsx`
- `src/app/shop/[slug]/page.tsx`
- `src/app/shop/page.tsx`
- `src/components/Footer.tsx`
- `src/components/Header.tsx`
- `src/lib/content.ts`
- `src/components/PurchaseLinks.tsx` currently exists locally as a new untracked component.

Recommended before giving GitHub-only Codex optimization access:

1. Run validation locally: `npm run lint && npm run build`.
2. Secret-check staged files; never commit `.env.local`.
3. Commit/push the local changes and this context doc to `main` or a review branch.
4. Remember: pushing `main` triggers Vercel production deployment.

## 2. Product / business positioning

OneGoods Studio / 玩物工坊 is currently positioned as a selection-led e-commerce + content brand for small 3D-printed emotional-value objects.

Latest working direction:

- Core category: stress-relief / fidget / playful everyday 3D-printed small objects.
- Brand role: curated, playful, light, ecommerce-ready product gallery.
- Operating loop: `选品 → 打印 → 拍内容 → 上架 → 看反馈 → 放大爆款`.
- Channel strategy:
  - Independent site: brand hub + product landing / transaction support.
  - Shopee: listing, sales, logistics, reviews.
  - Xiaohongshu: content seeding + Xiaohongshu shop.
  - Instagram: overseas content, Reels, link-back to independent site.
- MagBlock is kept as a studio / maker line, but no longer dominates the homepage. Current near-term priority is stress-relief / emotional-value 3D-printed small goods.

Avoid:

- Coffee-machine recurring motif.
- Dark cyber / RGB / hard industrial maker UI.
- Generic Shopify template feeling.
- Overclaiming finalized products while SKUs are still draft/testing.

## 3. Tech stack

- Framework: Next.js `16.2.4` App Router + Turbopack.
- React: `19.2.4`.
- Styling: Tailwind CSS v4 through `src/app/globals.css`.
- Language: TypeScript.
- Content system: MDX-like frontmatter files parsed with `gray-matter` from `content/products/*.mdx` and `content/journal/*.mdx`.
- Checkout: Stripe Checkout API route.
- Newsletter/subscription: Resend API route.
- Analytics: GA4 + Microsoft Clarity through public env vars.

Important local agent instruction:

- Read `AGENTS.md` before modifying code.
- This project uses a newer Next.js version; do not assume older App Router APIs.

## 4. Repo structure

```text
.
├── AGENTS.md
├── README.md
├── package.json
├── .env.example
├── content/
│   ├── products/*.mdx
│   └── journal/*.mdx
├── docs/
│   └── visual-reference/
├── public/
│   └── images/
│       ├── icons/v4-clean/
│       ├── icons/v4-series-clean/
│       └── visual-reference/
└── src/
    ├── app/
    │   ├── page.tsx
    │   ├── layout.tsx
    │   ├── globals.css
    │   ├── shop/
    │   ├── brand-story/
    │   ├── journal/
    │   ├── contact/
    │   └── api/
    │       ├── checkout/route.ts
    │       └── subscribe/route.ts
    ├── components/
    │   ├── Header.tsx
    │   ├── Footer.tsx
    │   ├── CheckoutButton.tsx
    │   ├── PurchaseTracker.tsx
    │   ├── Analytics.tsx
    │   ├── SubscribeForm.tsx
    │   └── PurchaseLinks.tsx   # local-only/untracked at handoff time
    └── lib/content.ts
```

## 5. Product data model

Product data lives in `content/products/*.mdx` frontmatter and is loaded by `src/lib/content.ts`.

Current relevant fields:

```ts
type PurchaseLinks = {
  shopee?: string;
  xiaohongshu?: string;
  instagram?: string;
  direct?: string;
};

type Product = {
  slug: string;
  name: string;
  category: string;
  family?: string;
  sourceType?: string;
  badges?: string[];
  mood?: string[];
  motion?: string[];
  salesStatus?: string;
  printDifficulty?: string;
  contentScore?: number;
  purchaseLinks?: PurchaseLinks;
  priceUSD: number;
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

Current draft SKU direction:

- `desk-fidget-puck`: first stress-relief testing SKU; high content score; price disabled (`priceUSD: 0`).
- `everyday-charm-hanger`: charm/keychain direction; content/social testing SKU; price disabled.
- `magblock-hub-module`: retained studio/magnetic desk concept; not first sales priority.
- `magblock-starter-kit`: retained MagBlock concept asset; not first sales priority.

Important: `priceUSD: 0` intentionally disables purchase through Stripe checkout and returns “not yet available”. Do not make these purchasable until Ken confirms real product/pricing/logistics.

## 6. External channels touched by the site

### 6.1 Domain / DNS

- Root production domain: `https://onegoods.studio/`
- `www.onegoods.studio` redirects to root.
- Nameservers observed: Cloudflare
  - `garret.ns.cloudflare.com`
  - `liz.ns.cloudflare.com`
- Root A records observed point to Vercel edge IPs.
- `https://onegoods.studio/` returns HTTP 200.
- `https://onegoods.studio/shop` returns HTTP 200.

### 6.2 Vercel

- Production is deployed on Vercel.
- Production URL: `https://onegoods.studio/`
- Vercel fallback URL: `https://onegoods-studio.vercel.app/`
- GitHub `main` push auto-deploys according to project docs.
- No local `.vercel/project.json` was found in the repo at handoff time, so local CLI project linking is not stored in the repo.

### 6.3 GitHub

- Repo: `kylin19860916/onegoods-studio`
- URL: `https://github.com/kylin19860916/onegoods-studio`
- Public repo.
- Main branch deploys.

### 6.4 Stripe

- Checkout route: `src/app/api/checkout/route.ts`
- Env vars:
  - `STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET` (future webhook use)
- Base currency: USD.
- Current allowed shipping countries: `AU`, `CN`, `HK`, `MO`, `TW`.
- Success URL: `/shop/{slug}?status=success&session_id={CHECKOUT_SESSION_ID}`.
- Cancel URL: `/shop/{slug}?status=cancelled`.
- Current products with `priceUSD <= 0` should not create Checkout sessions.
- Do not expose or commit live/test Stripe keys.

### 6.5 Resend

- Subscribe route: `src/app/api/subscribe/route.ts`
- Env vars:
  - `RESEND_API_KEY`
  - `RESEND_AUDIENCE_ID`
- If `RESEND_AUDIENCE_ID` exists, new email submits create a Resend contact.
- If audience ID is missing, current implementation returns ok after logging a warning; there is no local DB persistence.
- Do not expose or commit Resend API keys.

### 6.6 Analytics

- Component: `src/components/Analytics.tsx`
- Env vars:
  - `NEXT_PUBLIC_GA4_ID`
  - `NEXT_PUBLIC_CLARITY_ID`
- These are public browser IDs, but still should be managed through env configuration.

### 6.7 Ecommerce/social purchase channels

Local model supports channel-specific purchase links via `purchaseLinks` frontmatter:

- `shopee`
- `xiaohongshu`
- `instagram`
- `direct`

UI component: `src/components/PurchaseLinks.tsx`.

Current meaning:

- Shopee: formal listing/sales/logistics/reviews.
- Xiaohongshu: content seeding + store conversion.
- Instagram: overseas visual proof + link-back.
- Direct: future independent-site purchase / Stripe / Shopify entrance.

## 7. Environment variables

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
```

Security rules:

- `.env.local` exists locally but must never be committed.
- Never print or paste real secrets into chat, docs, commits, or logs.
- Keep `.env.example` placeholder-only.

## 8. Visual / brand source of truth

Current accepted visual direction:

- Warm bright product gallery.
- Product cards / soft shadows / approachable studio feeling.
- Multi-product, ecommerce-ready surface.
- Supports stress-relief small objects as primary product pool.

Relevant files:

- `onegoods_ui_design_guide_v04_inclusive.md`
- `docs/visual-reference/onegoods-v4-visual-reference-standard.md`
- `docs/visual-reference/onegoods-v4-inclusive-ui-board.png`
- `public/images/visual-reference/onegoods-v4-inclusive-ui-board.png`
- `public/images/icons/v4-clean/*`
- `public/images/icons/v4-series-clean/*`

## 9. Recommended Codex optimization brief

If Codex reads from GitHub after push, give it this task:

```text
You are optimizing OneGoods Studio, a Next.js 16 / React 19 / Tailwind v4 ecommerce-content brand site for 3D-printed stress-relief and emotional-value small objects.

Read AGENTS.md and docs/ONEGOODS_STUDIO_CODEX_CONTEXT_20260708.md first.

Do not change secrets, payment country rules, or make draft SKUs purchasable.
Do not remove the MDX product architecture.
Do not turn the site into a generic Shopify template.
Keep the warm, bright, product-gallery direction.
Optimize homepage, shop, product pages, and channel/purchase flow so the site clearly supports:
- stress-relief/fidget 3D-printed objects as the main near-term product pool;
- Shopee / Xiaohongshu / Instagram / direct purchase channel links;
- MagBlock as a retained studio/maker line, not the primary homepage story.

Before final answer, run npm run lint and npm run build, then report changed files and validation output.
```

## 10. Current validation snapshot

Production checks observed on 2026-07-08:

- `https://onegoods.studio/` → HTTP 200
- `https://www.onegoods.studio/` → 301 redirect to root, then 200
- `https://onegoods-studio.vercel.app/` → HTTP 200
- `https://onegoods.studio/shop` → HTTP 200

Local validation still needed before pushing local changes:

```bash
cd /Users/withme/Projects/onegoods-studio
npm run lint
npm run build
git status --short
```

## 11. Open decisions / blockers

- The latest local UI/content changes are not pushed yet.
- Pushing to `main` will likely deploy to Vercel production; confirm this is desired before pushing.
- Real product purchase links and real product images are still pending Ken/product operations.
- Stripe live mode and real checkout should not be enabled until product/pricing/logistics are confirmed.
