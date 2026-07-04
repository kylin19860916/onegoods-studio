import Link from "next/link";
import { getAllProducts, type Product } from "@/lib/content";

export const metadata = {
  title: "Shop",
  description: "OneGoods Studio 解压 3D 打印小物",
};

const familyLabels: Record<string, string> = {
  fruit: "水果系列",
  food: "美食系列",
  nature: "自然系列",
  studio: "工坊系列",
};

const statusLabels: Record<NonNullable<Product["salesStatus"]>, string> = {
  idea: "候选中",
  testing: "测试中",
  "sample-ready": "样品完成",
  listed: "已上架",
  "sold-out": "补货中",
  retired: "已下架",
};

function familyLabel(product: Product) {
  if (product.family && familyLabels[product.family]) return familyLabels[product.family];
  if (product.category === "MagBlock" || product.category === "Modular System") return "工坊系列";
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

  return (
    <Link href={`/shop/${sku.slug}`} className="group block">
      <div className="studio-card h-full overflow-hidden transition-transform group-hover:-translate-y-1">
        <div className="flex aspect-[4/3] items-center justify-center text-xs text-[color:var(--color-fg-muted)]">
          {sku.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sku.images[0]} alt={sku.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[linear-gradient(135deg,var(--color-butter),var(--color-peach),#fffaf2)] px-6 text-center">
              <div className="sticker-icon h-16 w-16 bg-white/70">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/icons/v4-clean/squishy-blob.png" alt="" className="h-12 w-12 object-contain" />
              </div>
              <span>实拍素材准备中</span>
            </div>
          )}
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
          <p className="mb-1 font-mono text-xs uppercase tracking-widest text-[color:var(--color-fg-muted)]">
            {familyLabel(sku)}
          </p>
          <h3 className="mb-2 text-xl transition-colors group-hover:text-[color:var(--color-accent)]">
            {sku.name}
          </h3>
          <p className="mb-4 min-h-[3.4rem] text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
            {sku.shortDesc}
          </p>
          <p className="text-sm font-semibold">
            {sku.priceUSD ? `$${sku.priceUSD} USD` : "价格测试中"}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function ShopPage() {
  const products = getAllProducts();
  const motionTags = Array.from(new Set(products.flatMap((product) => product.motion ?? [])));
  const moodTags = Array.from(new Set(products.flatMap((product) => product.mood ?? [])));

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-20">
      <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
        Shop
      </p>
      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-[1fr_0.8fr] md:items-end">
        <h1 className="font-display">解压 3D 打印小物。</h1>
        <p className="leading-relaxed text-[color:var(--color-fg-muted)]">
          按手感和心情来逛：捏一下、转一下、摆桌上、送朋友。系列只是记忆点，真正决定是否上架的是手感、内容反馈和成交潜力。
        </p>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white/70 p-5">
          <p className="mb-3 text-sm font-semibold">解压方式</p>
          <div className="flex flex-wrap gap-2">
            {motionTags.map((value) => (
              <span key={value} className="pill-badge">
                {value}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white/70 p-5">
          <p className="mb-3 text-sm font-semibold">情绪价值</p>
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
        <p className="text-[color:var(--color-fg-muted)]">暂无产品。</p>
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
