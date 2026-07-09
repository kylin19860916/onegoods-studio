import Link from "next/link";
import { getAllProducts, type Product } from "@/lib/content";

const categoryTiles = [
  {
    title: "解压玩具",
    sub: "按一按 捏一捏",
    href: "/shop#products",
    tone: "var(--color-mint)",
    mark: "press",
  },
  {
    title: "包包挂饰",
    sub: "挂上就出街",
    href: "/shop#products",
    tone: "var(--color-cream-deep)",
    mark: "clip",
  },
  {
    title: "桌面小物",
    sub: "摆在屏幕旁",
    href: "/shop#products",
    tone: "var(--color-sky)",
    mark: "desk",
  },
  {
    title: "限定候选",
    sub: "小批量测试",
    href: "/shop#products",
    tone: "var(--color-lavender)",
    mark: "drop",
  },
];

const valueItems = [
  {
    title: "小批量 3D 打印",
    sub: "不先堆库存。先小批量打印、拍内容、看反馈，再决定下一批。",
  },
  {
    title: "颜色和手感会迭代",
    sub: "首批测试会根据真实反馈调整配色、按钮力度、尺寸和包装。",
  },
  {
    title: "购买入口放商品页",
    sub: "开放购买后，Shopee、小红书店、Instagram 或独立站按钮会在商品页出现。",
  },
];

const moodFriends = [
  {
    name: "草莓按压钮",
    role: "负责把紧绷按小一点",
    href: "/shop/strawberry-button-fidget",
    image: "/images/products/strawberry-button-fidget.png",
  },
  {
    name: "蘑菇转转",
    role: "负责陪你等灵感回来",
    href: "/shop/mushroom-spinner-desk-buddy",
    image: "/images/products/mushroom-spinner-desk-buddy.png",
  },
  {
    name: "云朵滑盖盒",
    role: "负责收起一点小混乱",
    href: "/shop/cloud-slide-mini-case",
    image: "/images/products/cloud-slide-mini-case.png",
  },
];

function statusLabel(status?: Product["salesStatus"]) {
  if (status === "listed") return "已上架";
  if (status === "sample-ready") return "样品完成";
  if (status === "sold-out") return "补货中";
  if (status === "idea") return "候选款";
  return "首批测试";
}

function priceText(product: Product) {
  return product.priceLabel ?? (product.priceUSD ? `$${product.priceUSD} USD` : "开放购买前通知");
}

function productTags(product: Product, limit = 3) {
  return Array.from(new Set([...(product.motion ?? []), ...(product.mood ?? []), ...(product.badges ?? [])])).slice(0, limit);
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
          {statusLabel(product.salesStatus)}
        </span>
        <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[color:var(--color-fg-soft)] shadow-sm">
          ♡
        </span>
      </div>
      <div className="px-2 pb-2 pt-4">
        <div className="mb-3 flex gap-1.5">
          {colors.map((color) => (
            <span key={color} className="og-color-dot" style={{ background: color }} />
          ))}
        </div>
        <h3 className="mb-1 text-lg tracking-[-0.01em] transition-colors group-hover:text-[color:var(--color-coral)]">
          {product.name}
        </h3>
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[color:var(--color-fg-soft)]">
          {product.shortDesc}
        </p>
        <div className="flex items-center justify-between gap-3">
          <span className="font-display text-xl font-bold">{priceText(product)}</span>
          <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[color:var(--color-coral)] text-xl font-bold text-white transition-colors group-hover:bg-[color:var(--color-coral-deep)]">
            +
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
              <span className="og-pill mb-5 text-[color:var(--color-coral)]">
                全部 3D 打印 · 小批量测试
              </span>
              <h1 className="mb-5 max-w-[10ch] text-[clamp(3.3rem,7vw,5.7rem)] leading-[1.02]">
                Play more.
                <br />
                Carry joy.
                <br />
                <span className="text-[color:var(--color-coral)]">Make it yours.</span>
              </h1>
              <p className="mb-2 inline-block -rotate-2 font-display text-2xl font-bold text-[color:var(--color-coral)] md:text-3xl">
                把日常小物，变得更好玩
              </p>
              <p className="mt-4 max-w-[42ch] text-base leading-relaxed text-[color:var(--color-fg-muted)] md:text-lg">
                口袋里的解压玩具、包上的小挂饰。每一件都从 3D 打印开始，慢慢长成有性格的小东西。
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/shop" className="primary-cta">
                  逛逛全部
                </Link>
                <Link href="/brand-story" className="secondary-cta">
                  怎么做出来的
                </Link>
              </div>
              <div className="mt-7 flex gap-2">
                {productTags(featured[0] ?? products[0] ?? ({} as Product), 3).map((tag) => (
                  <span key={tag} className="og-pill">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="og-floaty relative aspect-square overflow-hidden rounded-[28px] bg-white shadow-[var(--shadow-float)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/products/onegoods-stress-relief-goods.png"
                  alt="OneGoods Studio 解压小物组合"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="og-sticker absolute -left-2 -top-3 md:-left-4">
                GOOD CHOICE
              </span>
              <span className="absolute -right-2 bottom-5 rounded-[18px] bg-white px-4 py-3 text-sm shadow-[0_10px_24px_rgba(43,43,43,.14)] md:-right-4">
                <b className="font-display text-xl">NT$280</b>
                <span className="text-[color:var(--color-fg-soft)]"> 起</span>
                <br />
                <span className="text-xs text-[color:var(--color-fg-muted)]">草莓按压解压钮</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="og-container py-10">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h2 className="mb-2 text-3xl md:text-4xl">按心情挑</h2>
            <p className="text-[color:var(--color-fg-soft)]">四个小分类，总有一个对味。</p>
          </div>
          <Link href="/shop" className="text-sm font-bold text-[color:var(--color-coral)] hover:text-[color:var(--color-coral-deep)]">
            查看全部 →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categoryTiles.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="og-hover-lift relative min-h-[190px] overflow-hidden rounded-[24px] p-6"
              style={{ background: item.tone }}
            >
              <span className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--color-fg-muted)]">
                {item.mark}
              </span>
              <h3 className="mt-5 text-2xl">{item.title}</h3>
              <p className="mt-1 text-sm text-[color:var(--color-fg-muted)]">{item.sub}</p>
              <span className="absolute bottom-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="og-container py-10">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h2 className="mb-2 text-3xl md:text-4xl">这周大家都在玩</h2>
            <p className="text-[color:var(--color-fg-soft)]">小批量出品，售完就等下一批。</p>
          </div>
          <Link href="/shop" className="text-sm font-bold text-[color:var(--color-coral)] hover:text-[color:var(--color-coral-deep)]">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section className="og-container py-10">
        <div className="dark-panel p-7 md:p-12">
          <div className="grid gap-8 md:grid-cols-3">
            {valueItems.map((item) => (
              <div key={item.title}>
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-[14px] bg-white/10 text-[color:var(--color-butter)]">
                  +
                </div>
                <h3 className="mb-3 text-2xl text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-white/68">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="og-container py-10 md:pb-20">
        <div className="mb-6">
          <h2 className="mb-2 text-3xl md:text-4xl">Meet the tiny mood friends</h2>
          <p className="max-w-[58ch] text-[color:var(--color-fg-soft)]">
            每个小物都有自己的小性格。先记住它，再把它放到桌上、包里或送给朋友。
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {moodFriends.map((item) => (
            <Link key={item.name} href={item.href} className="og-card og-hover-lift overflow-hidden">
              <div className="aspect-[4/3] overflow-hidden bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-2xl">{item.name}</h3>
                <p className="text-sm leading-relaxed text-[color:var(--color-fg-muted)]">{item.role}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
