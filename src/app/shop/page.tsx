import Link from "next/link";
import { getAllProducts, type Product } from "@/lib/content";

export const metadata = {
  title: "Shop",
  description: "OneGoods Studio 解压 3D 打印小物",
};

const filters = ["全部", "解压玩具", "挂饰", "3D 打印", "限定"];

const familyLabels: Record<string, string> = {
  fruit: "水果造型",
  food: "食物造型",
  nature: "自然造型",
  studio: "工坊候选",
};

const statusLabels: Record<NonNullable<Product["salesStatus"]>, string> = {
  idea: "候选中",
  testing: "首批测试",
  "sample-ready": "样品完成",
  listed: "已上架",
  "sold-out": "补货中",
  retired: "已下架",
};

function familyLabel(product: Product) {
  if (product.family && familyLabels[product.family]) return familyLabels[product.family];
  return product.category;
}

function productTags(product: Product) {
  return Array.from(new Set([...(product.motion ?? []), ...(product.mood ?? []), ...(product.badges ?? [])])).slice(0, 4);
}

function priceText(product: Product) {
  return product.priceLabel ?? (product.priceUSD ? `$${product.priceUSD} USD` : "价格准备中");
}

function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0] ?? "/images/products/onegoods-prototype-hero.webp";
  const tags = productTags(product);

  return (
    <Link href={`/shop/${product.slug}`} className="group og-card og-hover-lift block p-3">
      <div className="relative aspect-square overflow-hidden rounded-[18px] bg-[color:var(--color-cream)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-[color:var(--color-coral)] shadow-sm">
          {statusLabels[product.salesStatus ?? "testing"]}
        </span>
      </div>
      <div className="px-2 pb-2 pt-4">
        <p className="mb-2 text-xs font-bold text-[color:var(--color-coral)]">{familyLabel(product)}</p>
        <h3 className="mb-2 text-xl transition-colors group-hover:text-[color:var(--color-coral)]">{product.name}</h3>
        <p className="mb-4 min-h-[3.5rem] text-sm leading-relaxed text-[color:var(--color-fg-muted)]">{product.shortDesc}</p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span key={tag} className="og-pill text-[0.68rem]">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="font-display text-xl font-bold">{priceText(product)}</span>
          <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[color:var(--color-coral)] text-lg font-bold text-white transition-colors group-hover:bg-[color:var(--color-coral-deep)]">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ShopPage() {
  const products = getAllProducts()
    .filter((product) => product.salesStatus !== "idea")
    .sort((a, b) => {
      if (a.salesStatus === "testing" && b.salesStatus !== "testing") return -1;
      if (a.salesStatus !== "testing" && b.salesStatus === "testing") return 1;
      return a.order - b.order;
    });

  return (
    <section className="og-container py-10 md:py-16">
      <div className="og-panel mb-8 overflow-hidden p-7 md:p-10">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <span className="og-pill mb-5 text-[color:var(--color-coral)]">全部商品</span>
            <h1 className="mb-5 max-w-[11ch] text-[clamp(3rem,6vw,5.5rem)] leading-[1.02]">
              Pick your tiny mood.
            </h1>
            <p className="max-w-[48ch] text-lg leading-relaxed text-[color:var(--color-fg-muted)]">
              解压玩具、包包挂饰、桌面小物。先从首批测试款开始，喜欢就进商品页等开放购买。
            </p>
          </div>
          <div className="rounded-[28px] bg-white/72 p-4 shadow-[var(--shadow-card)]">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:grid-cols-2">
              {filters.map((filter) => (
                <a key={filter} href="#products" className="rounded-full border border-[color:var(--color-border)] bg-white px-4 py-3 text-center text-sm font-bold transition-colors hover:border-[color:var(--color-coral)] hover:text-[color:var(--color-coral)]">
                  {filter}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h2 className="text-3xl md:text-4xl">这周大家都在玩</h2>
          <p className="mt-2 text-[color:var(--color-fg-soft)]">{products.length} 件小玩意。小批量测试中，正式购买入口会逐步开放。</p>
        </div>
        <span className="og-pill self-start">最热优先</span>
      </div>

      {products.length === 0 ? (
        <div className="soft-panel p-8">
          <h2 className="mb-3 text-3xl">商品正在准备中</h2>
          <p className="text-[color:var(--color-fg-muted)]">首批测试款上架后会出现在这里。</p>
        </div>
      ) : (
        <div id="products" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
