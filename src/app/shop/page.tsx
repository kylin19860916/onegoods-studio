import Link from "next/link";
import { getAllProducts, type Product } from "@/lib/content";

export const metadata = {
  title: "Shop",
  description: "OneGoods Studio · 解压 / 情绪价值 3D 打印小物",
};

const statusLabel: Record<string, string> = {
  idea: "选品池",
  testing: "测试中",
  "sample-ready": "已打样",
  listed: "已上架",
  "sold-out": "售罄",
  retired: "已下架",
};

function productValues(product: Product) {
  const badges = [product.salesStatus ? statusLabel[product.salesStatus] ?? product.salesStatus : undefined, ...(product.motion ?? []), ...(product.mood ?? []), ...(product.badges ?? [])].filter(Boolean) as string[];
  if (badges.length === 0) badges.push("解压", "3D 打印", "测试款");
  return Array.from(new Set(badges)).slice(0, 5);
}

function ProductCard({ sku }: { sku: Product }) {
  const values = productValues(sku);
  const channelCount = Object.values(sku.purchaseLinks ?? {}).filter(Boolean).length;
  return (
    <Link key={sku.slug} href={`/shop/${sku.slug}`} className="group block">
      <div className="studio-card mb-4 overflow-hidden transition-transform group-hover:-translate-y-1">
        <div className="flex aspect-[4/3] items-center justify-center text-xs text-[color:var(--color-fg-muted)]">
          {sku.images && sku.images[0]?.startsWith("http") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sku.images[0]} alt={sku.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center" style={{ background: "linear-gradient(135deg, var(--color-butter), var(--color-mint), #fffaf2)" }}>
              <div className="sticker-icon h-16 w-16 bg-white/70">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/icons/v4-clean/squishy-blob.png" alt="" className="h-14 w-14 object-contain" />
              </div>
              <span>实拍图准备中</span>
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            {values.map((badge) => (
              <span key={badge} className="pill-badge">
                {badge}
              </span>
            ))}
          </div>
          <p className="mb-1 font-mono text-xs uppercase tracking-widest text-[color:var(--color-fg-muted)]">
            {sku.category}
          </p>
          <h3 className="mb-2 text-xl transition-colors group-hover:text-[color:var(--color-accent)]">
            {sku.name}
          </h3>
          <p className="mb-4 min-h-[3.4rem] text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
            {sku.shortDesc}
          </p>
          <div className="flex items-center justify-between gap-4 text-sm font-semibold">
            <span>{sku.priceUSD ? `$${sku.priceUSD} USD` : "待定价"}</span>
            <span className="text-[color:var(--color-accent)]">{channelCount ? `${channelCount} 个购买入口` : "待上架"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ShopPage() {
  const products = getAllProducts();
  const sorted = [...products].sort((a, b) => {
    const aScore = a.contentScore ?? 0;
    const bScore = b.contentScore ?? 0;
    return bScore - aScore || a.order - b.order;
  });

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-20">
      <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
        Testing shelf
      </p>
      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-[1fr_0.8fr] md:items-end">
        <h1 className="font-display">本周解压小物选品池。</h1>
        <p className="leading-relaxed text-[color:var(--color-fg-muted)]">
          先从少量 3D 打印小物开始测试：解压感、可爱度、打印稳定度、内容好拍度、电商成交潜力。跑通后再放大爆款。
        </p>
      </div>

      <div className="mb-12 grid grid-cols-2 gap-3 md:grid-cols-5">
        {["捏", "转", "按", "挂", "摆桌上"].map((value) => (
          <span key={value} className="rounded-full border border-[color:var(--color-border)] bg-white/70 px-4 py-3 text-center text-sm font-semibold text-[color:var(--color-fg-muted)]">
            想{value}一下
          </span>
        ))}
      </div>

      {sorted.length === 0 ? (
        <p className="text-[color:var(--color-fg-muted)]">暂无产品。</p>
      ) : (
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((sku) => (
            <ProductCard key={sku.slug} sku={sku} />
          ))}
        </div>
      )}
    </section>
  );
}
