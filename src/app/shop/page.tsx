import Link from "next/link";

export const metadata = {
  title: "Shop",
  description: "OneGoods Studio · 玩物工坊产品",
};

// 临时 SKU 占位——等 PRD §8 SKU 列表 finalize 后改成数据驱动
const placeholderSkus = [
  { slug: "magblock-starter-kit", name: "MagBlock Starter Kit", category: "Modular System", price: "TBD" },
  { slug: "magblock-hub-module", name: "Magnetic Hub Module", category: "MagBlock", price: "TBD" },
  { slug: "magblock-cable-organizer", name: "Cable Organizer", category: "Desktop", price: "TBD" },
  { slug: "magblock-pen-holder", name: "Magnetic Pen Holder", category: "Desktop", price: "TBD" },
  { slug: "magblock-monitor-stand", name: "Modular Monitor Stand", category: "Desktop", price: "TBD" },
  { slug: "magblock-phone-dock", name: "Phone Dock + Charging", category: "MagBlock", price: "TBD" },
];

export default function ShopPage() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-accent)] mb-6">
        Shop
      </p>
      <h1 className="font-display mb-12">所有产品</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {placeholderSkus.map((sku) => (
          <Link
            key={sku.slug}
            href={`/shop/${sku.slug}`}
            className="group block"
          >
            <div className="aspect-square bg-[color:var(--color-bg-elevated)] rounded-2xl border border-[color:var(--color-border)] mb-4 flex items-center justify-center text-[color:var(--color-fg-muted)] text-xs group-hover:border-[color:var(--color-accent)] transition-colors">
              [产品图占位]
            </div>
            <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-fg-muted)] mb-1">
              {sku.category}
            </p>
            <h3 className="text-lg mb-1 group-hover:text-[color:var(--color-accent)] transition-colors">
              {sku.name}
            </h3>
            <p className="text-sm text-[color:var(--color-fg-muted)]">{sku.price}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

