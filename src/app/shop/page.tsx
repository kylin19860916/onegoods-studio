import Link from "next/link";
import { getAllProducts, type Product } from "@/lib/content";

export const metadata = {
  title: "Shop",
  description: "OneGoods Studio 解压 3D 打印小物",
};

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
  return Array.from(
    new Set([
      ...(product.motion ?? []),
      ...(product.mood ?? []),
      ...(product.badges ?? []),
    ]),
  ).slice(0, 5);
}

function ProductCard({ sku }: { sku: Product }) {
  const tags = productTags(sku);
  const status = statusLabels[sku.salesStatus ?? "testing"];
  const image = sku.images?.[0] ?? "/images/products/onegoods-stress-relief-goods.png";

  return (
    <Link href={`/shop/${sku.slug}`} className="group block">
      <div className="h-full overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white/78 shadow-[var(--shadow-card)] transition-transform group-hover:-translate-y-1">
        <div className="aspect-[4/3] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={sku.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        </div>
        <div className="p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="pill-badge">{status}</span>
            {tags.map((tag) => (
              <span key={tag} className="pill-badge">
                {tag}
              </span>
            ))}
          </div>
          <p className="mb-2 text-sm font-semibold text-[color:var(--color-accent)]">
            {familyLabel(sku)}
          </p>
          <h3 className="mb-3 text-2xl transition-colors group-hover:text-[color:var(--color-accent)]">
            {sku.name}
          </h3>
          <p className="mb-5 min-h-[4.5rem] leading-relaxed text-[color:var(--color-fg-muted)]">
            {sku.shortDesc}
          </p>
          <div className="flex items-center justify-between gap-4 border-t border-[color:var(--color-border-subtle)] pt-4 text-sm font-semibold">
            <span>{sku.priceUSD ? `$${sku.priceUSD} USD` : "价格准备中"}</span>
            <span className="text-[color:var(--color-accent)]">查看详情</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ShopPage() {
  const products = getAllProducts().sort((a, b) => {
    if (a.salesStatus === "testing" && b.salesStatus !== "testing") return -1;
    if (a.salesStatus !== "testing" && b.salesStatus === "testing") return 1;
    return a.order - b.order;
  });
  const motionTags = Array.from(new Set(products.flatMap((product) => product.motion ?? [])));
  const moodTags = Array.from(new Set(products.flatMap((product) => product.mood ?? [])));

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-20">
      <div className="mb-12 max-w-3xl">
        <p className="mb-5 text-sm font-semibold text-[color:var(--color-accent)]">Shop</p>
        <h1 className="font-display mb-6">选一个手边的小暂停。</h1>
        <p className="max-w-[66ch] text-lg leading-relaxed text-[color:var(--color-fg-muted)]">
          这里放的是 OneGoods 正在测试和准备上架的解压 3D 打印小物。先看手感和用途，再选择购买渠道或订阅上新提醒。
        </p>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <div className="soft-panel p-5">
          <p className="mb-3 font-semibold">按解压动作找</p>
          <div className="flex flex-wrap gap-2">
            {motionTags.map((value) => (
              <span key={value} className="pill-badge">
                {value}
              </span>
            ))}
          </div>
        </div>
        <div className="soft-panel p-5">
          <p className="mb-3 font-semibold">按情绪价值找</p>
          <div className="flex flex-wrap gap-2">
            {moodTags.map((value) => (
              <span key={value} className="pill-badge">
                {value}
              </span>
            ))}
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="soft-panel p-8">
          <h2 className="mb-3 text-3xl">商品正在准备中</h2>
          <p className="text-[color:var(--color-fg-muted)]">首批测试款上架后会出现在这里。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((sku) => (
            <ProductCard key={sku.slug} sku={sku} />
          ))}
        </div>
      )}
    </section>
  );
}
