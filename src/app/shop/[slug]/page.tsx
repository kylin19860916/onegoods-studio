import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getAllProducts } from "@/lib/content";
import { MarkdownBody } from "@/components/MarkdownBody";
import { PurchaseLinks } from "@/components/PurchaseLinks";
import { Price, T } from "@/components/i18n/I18nProvider";
import { FlaskIcon, PrinterIcon } from "@/components/icons/Icons";
import type { TranslationKey } from "@/lib/i18n";

export async function generateStaticParams() {
  return getAllProducts({ includeDraft: true }).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return { title: product.name, description: product.shortDesc };
}

function familyKey(family?: string, category?: string): TranslationKey {
  if (family === "fruit") return "family.fruit";
  if (family === "food") return "family.food";
  if (family === "nature") return "family.nature";
  if (family === "studio" || category === "MagBlock" || category === "Modular System") return "family.studio";
  return "family.default";
}

function statusKey(status?: string): TranslationKey {
  if (status === "listed") return "status.listed";
  if (status === "sample-ready") return "status.sample";
  if (status === "sold-out") return "status.soldout";
  if (status === "idea") return "status.idea";
  if (status === "retired") return "status.retired";
  return "status.testing";
}

function uniqueTags(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter(Boolean))) as string[];
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const images = product.images?.length ? product.images : ["/images/products/onegoods-prototype-hero.webp"];
  const image = images[0];
  const tags = uniqueTags([...(product.motion ?? []), ...(product.mood ?? []), product.sourceType, ...(product.badges ?? [])]);

  const rawSpecs: { label: TranslationKey; value?: string }[] = [
    { label: "detail.materials", value: product.materials },
    { label: "detail.dimensions", value: product.dimensions },
    { label: "detail.weight", value: product.weight },
    { label: "detail.shipFrom", value: product.shipFrom },
    { label: "detail.shipTo", value: product.shipTo?.join("、") },
  ];
  const specs = rawSpecs.filter((item) => Boolean(item.value));

  const serviceCards: { title: TranslationKey; desc: TranslationKey }[] = [
    { title: "detail.card.shipping", desc: "detail.card.shippingDesc" },
    { title: "detail.card.observe", desc: "detail.card.observeDesc" },
    { title: "detail.card.dispatch", desc: "detail.card.dispatchDesc" },
  ];

  return (
    <article className="og-container py-10 md:py-16">
      <Link href="/shop" className="mb-6 inline-flex rounded-full bg-white/78 px-4 py-2 text-sm font-bold text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-coral)]">
        <T k="detail.back" />
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
                  <img src={src} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="og-pill mb-5 text-[color:var(--color-coral)]"><T k={familyKey(product.family, product.category)} /></span>
            <h1 className="mb-5 text-[clamp(3rem,5vw,5rem)] leading-[1.02]">{product.name}</h1>
            <div className="mb-6 flex flex-wrap gap-2">
              <span className="og-pill"><T k={statusKey(product.salesStatus)} /></span>
              {tags.slice(0, 7).map((badge) => <span key={badge} className="og-pill">{badge}</span>)}
            </div>

            <div className="mb-6 flex items-end gap-3">
              <p className="font-display text-4xl font-bold"><Price priceUSD={product.priceUSD} fallbackKey="price.detailPending" /></p>
              <span className="pb-1 text-sm font-bold text-[color:var(--color-coral)]"><T k="price.note" /></span>
            </div>

            {product.shortDesc && <p className="mb-8 max-w-[52ch] text-lg leading-relaxed text-[color:var(--color-fg-muted)]">{product.shortDesc}</p>}

            <PurchaseLinks product={product} />

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {serviceCards.map((card) => (
                <div key={card.title} className="rounded-[18px] bg-white/72 p-4">
                  <p className="mb-1 font-bold"><T k={card.title} /></p>
                  <p className="text-xs leading-relaxed text-[color:var(--color-fg-muted)]"><T k={card.desc} /></p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="og-card p-6 md:p-8">
          <h2 className="mb-5 text-3xl"><T k="detail.specs" /></h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {specs.map((item) => (
              <div key={item.label} className="rounded-[18px] bg-[color:var(--color-cream)] p-4">
                <p className="mb-1 text-sm font-bold text-[color:var(--color-fg-muted)]"><T k={item.label} /></p>
                <p className="font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {product.body && <section className="og-card p-6 md:p-8"><MarkdownBody body={product.body} /></section>}
      </section>

      <section className="mt-8 rounded-[28px] bg-[color:var(--color-dark)] p-6 text-[color:var(--color-fg-dark)] md:p-8">
        <h2 className="mb-4 flex items-center gap-3 text-3xl text-white"><PrinterIcon className="h-7 w-7 text-[color:var(--color-butter)]" /><T k="detail.beforeTitle" /></h2>
        <div className="grid gap-4 text-sm leading-relaxed text-white/68 md:grid-cols-3">
          <p><T k="detail.before1" /></p>
          <p><T k="detail.before2" /></p>
          <p><FlaskIcon className="mb-2 h-5 w-5 text-[color:var(--color-butter)]" /><T k="detail.before3" /></p>
        </div>
      </section>
    </article>
  );
}
