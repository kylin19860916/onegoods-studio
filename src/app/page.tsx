import Link from "next/link";
import { getAllProducts, type Product } from "@/lib/content";

const moodRoutes = [
  { label: "按一下", desc: "给手一个小暂停", color: "var(--color-butter)" },
  { label: "转一下", desc: "让注意力慢慢松开", color: "var(--color-mint)" },
  { label: "推一下", desc: "把小物收进云朵里", color: "var(--color-sky)" },
  { label: "摆桌上", desc: "陪你度过工作空档", color: "var(--color-peach)" },
  { label: "送朋友", desc: "轻巧、不贵、有心意", color: "var(--color-lavender)" },
];

const channels = [
  { name: "Shopee", desc: "台湾与东南亚订单优先走这里，方便付款、物流和评价。" },
  { name: "小红书店", desc: "看实拍内容、评论反馈和测试款开放购买。" },
  { name: "Instagram", desc: "海外内容入口，Reels 展示动作和手感。" },
  { name: "OneGoods.studio", desc: "品牌中枢，集中展示商品故事、系列和购买入口。" },
];

const reasons = [
  {
    title: "手感先行",
    desc: "我们先看一个小物是否真的想让人反复摸、按、转、推。",
  },
  {
    title: "小批量制作",
    desc: "每批数量不大，方便根据真实反馈快速调整颜色、结构和上架节奏。",
  },
  {
    title: "3D 打印纹理",
    desc: "轻微层纹是制作特征，也让每件小物带一点手作感。",
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
  return getAllProducts().sort((a, b) => {
    if (a.salesStatus === "testing" && b.salesStatus !== "testing") return -1;
    if (a.salesStatus !== "testing" && b.salesStatus === "testing") return 1;
    return a.order - b.order;
  });
}

function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const tags = [...(product.motion ?? []), ...(product.mood ?? [])].slice(0, featured ? 5 : 3);
  const image = product.images?.[0] ?? "/images/products/onegoods-stress-relief-goods.png";

  return (
    <Link
      href={`/shop/${product.slug}`}
      className={`group block overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white/78 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1 ${featured ? "md:col-span-2" : ""}`}
    >
      <div className={featured ? "grid gap-0 md:grid-cols-[1.05fr_0.95fr]" : ""}>
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
            <span>{product.priceUSD ? `$${product.priceUSD} USD` : "开放购买前通知"}</span>
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

  return (
    <>
      <section className="relative -mt-16 overflow-hidden pt-16">
        <div className="mx-auto grid min-h-[100dvh] max-w-[1200px] grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="relative z-10 max-w-xl">
            <p className="mb-5 text-sm font-semibold text-[color:var(--color-accent)]">
              OneGoods Studio
            </p>
            <h1 className="font-display mb-6 text-[clamp(3rem,5.3vw,4.6rem)] leading-[1.03]">
              <span className="block whitespace-nowrap">解压一点，</span>
              <span className="block whitespace-nowrap">日子可爱一点。</span>
            </h1>
            <p className="mb-8 max-w-[58ch] text-lg leading-relaxed text-[color:var(--color-fg-muted)]">
              小批量 3D 打印解压小物。适合桌面、包包、床头，也适合送给最近有点累的朋友。
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/shop" className="primary-cta">
                看首批小物
              </Link>
              <Link href="/contact" className="secondary-cta">
                订阅上新提醒
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-5 top-10 hidden rounded-full bg-[color:var(--color-butter)] px-5 py-3 text-sm font-bold shadow-[var(--shadow-card)] md:block">
              按、转、推，都算休息
            </div>
            <div className="absolute -right-2 bottom-10 hidden rounded-full bg-white px-5 py-3 text-sm font-bold shadow-[var(--shadow-card)] md:block">
              3D printed in small batches
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

      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="mb-8 max-w-2xl">
          <h2 className="font-display mb-4">先从这几款开始。</h2>
          <p className="leading-relaxed text-[color:var(--color-fg-muted)]">
            首批只放少量款式。我们会根据内容反馈、询问量和实际成交，决定哪些继续补色、补货或重做结构。
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {featuredProducts.map((product, index) => (
            <ProductCard key={product.slug} product={product} featured={index === 0} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="soft-panel overflow-hidden p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <h2 className="font-display mb-4">今天想怎么放松？</h2>
              <p className="max-w-[58ch] leading-relaxed text-[color:var(--color-fg-muted)]">
                不用想分类。先想你今天想做什么动作，再去找一个适合手边的小东西。
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {moodRoutes.map((item) => (
                <Link
                  href="/shop"
                  key={item.label}
                  className="rounded-[1.25rem] border border-[color:var(--color-border)] bg-white/72 p-4 transition-transform hover:-translate-y-1"
                >
                  <div className="mb-3 h-2 w-14 rounded-full" style={{ background: item.color }} />
                  <h3 className="mb-1 text-xl">{item.label}</h3>
                  <p className="text-sm text-[color:var(--color-fg-muted)]">{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {reasons.map((item) => (
            <div key={item.title} className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white/68 p-6">
              <h3 className="mb-3 text-2xl">{item.title}</h3>
              <p className="leading-relaxed text-[color:var(--color-fg-muted)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="rounded-[2rem] bg-[color:var(--color-bg-dark)] p-6 text-[color:var(--color-fg-dark)] md:p-10">
          <div className="mb-8 max-w-2xl">
            <h2 className="font-display mb-4">喜欢就从这些地方带走。</h2>
            <p className="leading-relaxed text-white/72">
              OneGoods.studio 负责集中展示商品和故事，真实下单会优先导向 Shopee、小红书店和后续独立站购买。
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {channels.map((channel) => (
              <div key={channel.name} className="rounded-[1.25rem] border border-white/10 bg-white/6 p-5">
                <h3 className="mb-3 text-xl text-white">{channel.name}</h3>
                <p className="text-sm leading-relaxed text-white/70">{channel.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
