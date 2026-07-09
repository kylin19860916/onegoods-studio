# OneGoods Studio · 玩物工坊

An indie e-commerce storefront for a studio that makes 3D-printed fidget toys and
bag charms. Built as a self-contained React + TypeScript + Vite single-page app
from a design exported by Claude Design.

> **Note:** This is a standalone reference prototype living under `prototypes/`.
> It is independent of the main Next.js site at the repo root — it has its own
> `package.json`, does not participate in the root build/deploy, and does not
> touch the main app. Run it from inside this directory.

## Features

- **Five screens** with client-side routing: Home, Shop, Product Detail, Cart, and
  Story (品牌故事).
- **Tri-language** UI — 简体 / 繁體 / English. Every string, product name, and colour
  name is localized.
- **Multi-currency** — ¥ CNY / NT$ TWD / AU$ AUD. Switching language auto-links the
  currency (简→¥, 繁→NT$, EN→AU$); currency can still be overridden independently.
  Both preferences persist to `localStorage`.
- **繁體 slogan font fallback** — the handwritten slogan uses ZCOOL KuaiLe, falling
  back to LXGW WenKai TC in 繁體 for complete character coverage.
- **Drag-and-drop image slots** — drop a photo onto any product/hero placeholder and
  it is saved to `localStorage`. The hero ships with the studio's uploaded photo.
- **Custom inline SVG icon set** (no emoji) matching the brand's soft, rounded style.
- Cart with add / remove / quantity stepper, live subtotal, free-shipping threshold,
  and currency-aware pricing throughout.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build to dist/
npm run preview  # preview the production build
```

## Project structure

```
src/
  main.tsx              app entry
  App.tsx               screen router
  store.tsx             state, persistence, currency formatting, product decoration
  i18n.ts               简/繁/EN string dictionary
  data.ts               brand palette, colour names, product catalogue
  css.ts                CSS-string → React style helper (for dynamic badges)
  styles.css            reset, fonts, keyframes, hover utilities
  components/
    Nav.tsx  Footer.tsx  ProductCard.tsx  ImageSlot.tsx  Icons.tsx
  screens/
    Home.tsx  Shop.tsx  Detail.tsx  Cart.tsx  About.tsx
public/
  hero.webp             the studio's uploaded hero photo (pre-seeded slot)
  favicon.svg
```

## Design system

- **Palette** — warm handcraft / 日系 family: Cream `#FAF2E4`, warm Coral `#EF6A55`,
  plus muted category tints. Product colour dots stay vivid (they represent real
  product colours).
- **Type** — Quicksand (display) + Inter (body) + Noto Sans SC, with ZCOOL KuaiLe /
  LXGW WenKai TC for the handwritten slogan.
- Rounded corners, soft shadows, generous whitespace, and a sticker-badge system.

## Notes

- Self-contained: this prototype does not import from or modify the root Next.js
  application. Delete the directory to remove it entirely.
