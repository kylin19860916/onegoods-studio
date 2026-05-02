import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getAllProducts } from "@/lib/content";
import { CheckoutButton } from "@/components/CheckoutButton";

export async function generateStaticParams() {
  return getAllProducts({ includeDraft: true }).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.shortDesc,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  return (
    <article className="mx-auto max-w-[1200px] px-6 py-24">
      <Link
        href="/shop"
        className="text-sm text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-accent)] transition-colors mb-8 inline-block"
      >
        ← 返回 Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image gallery */}
        <div className="aspect-square bg-[color:var(--color-bg-elevated)] rounded-2xl border border-[color:var(--color-border)] flex items-center justify-center text-sm text-[color:var(--color-fg-muted)] overflow-hidden">
          {product.images && product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>[产品主图 — 等真实产品照]</span>
          )}
        </div>

        {/* Product info */}
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-fg-muted)] mb-3">
            {product.category}
          </p>
          <h1 className="font-display mb-6">{product.name}</h1>
          <p className="text-2xl mb-8">
            {product.priceUSD ? `$${product.priceUSD} USD` : "TBD"}
          </p>

          {product.shortDesc && (
            <p className="text-[color:var(--color-fg-muted)] leading-relaxed mb-8">
              {product.shortDesc}
            </p>
          )}

          <CheckoutButton slug={product.slug} priceUSD={product.priceUSD} name={product.name} />

          <div className="mt-12 space-y-4 text-sm">
            {product.materials && (
              <div className="flex justify-between border-t border-[color:var(--color-border-subtle)] pt-4">
                <span className="text-[color:var(--color-fg-muted)]">材质</span>
                <span>{product.materials}</span>
              </div>
            )}
            {product.dimensions && (
              <div className="flex justify-between border-t border-[color:var(--color-border-subtle)] pt-4">
                <span className="text-[color:var(--color-fg-muted)]">尺寸</span>
                <span>{product.dimensions}</span>
              </div>
            )}
            {product.shipFrom && (
              <div className="flex justify-between border-t border-[color:var(--color-border-subtle)] pt-4">
                <span className="text-[color:var(--color-fg-muted)]">发货地</span>
                <span>{product.shipFrom}</span>
              </div>
            )}
            {product.shipTo && (
              <div className="flex justify-between border-t border-[color:var(--color-border-subtle)] pt-4">
                <span className="text-[color:var(--color-fg-muted)]">配送地区</span>
                <span>{product.shipTo.join(" · ")}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

