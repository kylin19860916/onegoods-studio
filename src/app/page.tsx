import Link from "next/link";
import { getAllProducts, type Product } from "@/lib/content";

const collectionTiles = [
  {
    name: "Best Sellers",
    desc: "最适合先上架测款的解压小物。",
    href: "/shop",
    image: "/images/products/strawberry-button-fidget.png",
    color: "var(--color-peach)",
  },
  {
    name: "New Arrivals",
    desc: "刚加入首批测试的桌面小东西。",
    href: "/shop",
    image: "/images/products/onegoods-stress-relief-goods.png",
    color: "var(--color-butter)",
  },
  {
    name: "Desk Buddies",
    desc: "放在屏幕旁边，工作空档摸一下。",
    href: "/shop",
    image: "/images/products/mushroom-spinner-desk-buddy.png",
    color: "var(--color-mint)",
  },
  {
    name: "Mini Cases",
    desc: "带一点解压动作的小收纳。",
    href: "/shop",
    image: "/images/products/cloud-slide-mini-case.png",
    color: "var(--color-sky)",
  },
];

const shopShortcuts = ["按一下", "转一下", "推一下", "摆桌上", "送朋友"];

const tinyMoods = [
  {
    name: "草莓钮",
    role: "负责把紧绷按小一点",
    line: "手停不下来时，按它一下就好。",
    image: "/images/products/strawberry-button-fidget.png",
    href: "/shop/strawberry-button-fidget",
  },
  {
    name: "蘑菇转转",
    role: "负责陪你等灵感回来",
    line: "卡住的时候，转一圈再继续。",
    image: "/images/products/mushroom-spinner-desk-buddy.png",
    href: "/shop/mushroom-spinner-desk-buddy",
  },
  {
    name: "云朵盒",
    role: "负责收起一点小混乱",
    line: "把耳塞、戒指、小纸条都暂时放进去。",
    image: "/images/products/cloud-slide-mini-case.png",
    href: "/shop/cloud-slide-mini-case",
  },
];

const buyingNotes = [
  {
    title: "小批量 3D 打印",
    desc: "每批数量不大，商品页会写清楚状态、材质、尺寸和注意事项。",
  },
  {
    title: "先测三款",
    desc: "先用内容反馈和真实询问决定补色、补货和下一批上架顺序。",
  },
  {
    title: "购买入口在商品页",
    desc: "开放购买后，Shopee、小红书店或独立站按钮会放在对应商品详情里。",
  },
];

function statusLabel(status?: Product["salesStatus"]) {
  if (status === "listed") return "已上架";
  if (status === "sample-ready") return "样品完成";
  if (status === "sold-out") return "补货中";
  if (status === "idea") return "候选款";
  return "首批测试";
}

function sortedProducts() {
  return getAllProducts().filter((product) => product.salesStatus !== "idea").sort((a, b) => {
    if (a.salesStatus === "testing" && b.salesStatus !== "testing") return -1;
    if (a.salesStatus !== "testing" && b.salesStatus === "testing") return 1;
    return a.order - b.order;
  });
}

function priceText(product: Product) {
  return product.priceLabel ?? (product.priceUSD ? `$${product.priceUSD} USD` : "开放购买前通知");
}

function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const tags = [...(product.motion ?? []), ...(product.mood ?? [])].slice(0, featured ? 5 : 3);
  const image = product.images?.[0] ?? "/images/products/onegoods-stress-relief-goods.png";

  return (
    <Link
      href={`/shop/${product.slug}`}
      className={`group block overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1 ${featured ? "md:col-span-2" : ""}`}
    >
      <div className={featured ? "grid gap-0 md:grid-cols-[1.08fr_0.92fr]" : ""}>
        <div className={featured ? "aspect-[4/3] md:aspect-auto" : "aspect-[4/3]"}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col justify-between p-5 md:p-6">
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="pill-badge">{statusLabel(product.salesStatus)}</span>
              {tags.map((tag) => (
                <span key={tag} className="pill-badge">
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="mb-3 text-2xl transition-colors group-hover:text-[color:var(--color-accent)]">
              {product.name}
            </h3>
            <p className="leading-relaxed text-[color:var(--color-fg-muted)]">{product.shortDesc}</p>
          </div>
          <div className="mt-6 flex items-center justify-between gap-4 text-sm font-semibold">
            <span>{priceText(product)}</span>
            <span className="text-[color:var(--color-accent)]">查看商品</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ProductRow({ product }: { product: Product }) {
  const image = product.images?.[0] ?? "/images/products/onegoods-stress-relief-goods.png";

  return (
    <Link href={`/shop/${product.slug}`} className="group grid grid-cols-[88px_1fr] gap-4 rounded-[1.25rem] border border-[color:var(--color-border)] bg-white p-3 transition-transform hover:-translate-y-1">
      <div className="aspect-square overflow-hidden rounded-[1rem]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={product.name} className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-col justify-center">
        <p className="mb-1 text-sm font-semibold text-[color:var(--color-accent)]">{statusLabel(product.salesStatus)}</p>
        <h3 className="mb-2 text-xl group-hover:text-[color:var(--color-accent)]">{product.name}</h3>
        <p className="text-sm font-semibold">{priceText(product)}</p>
      </div>
    </Link>
  );
}

export default function Home() {
  const products = sortedProducts();
  const featuredProducts = products.slice(0, 3);
  const newArrivals = [...products].reverse().slice(0, 3);

  return (
    <>
      <div className="bg-[color:var(--color-bg-dark)] px-6 py-2 text-center text-sm font-semibold text-white">
        首批测试款准备上架中。订阅后开放购买、补货、上新会优先通知。
      </div>

      <section className="relative overflow-hidden">
        <div className="mx-auto grid min-h-[calc(100dvh-96px)] max-w-[1200px] grid-cols-1 items-center gap-10 px-6 py-14 lg:grid-cols-[0.76fr_1.24fr]">
          <div className="order-2 relative z-10 max-w-xl lg:order-none">
            <p className="mb-5 text-sm font-semibold text-[color:var(--color-accent)]">
              OneGoods Studio
            </p>
            <h1 className="font-display mb-6 text-[clamp(3rem,5.3vw,4.6rem)] leading-[1.03]">
              <span className="block whitespace-nowrap">Cute fidgets</span>
              <span className="block whitespace-nowrap">for tiny moods.</span>
            </h1>
            <p className="mb-8 max-w-[44ch] text-lg leading-relaxed text-[color:var(--color-fg-muted)]">
              解压 3D 打印小物。按一下、转一下、推一下，把桌面变可爱一点。
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/shop" className="primary-cta">
                Shop all
              </Link>
              <Link href="/contact" className="secondary-cta">
                上新提醒
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              {shopShortcuts.map((item) => (
                <Link key={item} href="/shop" className="pill-badge">
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div className="order-1 relative lg:order-none">
            <div className="absolute left-6 bottom-6 z-10 rounded-[1rem] bg-[color:var(--color-bg-dark)] px-5 py-4 text-white shadow-[var(--shadow-card)]">
              <p className="text-xs font-semibold text-white/60">首批主推</p>
              <p className="font-bold">草莓按压解压钮</p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/products/onegoods-stress-relief-goods.png"
              alt="草莓按压钮、蘑菇旋转摆件和云朵滑盖小物盒"
              className="product-photo aspect-[4/3] w-full"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="font-display mb-3">Best Sellers</h2>
            <p className="max-w-[56ch] leading-relaxed text-[color:var(--color-fg-muted)]">
              从最适合首批测试的几款开始。看图、看动作、看价格，喜欢就进商品页等开放购买。
            </p>
          </div>
          <Link href="/shop" className="secondary-cta self-start md:self-auto">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {featuredProducts.map((product, index) => (
            <ProductCard key={product.slug} product={product} featured={index === 0} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="mb-8">
          <h2 className="font-display mb-3">Shop by Collection</h2>
          <p className="max-w-[56ch] leading-relaxed text-[color:var(--color-fg-muted)]">
            按你想要的用途来逛：热卖款、新到款、桌面陪伴，或者带一点功能的小收纳。
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {collectionTiles.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1"
            >
              <div className="relative aspect-[4/3] overflow-hidden" style={{ background: item.color }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
              </div>
              <div className="p-5">
                <h3 className="mb-2 text-2xl group-hover:text-[color:var(--color-accent)]">{item.name}</h3>
                <p className="text-sm leading-relaxed text-[color:var(--color-fg-muted)]">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 px-6 py-16 lg:grid-cols-[0.82fr_1.18fr]">
        <div>
          <h2 className="font-display mb-4">New Arrivals</h2>
          <p className="mb-6 max-w-[52ch] leading-relaxed text-[color:var(--color-fg-muted)]">
            新加入测试的小物会先放在这里。每款都标清状态、动作和预计价格。
          </p>
          <Link href="/shop" className="primary-cta">
            Browse shop
          </Link>
        </div>
        <div className="grid gap-4">
          {newArrivals.map((product) => (
            <ProductRow key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="rounded-[2rem] border border-[color:var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)] md:p-10">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="font-display mb-3">Meet the tiny mood friends</h2>
              <p className="max-w-[60ch] leading-relaxed text-[color:var(--color-fg-muted)]">
                每个小物都有自己的小性格。先记住它，再把它放到桌上、包里或送给朋友。
              </p>
            </div>
            <Link href="/shop" className="secondary-cta self-start md:self-auto">
              Shop friends
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {tinyMoods.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group overflow-hidden rounded-[1.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] transition-transform hover:-translate-y-1"
              >
                <div className="aspect-[5/4] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
                </div>
                <div className="p-5">
                  <p className="mb-2 text-sm font-semibold text-[color:var(--color-accent)]">{item.role}</p>
                  <h3 className="mb-3 text-2xl">{item.name}</h3>
                  <p className="text-sm leading-relaxed text-[color:var(--color-fg-muted)]">{item.line}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {buyingNotes.map((item) => (
            <div key={item.title} className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white/78 p-6">
              <h3 className="mb-3 text-2xl">{item.title}</h3>
              <p className="leading-relaxed text-[color:var(--color-fg-muted)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
