import Link from "next/link";
import { getAllProducts, type Product } from "@/lib/content";

export const metadata = {
  title: "Shop",
  description: "OneGoods Studio · 玩物工坊产品",
};

const seriesList = [
  { key: "fruit", title: "水果系列", label: "Fruit Friends", iconSrc: "/images/icons/v4-series-clean/fruit-squishy.png", color: "var(--color-butter)" },
  { key: "food", title: "美食系列", label: "Snack & Food", iconSrc: "/images/icons/v4-series-clean/food-smile.png", color: "var(--color-peach)" },
  { key: "nature", title: "自然系列", label: "Nature Mood", iconSrc: "/images/icons/v4-series-clean/nature-sparkle.png", color: "var(--color-mint)" },
  { key: "studio", title: "工坊系列", label: "Studio Maker", iconSrc: "/images/icons/v4-series-clean/studio-block.png", color: "var(--color-sky)" },
];

const defaultValues = ["解压", "疗愈", "好玩", "好看", "可爱"];

function seriesKey(product: Product) {
  if (product.family) return product.family;
  if (product.category === "MagBlock" || product.category === "Modular System") return "studio";
  return "fruit";
}

function productValues(product: Product) {
  const badges = [...(product.badges ?? [])];
  if (product.sourceType) badges.unshift(product.sourceType);
  if (badges.length === 0) badges.push(...defaultValues.slice(0, 3));
  if (product.priceUSD === 0) badges.push("即将上架");
  return Array.from(new Set(badges)).slice(0, 4);
}

function groupProducts(products: Product[]) {
  const groups = new Map<string, Product[]>();
  for (const product of products) {
    const key = seriesKey(product);
    groups.set(key, [...(groups.get(key) ?? []), product]);
  }
  return seriesList.map((series) => [series, groups.get(series.key) ?? []] as const).filter(([, items]) => items.length > 0);
}

function ProductCard({ sku }: { sku: Product }) {
  const series = seriesList.find((item) => item.key === seriesKey(sku)) ?? seriesList[0];
  return (
    <Link key={sku.slug} href={`/shop/${sku.slug}`} className="group block">
      <div className="studio-card mb-4 overflow-hidden transition-transform group-hover:-translate-y-1">
        <div className="flex aspect-[4/3] items-center justify-center text-xs text-[color:var(--color-fg-muted)]">
          {sku.images && sku.images[0]?.startsWith("http") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sku.images[0]} alt={sku.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center" style={{ background: `linear-gradient(135deg, ${series.color}, #fffaf2)` }}>
              <div className="sticker-icon h-16 w-16 bg-white/70 text-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={series.iconSrc} alt="" className="h-14 w-14 object-contain" />
              </div>
              <span>[产品图准备中]</span>
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            {productValues(sku).map((badge) => (
              <span key={badge} className="pill-badge">
                {badge}
              </span>
            ))}
          </div>
          <p className="mb-1 font-mono text-xs uppercase tracking-widest text-[color:var(--color-fg-muted)]">
            {series.title}
          </p>
          <h3 className="mb-2 text-xl transition-colors group-hover:text-[color:var(--color-accent)]">
            {sku.name}
          </h3>
          <p className="mb-4 min-h-[2.8rem] text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
            {sku.shortDesc}
          </p>
          <p className="text-sm font-semibold">
            {sku.priceUSD ? `$${sku.priceUSD} USD` : "即将上架"}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function ShopPage() {
  const products = getAllProducts();
  const groups = groupProducts(products);

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-20">
      <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
        Shop
      </p>
      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-[1fr_0.8fr] md:items-end">
        <h1 className="font-display">按系列逛好玩小物。</h1>
        <p className="leading-relaxed text-[color:var(--color-fg-muted)]">
          分类不从功能出发，而从视觉和主题系列出发。一个商品可以同时是解压玩具、挂件、桌面小物；系列负责记忆点，选品维度负责质感。
        </p>
      </div>

      <div className="mb-12 flex flex-wrap gap-2">
        {defaultValues.map((value) => (
          <span key={value} className="pill-badge">
            {value}
          </span>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="text-[color:var(--color-fg-muted)]">暂无产品。</p>
      ) : (
        <div className="space-y-16">
          {groups.map(([series, items]) => (
            <section key={series.key}>
              <div className="mb-6 flex items-end justify-between gap-4 border-b border-[color:var(--color-border-subtle)] pb-4">
                <div className="flex items-center gap-4">
                  <div className="sticker-icon h-14 w-14 text-2xl" style={{ background: series.color }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={series.iconSrc} alt="" className="h-12 w-12 object-contain" />
                  </div>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-fg-muted)]">
                      {series.label}
                    </p>
                    <h2 className="mt-1 text-3xl">{series.title}</h2>
                  </div>
                </div>
                <span className="rounded-full bg-white/72 px-3 py-1 text-xs text-[color:var(--color-fg-muted)]">
                  {items.length} items
                </span>
              </div>
              <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((sku) => (
                  <ProductCard key={sku.slug} sku={sku} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
