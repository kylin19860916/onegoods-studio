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

  const images = product.images?.length ? product.images : ["/images/products/onegoods-prototype-hero.webp"];
  const image = images[0];
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
    <article className="og-container py-10 md:py-16">
      <Link href="/shop" className="mb-6 inline-flex rounded-full bg-white/78 px-4 py-2 text-sm font-bold text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-coral)]">
        ← 返回商品
      </Link>

      <section className="og-panel overflow-hidden p-5 md:p-8 lg:p-10">
        <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div>
            <div className="relative overflow-hidden rounded-[28px] bg-white shadow-[var(--shadow-float)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={product.name} className="aspect-square h-full w-full object-cover" />
              <span className="og-sticker absolute left-4 top-4">GOOD CHOICE</span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {images.slice(0, 4).map((src, index) => (
                <div key={src} className="aspect-square overflow-hidden rounded-[18px] border border-[color:var(--color-border)] bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`${product.name} 图片 ${index + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="og-pill mb-5 text-[color:var(--color-coral)]">
              {familyLabel(product.family, product.category)}
            </span>
            <h1 className="mb-5 text-[clamp(3rem,5vw,5rem)] leading-[1.02]">{product.name}</h1>
            <div className="mb-6 flex flex-wrap gap-2">
              {tags.slice(0, 8).map((badge) => (
                <span key={badge} className="og-pill">
                  {badge}
                </span>
              ))}
            </div>

            <div className="mb-6 flex items-end gap-3">
              <p className="font-display text-4xl font-bold">
                {product.priceLabel ?? (product.priceUSD ? `$${product.priceUSD} USD` : "首批价格准备中")}
              </p>
              <span className="pb-1 text-sm font-bold text-[color:var(--color-coral)]">早鸟 / 测试款</span>
            </div>

            {product.shortDesc && (
              <p className="mb-8 max-w-[52ch] text-lg leading-relaxed text-[color:var(--color-fg-muted)]">
                {product.shortDesc}
              </p>
            )}

            <PurchaseLinks product={product} />

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                ["满额包邮", "正式开卖后按渠道规则执行。"],
                ["7 天观察", "测试款以页面说明为准。"],
                ["3 天内发货", "样品稳定后会更新预计发货。"],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-[18px] bg-white/72 p-4">
                  <p className="mb-1 font-bold">{title}</p>
                  <p className="text-xs leading-relaxed text-[color:var(--color-fg-muted)]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="og-card p-6 md:p-8">
          <h2 className="mb-5 text-3xl">商品信息</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {specs.map(([label, value]) => (
              <div key={label} className="rounded-[18px] bg-[color:var(--color-cream)] p-4">
                <p className="mb-1 text-sm font-bold text-[color:var(--color-fg-muted)]">{label}</p>
                <p className="font-bold">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {product.body && (
          <section className="og-card p-6 md:p-8">
            <MarkdownBody body={product.body} />
          </section>
        )}
      </section>

      <section className="mt-8 rounded-[28px] bg-[color:var(--color-dark)] p-6 text-[color:var(--color-fg-dark)] md:p-8">
        <h2 className="mb-4 text-3xl text-white">下单前请留意</h2>
        <div className="grid gap-4 text-sm leading-relaxed text-white/68 md:grid-cols-3">
          <p>3D 打印商品会有细微层纹、接缝或批次差异，这是制作特征。</p>
          <p>请避免高温、重摔和过度扭折。小零件不建议幼童单独使用。</p>
          <p>首批测试款会根据反馈调整颜色、手感、包装和上架渠道。</p>
        </div>
      </section>
    </article>
  );
}
