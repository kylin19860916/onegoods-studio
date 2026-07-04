import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getAllProducts } from "@/lib/content";
import { MarkdownBody } from "@/components/MarkdownBody";
import { PurchaseLinks } from "@/components/PurchaseLinks";

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

function familyLabel(family?: string, category?: string) {
  if (family === "fruit") return "水果系列";
  if (family === "food") return "美食系列";
  if (family === "nature") return "自然系列";
  if (family === "studio" || category === "MagBlock" || category === "Modular System") return "工坊系列";
  return "水果系列";
}

function statusLabel(status?: string) {
  if (status === "listed") return "已上架";
  if (status === "sample-ready") return "样品完成";
  if (status === "sold-out") return "补货中";
  if (status === "idea") return "候选中";
  if (status === "retired") return "已下架";
  return "测试中";
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const badges = Array.from(
    new Set([
      statusLabel(product.salesStatus),
      ...(product.motion ?? []),
      ...(product.mood ?? []),
      product.sourceType,
      ...(product.badges ?? []),
    ].filter(Boolean)),
  ) as string[];

  return (
    <article className="mx-auto max-w-[1200px] px-6 py-20">
      <Link
        href="/shop"
        className="mb-8 inline-block text-sm text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-accent)]"
      >
        ← 返回 Shop
      </Link>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="studio-card flex aspect-square items-center justify-center overflow-hidden text-sm text-[color:var(--color-fg-muted)]">
          {product.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[linear-gradient(135deg,var(--color-butter),var(--color-mint),#fffaf2)] px-8 text-center">
              <span className="sticker-icon h-16 w-16 bg-white/78">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/icons/v4-clean/fidget-puck.png" alt="" className="h-12 w-12 object-contain" />
              </span>
              <span>产品主图准备中</span>
            </div>
          )}
        </div>

        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-[color:var(--color-fg-muted)]">
            {familyLabel(product.family, product.category)}
          </p>
          <h1 className="font-display mb-5">{product.name}</h1>
          <div className="mb-6 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span key={badge} className="pill-badge">
                {badge}
              </span>
            ))}
          </div>
          <p className="mb-8 text-2xl">
            {product.priceUSD ? `$${product.priceUSD} USD` : "价格测试中"}
          </p>

          {product.shortDesc && (
            <p className="mb-8 text-lg leading-relaxed text-[color:var(--color-fg-muted)]">
              {product.shortDesc}
            </p>
          )}

          <PurchaseLinks product={product} />

          <div className="mt-12 space-y-4 text-sm">
            {product.sourceType && (
              <div className="flex justify-between gap-6 border-t border-[color:var(--color-border-subtle)] pt-4">
                <span className="text-[color:var(--color-fg-muted)]">商品来源</span>
                <span className="text-right">{product.sourceType}</span>
              </div>
            )}
            {product.materials && (
              <div className="flex justify-between gap-6 border-t border-[color:var(--color-border-subtle)] pt-4">
                <span className="text-[color:var(--color-fg-muted)]">材质</span>
                <span className="text-right">{product.materials}</span>
              </div>
            )}
            {product.dimensions && (
              <div className="flex justify-between gap-6 border-t border-[color:var(--color-border-subtle)] pt-4">
                <span className="text-[color:var(--color-fg-muted)]">尺寸</span>
                <span className="text-right">{product.dimensions}</span>
              </div>
            )}
            {product.shipFrom && (
              <div className="flex justify-between gap-6 border-t border-[color:var(--color-border-subtle)] pt-4">
                <span className="text-[color:var(--color-fg-muted)]">发货地</span>
                <span>{product.shipFrom}</span>
              </div>
            )}
            {product.shipTo && (
              <div className="flex justify-between gap-6 border-t border-[color:var(--color-border-subtle)] pt-4">
                <span className="text-[color:var(--color-fg-muted)]">配送地区</span>
                <span className="text-right">{product.shipTo.join(" · ")}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {product.body && (
        <section className="mx-auto mt-16 max-w-[820px] rounded-[2rem] border border-[color:var(--color-border)] bg-white/70 p-6 md:p-10">
          <MarkdownBody body={product.body} />
        </section>
      )}
    </article>
  );
}
