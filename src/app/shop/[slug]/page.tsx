import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getAllProducts, type Product } from "@/lib/content";
import { MarkdownBody } from "@/components/MarkdownBody";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductImage } from "@/components/ProductImage";
import { PurchaseLinks } from "@/components/PurchaseLinks";

const SITE_URL = "https://onegoods.studio";

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
  const image = product.images?.[0] ?? "/images/products/onegoods-stress-relief-goods.png";
  return {
    title: product.name,
    description: product.shortDesc,
    openGraph: {
      title: product.name,
      description: product.shortDesc,
      images: [image.startsWith("http") ? image : `${SITE_URL}${image}`],
    },
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

function relatedProducts(product: Product) {
  const others = getAllProducts().filter(
    (p) => p.slug !== product.slug && p.salesStatus !== "idea",
  );
  return [
    ...others.filter((p) => p.category === product.category),
    ...others.filter((p) => p.category !== product.category),
  ].slice(0, 3);
}

// Product structured data for search results. Offers are intentionally only
// emitted for listed products with a real price — draft/testing SKUs must not
// look purchasable.
function productJsonLd(product: Product, images: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDesc,
    image: images.map((src) => (src.startsWith("http") ? src : `${SITE_URL}${src}`)),
    url: `${SITE_URL}/shop/${product.slug}`,
    brand: { "@type": "Brand", name: "OneGoods Studio" },
    ...(product.salesStatus === "listed" && product.priceUSD > 0
      ? {
          offers: {
            "@type": "Offer",
            price: product.priceUSD,
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/shop/${product.slug}`,
          },
        }
      : {}),
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

  const images = product.images?.length ? product.images : ["/images/products/onegoods-stress-relief-goods.png"];
  const related = relatedProducts(product);
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product, images)) }}
      />
      <Link
        href="/shop"
        className="mb-8 inline-block text-sm font-semibold text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-accent)]"
      >
        返回 Shop
      </Link>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <ProductGallery images={images} name={product.name} />

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
            {product.priceLabel ?? (product.priceUSD ? `$${product.priceUSD} USD` : "首批价格准备中")}
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
            <div className="rounded-[1.25rem] bg-white/72 p-4">
              <p className="mb-1 font-semibold">包装状态</p>
              <p className="text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                首批会先用保护包装出货，正式包装会跟随稳定款更新。
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

      {related.length > 0 && (
        <section className="mt-16">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <h2 className="text-3xl">还可以看看</h2>
            <Link
              href="/shop"
              className="text-sm font-semibold text-[color:var(--color-accent)] hover:underline"
            >
              看全部小物
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <Link key={item.slug} href={`/shop/${item.slug}`} className="group block">
                <div className="h-full overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white/78 shadow-[var(--shadow-card)] transition-transform group-hover:-translate-y-1">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <ProductImage
                      src={item.images?.[0] ?? "/images/products/onegoods-stress-relief-goods.png"}
                      alt={item.name}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                      className="transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-5">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="pill-badge">{statusLabel(item.salesStatus)}</span>
                      {(item.motion ?? []).slice(0, 2).map((tag) => (
                        <span key={tag} className="pill-badge">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="mb-2 text-xl transition-colors group-hover:text-[color:var(--color-accent)]">
                      {item.name}
                    </h3>
                    <p className="text-sm font-semibold">
                      {item.priceLabel ?? (item.priceUSD ? `$${item.priceUSD} USD` : "价格准备中")}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
