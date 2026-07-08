import Link from "next/link";
import { getAllProducts, type Product } from "@/lib/content";

// Curated homepage copy keyed by slug; products missing from this map fall
// back to their MDX frontmatter so renamed/unpublished SKUs never break links.
const personalities: Record<string, { role: string; line: string }> = {
  "strawberry-button-fidget": {
    role: "负责把紧绷按小一点",
    line: "手停不下来时，按它一下就好。",
  },
  "mushroom-spinner-desk-buddy": {
    role: "负责陪你等灵感回来",
    line: "卡住的时候，转一圈再继续。",
  },
  "cloud-slide-mini-case": {
    role: "负责收起一点小混乱",
    line: "把耳塞、戒指、小纸条都暂时放进去。",
  },
};

const motionCopy: Record<string, string> = {
  按一下: "紧绷的时候，给手一个轻轻的出口。",
  转一下: "卡住的时候，转一圈再继续。",
  推一下: "带一点解压动作的小收纳。",
  摆桌上: "放在屏幕旁边，工作空档看一眼。",
};

const motionTones = [
  "var(--color-peach)",
  "var(--color-butter)",
  "var(--color-mint)",
  "var(--color-sky)",
  "var(--color-lavender)",
];

const channels = [
  {
    name: "Shopee 虾皮",
    desc: "台湾与东南亚下单主渠道，负责物流和售后。",
  },
  {
    name: "小红书店",
    desc: "看内容种草，直接在小红书里下单。",
  },
  {
    name: "Instagram",
    desc: "海外实拍、Reels 和上新动态。",
  },
  {
    name: "独立站直购",
    desc: "本站直接结账，正在准备中。",
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

const FALLBACK_IMAGE = "/images/products/onegoods-stress-relief-goods.png";

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

function productImage(product: Product) {
  return product.images?.[0] ?? FALLBACK_IMAGE;
}

function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const tags = [...(product.motion ?? []), ...(product.mood ?? [])].slice(0, featured ? 5 : 3);

  return (
    <Link
      href={`/shop/${product.slug}`}
      className={`group block overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1 ${featured ? "md:col-span-2" : ""}`}
    >
      <div className={featured ? "grid gap-0 md:grid-cols-[1.08fr_0.92fr]" : ""}>
        <div className={featured ? "aspect-[4/3] md:aspect-auto" : "aspect-[4/3]"}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={productImage(product)} alt={product.name} className="h-full w-full object-cover" />
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

export default function Home() {
  const products = sortedProducts();
  const featuredProducts = products.slice(0, 3);
  const heroProduct = featuredProducts[0];
  const motionTags = Array.from(new Set(products.flatMap((product) => product.motion ?? [])));
  const moodFriends = featuredProducts.map((product) => ({
    product,
    role: personalities[product.slug]?.role ?? (product.mood?.[0] ? `负责${product.mood[0]}` : "桌面小陪伴"),
    line: personalities[product.slug]?.line ?? product.shortDesc,
  }));

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
              {motionTags.map((item) => (
                <Link
                  key={item}
                  href={{ pathname: "/shop", query: { tag: item }, hash: "products" }}
                  className="pill-badge transition-colors hover:!border-[color:var(--color-accent)] hover:!text-[color:var(--color-accent)]"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div className="order-1 relative lg:order-none">
            {heroProduct && (
              <Link
                href={`/shop/${heroProduct.slug}`}
                className="absolute left-6 bottom-6 z-10 rounded-[1rem] bg-[color:var(--color-bg-dark)] px-5 py-4 text-white shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
              >
                <p className="text-xs font-semibold text-white/60">首批主推 · {statusLabel(heroProduct.salesStatus)}</p>
                <p className="font-bold">{heroProduct.name}</p>
              </Link>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={FALLBACK_IMAGE}
              alt="草莓按压钮、蘑菇旋转摆件和云朵滑盖小物盒"
              className="product-photo aspect-[4/3] w-full"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="font-display mb-3">首批小物</h2>
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
          <h2 className="font-display mb-3">想怎么解压？</h2>
          <p className="max-w-[56ch] leading-relaxed text-[color:var(--color-fg-muted)]">
            按你想要的动作来逛：按一下、转一下、推一下，或者单纯摆在桌上看着。
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {motionTags.map((motion, index) => {
            const sample = products.find((product) => product.motion?.includes(motion));
            return (
              <Link
                key={motion}
                href={{ pathname: "/shop", query: { tag: motion }, hash: "products" }}
                className="group overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1"
              >
                <div
                  className="relative aspect-[4/3] overflow-hidden"
                  style={{ background: motionTones[index % motionTones.length] }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sample ? productImage(sample) : FALLBACK_IMAGE}
                    alt={motion}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="p-5">
                  <h3 className="mb-2 text-2xl group-hover:text-[color:var(--color-accent)]">{motion}</h3>
                  <p className="text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                    {motionCopy[motion] ?? "进 Shop 看有这个动作的小物。"}
                  </p>
                </div>
              </Link>
            );
          })}
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
            {moodFriends.map(({ product, role, line }) => (
              <Link
                key={product.slug}
                href={`/shop/${product.slug}`}
                className="group overflow-hidden rounded-[1.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] transition-transform hover:-translate-y-1"
              >
                <div className="aspect-[5/4] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={productImage(product)} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
                </div>
                <div className="p-5">
                  <p className="mb-2 text-sm font-semibold text-[color:var(--color-accent)]">{role}</p>
                  <h3 className="mb-3 text-2xl">{product.name}</h3>
                  <p className="text-sm leading-relaxed text-[color:var(--color-fg-muted)]">{line}</p>
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

      <section className="mx-auto max-w-[1200px] px-6 pb-20">
        <div className="dark-panel relative overflow-hidden rounded-[2rem] p-6 md:p-10">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="font-display mb-3">去哪里买</h2>
              <p className="max-w-[60ch] leading-relaxed text-white/70">
                首批开放购买后，每个商品页会放上对应渠道的购买按钮。现在可以先订阅，开放时第一时间通知你。
              </p>
            </div>
            <Link href="/contact" className="primary-cta self-start md:self-auto">
              开放购买前通知
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {channels.map((channel) => (
              <div key={channel.name} className="rounded-[1.25rem] border border-white/12 bg-white/6 p-5">
                <p className="mb-2 font-display text-lg">{channel.name}</p>
                <p className="text-sm leading-relaxed text-white/70">{channel.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
