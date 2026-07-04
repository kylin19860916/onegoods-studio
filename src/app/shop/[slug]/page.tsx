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
  if (family === "fruit") return "水果造型";
  if (family === "food") return "食物造型";
  if (family === "nature") return "自然造型";
  if (family === "studio" || category === "MagBlock" || category === "Modular System") return "工坊候选";
  return category ?? "解压小物";
}

function statusLabel(status?: string) {
  if (status === "listed") return "已上架";
  if (status === "sample-ready") return "样品完成";
  if (status === "sold-out") return "补货中";
  if (status === "idea") return "候选款";
  if (status === "retired") return "已下架";
  return "首批测试";
}

function uniqueTags(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter(Boolean))) as string[];
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const image = product.images?.[0] ?? "/images/products/onegoods-stress-relief-goods.png";
  const tags = uniqueTags([
    statusLabel(product.salesStatus),
    ...(product.motion ?? []),
    ...(product.mood ?? []),
    product.sourceType,
    ...(product.badges ?? []),
  ]);

  const specs = [
    ["材质", product.materials],
    ["尺寸", product.dimensions],
    ["重量", product.weight],
    ["发货地", product.shipFrom],
    ["配送地区", product.shipTo?.join("、")],
  ].filter(([, value]) => Boolean(value));

  return (
    <article className="mx-auto max-w-[1200px] px-6 py-20">
      <Link
        href="/shop"
        className="mb-8 inline-block text-sm font-semibold text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-accent)]"
      >
        返回 Shop
      </Link>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-float)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={product.name} className="aspect-square h-full w-full object-cover" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {(product.motion ?? []).slice(0, 3).map((motion) => (
              <div key={motion} className="rounded-[1rem] border border-[color:var(--color-border)] bg-white/72 px-4 py-3 text-center text-sm font-semibold">
                {motion}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:pt-4">
          <p className="mb-4 text-sm font-semibold text-[color:var(--color-accent)]">
            {familyLabel(product.family, product.category)}
          </p>
          <h1 className="font-display mb-5">{product.name}</h1>
          <div className="mb-6 flex flex-wrap gap-2">
            {tags.slice(0, 8).map((badge) => (
              <span key={badge} className="pill-badge">
                {badge}
              </span>
            ))}
          </div>

          <p className="mb-6 text-2xl font-semibold">
            {product.priceUSD ? `$${product.priceUSD} USD` : "首批价格准备中"}
          </p>

          {product.shortDesc && (
            <p className="mb-8 text-lg leading-relaxed text-[color:var(--color-fg-muted)]">
              {product.shortDesc}
            </p>
          )}

          <PurchaseLinks product={product} />

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-[1.25rem] bg-[color:var(--color-accent-soft)] p-4">
              <p className="mb-1 font-semibold">适合放在哪里</p>
              <p className="text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                桌面、床头、包包旁边，或者作为小礼物。
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-white/72 p-4">
              <p className="mb-1 font-semibold">制作方式</p>
              <p className="text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                小批量 3D 打印，表面会有轻微层纹。
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="soft-panel p-6 md:p-8">
          <h2 className="mb-5 text-3xl">商品信息</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {specs.map(([label, value]) => (
              <div key={label} className="rounded-[1rem] bg-white/70 p-4">
                <p className="mb-1 text-sm font-semibold text-[color:var(--color-fg-muted)]">{label}</p>
                <p className="font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {product.body && (
          <section className="soft-panel p-6 md:p-8">
            <MarkdownBody body={product.body} />
          </section>
        )}
      </section>

      <section className="mt-10 rounded-[1.5rem] border border-[color:var(--color-border)] bg-white/68 p-6">
        <h2 className="mb-4 text-3xl">下单前请留意</h2>
        <div className="grid gap-4 leading-relaxed text-[color:var(--color-fg-muted)] md:grid-cols-3">
          <p>3D 打印商品会有细微层纹、接缝或批次差异，这是制作特征。</p>
          <p>请避免高温、重摔和过度扭折。小零件不建议幼童单独使用。</p>
          <p>首批测试款会根据反馈调整颜色、手感、包装和上架渠道。</p>
        </div>
      </section>
    </article>
  );
}
