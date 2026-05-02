import Link from "next/link";
import { getAllProducts } from "@/lib/content";

export const metadata = {
  title: "Shop",
  description: "OneGoods Studio · 玩物工坊产品",
};

export default function ShopPage() {
  const products = getAllProducts();

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-accent)] mb-6">
        Shop
      </p>
      <h1 className="font-display mb-12">所有产品</h1>

      {products.length === 0 ? (
        <p className="text-[color:var(--color-fg-muted)]">暂无产品。</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((sku) => (
            <Link
              key={sku.slug}
              href={`/shop/${sku.slug}`}
              className="group block"
            >
              <div className="aspect-square bg-[color:var(--color-bg-elevated)] rounded-2xl border border-[color:var(--color-border)] mb-4 flex items-center justify-center text-[color:var(--color-fg-muted)] text-xs group-hover:border-[color:var(--color-accent)] transition-colors overflow-hidden">
                {sku.images && sku.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={sku.images[0]}
                    alt={sku.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>[产品图占位]</span>
                )}
              </div>
              <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-fg-muted)] mb-1">
                {sku.category}
              </p>
              <h3 className="text-lg mb-1 group-hover:text-[color:var(--color-accent)] transition-colors">
                {sku.name}
              </h3>
              <p className="text-sm text-[color:var(--color-fg-muted)]">
                {sku.priceUSD ? `$${sku.priceUSD}` : "TBD"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

