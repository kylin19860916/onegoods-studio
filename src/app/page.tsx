import Link from "next/link";
import { getAllProducts, type Product } from "@/lib/content";
import { Price, T } from "@/components/i18n/I18nProvider";
import { ArrowIcon, DeskIcon, FlaskIcon, GiftIcon, HeartIcon, PressIcon, PrinterIcon, PushIcon, SpinIcon } from "@/components/icons/Icons";
import type { TranslationKey } from "@/lib/i18n";

const categoryTiles: { title: TranslationKey; sub: TranslationKey; href: string; tone: string; mark: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { title: "cat.press.title", sub: "cat.press.sub", href: "/shop#products", tone: "var(--color-mint)", mark: "press", icon: PressIcon },
  { title: "cat.clip.title", sub: "cat.clip.sub", href: "/shop#products", tone: "var(--color-cream-deep)", mark: "clip", icon: GiftIcon },
  { title: "cat.desk.title", sub: "cat.desk.sub", href: "/shop#products", tone: "var(--color-sky)", mark: "desk", icon: DeskIcon },
  { title: "cat.drop.title", sub: "cat.drop.sub", href: "/shop#products", tone: "var(--color-lavender)", mark: "drop", icon: FlaskIcon },
];

const valueItems: { title: TranslationKey; sub: TranslationKey; icon: React.ComponentType<{ className?: string }> }[] = [
  { title: "home.value.print.title", sub: "home.value.print.sub", icon: PrinterIcon },
  { title: "home.value.iterate.title", sub: "home.value.iterate.sub", icon: FlaskIcon },
  { title: "home.value.buy.title", sub: "home.value.buy.sub", icon: BagLikeIcon },
];

const moodFriends: { name: TranslationKey; role: TranslationKey; href: string; image: string }[] = [
  { name: "friend.strawberry.name", role: "friend.strawberry.role", href: "/shop/strawberry-button-fidget", image: "/images/products/strawberry-button-fidget.png" },
  { name: "friend.mushroom.name", role: "friend.mushroom.role", href: "/shop/mushroom-spinner-desk-buddy", image: "/images/products/mushroom-spinner-desk-buddy.png" },
  { name: "friend.cloud.name", role: "friend.cloud.role", href: "/shop/cloud-slide-mini-case", image: "/images/products/cloud-slide-mini-case.png" },
];

function BagLikeIcon(props: { className?: string }) {
  return <GiftIcon {...props} />;
}

function statusKey(status?: Product["salesStatus"]): TranslationKey {
  if (status === "listed") return "status.listed";
  if (status === "sample-ready") return "status.sample";
  if (status === "sold-out") return "status.soldout";
  if (status === "idea") return "status.idea";
  if (status === "retired") return "status.retired";
  return "status.testing";
}

function sortedProducts() {
  return getAllProducts()
    .filter((product) => product.salesStatus !== "idea")
    .sort((a, b) => {
      if (a.salesStatus === "testing" && b.salesStatus !== "testing") return -1;
      if (a.salesStatus !== "testing" && b.salesStatus === "testing") return 1;
      return a.order - b.order;
    });
}

function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0] ?? "/images/products/onegoods-prototype-hero.webp";
  const colors = ["#EF6A55", "#FFD86B", "#A7E6C6"].slice(0, 3);

  return (
    <Link href={`/shop/${product.slug}`} className="group og-card og-hover-lift block p-3">
      <div className="relative aspect-square overflow-hidden rounded-[18px] bg-[color:var(--color-cream)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-[color:var(--color-coral)] shadow-sm">
          <T k={statusKey(product.salesStatus)} />
        </span>
        <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[color:var(--color-fg-soft)] shadow-sm">
          <HeartIcon className="h-4 w-4" />
        </span>
      </div>
      <div className="px-2 pb-2 pt-4">
        <div className="mb-3 flex gap-1.5">
          {colors.map((color) => <span key={color} className="og-color-dot" style={{ background: color }} />)}
        </div>
        <h3 className="mb-1 text-lg tracking-[-0.01em] transition-colors group-hover:text-[color:var(--color-coral)]">{product.name}</h3>
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[color:var(--color-fg-soft)]">{product.shortDesc}</p>
        <div className="flex items-center justify-between gap-3">
          <span className="font-display text-xl font-bold"><Price priceUSD={product.priceUSD} /></span>
          <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[color:var(--color-coral)] text-white transition-colors group-hover:bg-[color:var(--color-coral-deep)]">
            <ArrowIcon className="h-5 w-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const products = sortedProducts();
  const featured = products.slice(0, 4);

  return (
    <>
      <section className="og-container py-8 md:py-10">
        <div className="og-panel relative overflow-hidden p-6 md:p-12 lg:p-14">
          <div className="grid items-center gap-9 lg:grid-cols-[0.96fr_1.04fr]">
            <div className="relative z-10">
              <span className="og-pill mb-5 text-[color:var(--color-coral)]"><T k="home.badge" /></span>
              <h1 className="mb-5 max-w-[10ch] text-[clamp(3.3rem,7vw,5.7rem)] leading-[1.02]">
                Play more.<br />Carry joy.<br /><span className="text-[color:var(--color-coral)]">Make it yours.</span>
              </h1>
              <p className="mb-2 inline-block -rotate-2 font-display text-2xl font-bold text-[color:var(--color-coral)] md:text-3xl"><T k="home.heroAccent" /></p>
              <p className="mt-4 max-w-[42ch] text-base leading-relaxed text-[color:var(--color-fg-muted)] md:text-lg"><T k="home.heroBody" /></p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/shop" className="primary-cta"><T k="home.primary" /></Link>
                <Link href="/brand-story" className="secondary-cta"><T k="home.secondary" /></Link>
              </div>
              <div className="mt-7 flex gap-2">
                {[{ k: "tag.press", Icon: PressIcon }, { k: "tag.spin", Icon: SpinIcon }, { k: "tag.relax", Icon: PushIcon }].map(({ k, Icon }) => (
                  <span key={k} className="og-pill inline-flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" /><T k={k as TranslationKey} /></span>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="og-floaty relative aspect-square overflow-hidden rounded-[28px] bg-white shadow-[var(--shadow-float)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/products/onegoods-stress-relief-goods.png" alt="OneGoods Studio goods" className="h-full w-full object-cover" />
              </div>
              <span className="og-sticker absolute -left-2 -top-3 md:-left-4"><T k="home.goodChoice" /></span>
              <span className="absolute -right-2 bottom-5 rounded-[18px] bg-white px-4 py-3 text-sm shadow-[0_10px_24px_rgba(43,43,43,.14)] md:-right-4">
                <b className="font-display text-xl"><Price priceUSD={8.75} /></b><span className="text-[color:var(--color-fg-soft)]"> <T k="home.priceFrom" /></span><br />
                <span className="text-xs text-[color:var(--color-fg-muted)]"><T k="home.heroProduct" /></span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="og-container py-10">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div><h2 className="mb-2 text-3xl md:text-4xl"><T k="home.byMood" /></h2><p className="text-[color:var(--color-fg-soft)]"><T k="home.byMoodSub" /></p></div>
          <Link href="/shop" className="text-sm font-bold text-[color:var(--color-coral)] hover:text-[color:var(--color-coral-deep)]"><T k="home.viewAll" /></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categoryTiles.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.title} href={item.href} className="og-hover-lift relative min-h-[190px] overflow-hidden rounded-[24px] p-6" style={{ background: item.tone }}>
                <div className="flex items-center justify-between gap-3"><span className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--color-fg-muted)]">{item.mark}</span><Icon className="h-6 w-6 text-[color:var(--color-coral)]" /></div>
                <h3 className="mt-5 text-2xl"><T k={item.title} /></h3>
                <p className="mt-1 text-sm text-[color:var(--color-fg-muted)]"><T k={item.sub} /></p>
                <span className="absolute bottom-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-white"><ArrowIcon className="h-4 w-4" /></span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="og-container py-10">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div><h2 className="mb-2 text-3xl md:text-4xl"><T k="home.playing" /></h2><p className="text-[color:var(--color-fg-soft)]"><T k="home.playingSub" /></p></div>
          <Link href="/shop" className="text-sm font-bold text-[color:var(--color-coral)] hover:text-[color:var(--color-coral-deep)]"><T k="home.viewAll" /></Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{featured.map((product) => <ProductCard key={product.slug} product={product} />)}</div>
      </section>

      <section className="og-container py-10">
        <div className="dark-panel p-7 md:p-12"><div className="grid gap-8 md:grid-cols-3">
          {valueItems.map((item) => { const Icon = item.icon; return <div key={item.title}><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-[14px] bg-white/10 text-[color:var(--color-butter)]"><Icon className="h-5 w-5" /></div><h3 className="mb-3 text-2xl text-white"><T k={item.title} /></h3><p className="text-sm leading-relaxed text-white/68"><T k={item.sub} /></p></div>; })}
        </div></div>
      </section>

      <section className="og-container py-10 md:pb-20">
        <div className="mb-6"><h2 className="mb-2 text-3xl md:text-4xl"><T k="home.friends" /></h2><p className="max-w-[58ch] text-[color:var(--color-fg-soft)]"><T k="home.friendsSub" /></p></div>
        <div className="grid gap-5 md:grid-cols-3">
          {moodFriends.map((item) => (
            <Link key={item.name} href={item.href} className="og-card og-hover-lift overflow-hidden">
              <div className="aspect-[4/3] overflow-hidden bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt="OneGoods tiny mood friend" className="h-full w-full object-cover" />
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-2xl"><T k={item.name} /></h3>
                <p className="text-sm leading-relaxed text-[color:var(--color-fg-muted)]"><T k={item.role} /></p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
