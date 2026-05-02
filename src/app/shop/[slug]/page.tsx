import Link from "next/link";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <article className="mx-auto max-w-[1200px] px-6 py-24">
      <Link
        href="/shop"
        className="text-sm text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-accent)] transition-colors mb-8 inline-block"
      >
        ← 返回 Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image gallery placeholder */}
        <div className="aspect-square bg-[color:var(--color-bg-elevated)] rounded-2xl border border-[color:var(--color-border)] flex items-center justify-center text-sm text-[color:var(--color-fg-muted)]">
          [产品主图 — 等真实产品照]
        </div>

        {/* Product info */}
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-fg-muted)] mb-3">
            Slug: {slug}
          </p>
          <h1 className="font-display mb-6">[产品名称]</h1>
          <p className="text-2xl mb-8">¥ TBD</p>

          <p className="text-[color:var(--color-fg-muted)] leading-relaxed mb-8">
            [产品描述 — 等 PRD §8 finalize 后填入或从 CMS 拉取]
          </p>

          <button className="w-full px-6 py-4 bg-[color:var(--color-accent)] text-[color:var(--color-bg)] font-medium rounded-full hover:opacity-90 transition-opacity">
            加入购物车 (Stripe Checkout 接入)
          </button>

          <div className="mt-12 space-y-4 text-sm">
            <div className="flex justify-between border-t border-[color:var(--color-border-subtle)] pt-4">
              <span className="text-[color:var(--color-fg-muted)]">材质</span>
              <span>TBD</span>
            </div>
            <div className="flex justify-between border-t border-[color:var(--color-border-subtle)] pt-4">
              <span className="text-[color:var(--color-fg-muted)]">尺寸</span>
              <span>TBD</span>
            </div>
            <div className="flex justify-between border-t border-[color:var(--color-border-subtle)] pt-4">
              <span className="text-[color:var(--color-fg-muted)]">发货</span>
              <span>TBD</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

