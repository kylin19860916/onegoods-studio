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

const collections = [
  {
    name: "水果与食物",
    desc: "草莓、甜点、饮料这类一眼可爱的造型，适合冲动收藏和送朋友。",
    href: "/shop",
    color: "var(--color-peach)",
    image: "/images/products/strawberry-button-fidget.png",
  },
  {
    name: "桌面陪伴",
    desc: "放在屏幕旁边、键盘边或床头，工作间隙可以摸一下、转一下。",
    href: "/shop",
    color: "var(--color-mint)",
    image: "/images/products/mushroom-spinner-desk-buddy.png",
  },
  {
    name: "小收纳与挂件",
    desc: "把解压动作和日常用途结合起来，适合耳塞、戒指、钥匙和包包。",
    href: "/shop",
    color: "var(--color-sky)",
    image: "/images/products/cloud-slide-mini-case.png",
  },
  {
    name: "首批测试款",
    desc: "先少量打样、拍内容、上架测反馈，稳定后再补色和补货。",
    href: "/shop",
    color: "var(--color-butter)",
    image: "/images/products/onegoods-stress-relief-goods.png",
  },
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

const heroNotes = [
  { label: "首批方向", value: "按压、旋转、滑盖" },
  { label: "购买路径", value: "Shopee / 小红书店 / IG" },
  { label: "制作方式", value: "小批量 3D 打印" },
];

const feelStories = [
  {
    title: "草莓按压解压钮",
    desc: "适合工作间隙轻轻按一下。它不解决所有压力，但能让手有一个可爱的落点。",
    image: "/images/products/strawberry-button-fidget.png",
    href: "/shop/strawberry-button-fidget",
  },
  {
    title: "小蘑菇旋转摆件",
    desc: "适合放在屏幕旁边。转一下，等思路回来一点，再继续做事。",
    image: "/images/products/mushroom-spinner-desk-buddy.png",
    href: "/shop/mushroom-spinner-desk-buddy",
  },
  {
    title: "云朵滑盖小物盒",
    desc: "适合收耳塞、戒指或小纸条。推开它的时候，桌面也跟着变轻一点。",
    image: "/images/products/cloud-slide-mini-case.png",
    href: "/shop/cloud-slide-mini-case",
  },
];

const tinyMoods = [
  {
    name: "草莓钮",
    role: "负责把紧绷按小一点",
    line: "手停不下来时，按它一下就好。",
    image: "/images/products/strawberry-button-fidget.png",
    href: "/shop/strawberry-button-fidget",
    bg: "var(--color-peach)",
  },
  {
    name: "蘑菇转转",
    role: "负责陪你等灵感回来",
    line: "卡住的时候，转一圈再继续。",
    image: "/images/products/mushroom-spinner-desk-buddy.png",
    href: "/shop/mushroom-spinner-desk-buddy",
    bg: "var(--color-mint)",
  },
  {
    name: "云朵盒",
    role: "负责收起一点小混乱",
    line: "把耳塞、戒指、小纸条都暂时放进去。",
    image: "/images/products/cloud-slide-mini-case.png",
    href: "/shop/cloud-slide-mini-case",
    bg: "var(--color-sky)",
  },
];

const faqs = [
  {
    q: "这些是现货吗？",
    a: "首批会以少量测试款为主。商品页会标明是否已上架、准备中或补货中。",
  },
  {
    q: "3D 打印会不会有纹路？",
    a: "会有轻微层纹，这是制作特征。我们会尽量控制表面质量，并在商品页说明材料和注意事项。",
  },
  {
    q: "哪里可以购买？",
    a: "台湾和东南亚优先走 Shopee，小红书用户可看小红书店，海外内容会先从 Instagram 导回官网。",
  },
  {
    q: "可以客制颜色吗？",
    a: "第一阶段先测试固定颜色。若某款反馈稳定，会再开放颜色选择或小批量客制。",
  },
];

const reviews = [
  {
    quote: "想买它不是因为缺一个东西，是因为看到就想按一下。",
    name: "内容测试反馈",
  },
  {
    quote: "桌面上多一个可爱的小停靠点，工作空档会没那么硬。",
    name: "样品试用反馈",
  },
  {
    quote: "价格带如果控制在小礼物范围，会很适合顺手带一颗。",
    name: "选品判断",
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
            <span>{product.priceLabel ?? (product.priceUSD ? `$${product.priceUSD} USD` : "开放购买前通知")}</span>
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
      <div className="bg-[color:var(--color-bg-dark)] px-6 py-2 text-center text-sm font-semibold text-white">
        首批测试款准备上架中。适合桌面、包包和小礼物的 3D 打印解压小物。
      </div>

      <section className="relative overflow-hidden">
        <div className="mx-auto grid min-h-[calc(100dvh-96px)] max-w-[1200px] grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-[0.82fr_1.18fr]">
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
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {heroNotes.map((item) => (
                <div key={item.label} className="rounded-[1rem] border border-[color:var(--color-border)] bg-white/72 p-4">
                  <p className="mb-1 text-xs font-semibold text-[color:var(--color-fg-muted)]">{item.label}</p>
                  <p className="text-sm font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-5 top-10 hidden rounded-full bg-[color:var(--color-butter)] px-5 py-3 text-sm font-bold shadow-[var(--shadow-card)] md:block">
              按、转、推，都算休息
            </div>
            <div className="absolute -right-2 bottom-10 hidden rounded-full bg-white px-5 py-3 text-sm font-bold shadow-[var(--shadow-card)] md:block">
              3D printed in small batches
            </div>
            <div className="absolute left-6 bottom-6 z-10 rounded-[1rem] bg-[color:var(--color-bg-dark)] px-5 py-4 text-white shadow-[var(--shadow-card)]">
              <p className="text-xs font-semibold text-white/60">今日主推</p>
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
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2 className="font-display mb-4">按系列逛小物。</h2>
            <p className="leading-relaxed text-[color:var(--color-fg-muted)]">
              先从直觉的分类开始：想要可爱造型、桌面陪伴、小收纳，或者只想看看首批测试款，都能快速找到入口。
            </p>
          </div>
          <Link href="/shop" className="secondary-cta self-start md:self-auto">
            查看全部
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white/78 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1"
            >
              <div className="relative aspect-[4/3] overflow-hidden" style={{ background: item.color }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
              </div>
              <div className="p-5">
                <h3 className="mb-3 text-2xl group-hover:text-[color:var(--color-accent)]">{item.name}</h3>
                <p className="text-sm leading-relaxed text-[color:var(--color-fg-muted)]">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-display mb-4">不是摆设，是给手的情绪出口。</h2>
          <p className="leading-relaxed text-[color:var(--color-fg-muted)]">
            OneGoods 的小物先从动作出发：按、转、推。每个动作都要足够直觉，才值得进入首批测试。
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {feelStories.map((item) => (
            <Link key={item.title} href={item.href} className="group overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)]">
              <div className="aspect-square overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
              </div>
              <div className="p-6">
                <h3 className="mb-3 text-2xl group-hover:text-[color:var(--color-accent)]">{item.title}</h3>
                <p className="leading-relaxed text-[color:var(--color-fg-muted)]">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="rounded-[2rem] border border-[color:var(--color-border)] bg-white/78 p-6 shadow-[var(--shadow-card)] md:p-10">
          <div className="mb-10 grid gap-6 md:grid-cols-[0.78fr_1.22fr] md:items-end">
            <div>
              <h2 className="font-display mb-4">认识这些小情绪搭子。</h2>
            </div>
            <p className="max-w-[64ch] leading-relaxed text-[color:var(--color-fg-muted)]">
              OneGoods 不只是摆商品图，也会给每个小物一点好记的性格。你可以先记住它的动作，再决定要不要带回桌上。
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {tinyMoods.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group overflow-hidden rounded-[1.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] transition-transform hover:-translate-y-1"
              >
                <div className="aspect-[5/4] overflow-hidden" style={{ background: item.bg }}>
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
        <div className="mb-10 max-w-2xl">
          <h2 className="font-display mb-4">先用反馈决定下一批。</h2>
          <p className="leading-relaxed text-[color:var(--color-fg-muted)]">
            真正的销量要等上架后验证。现在先把每一款做成容易理解、容易分享、容易下单的商品。
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {reviews.map((item) => (
            <div key={item.quote} className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white/74 p-6">
              <p className="mb-6 text-lg leading-relaxed">{item.quote}</p>
              <p className="text-sm font-semibold text-[color:var(--color-fg-muted)]">{item.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="grid gap-8 rounded-[2rem] border border-[color:var(--color-border)] bg-white/78 p-6 shadow-[var(--shadow-card)] md:grid-cols-[0.85fr_1.15fr] md:p-10">
          <div>
            <h2 className="font-display mb-5">买之前，先知道这些。</h2>
            <p className="leading-relaxed text-[color:var(--color-fg-muted)]">
              小批量 3D 打印和一般量产商品不太一样。我们把差异讲清楚，你再决定要不要带走。
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {faqs.map((item) => (
              <div key={item.q} className="rounded-[1.25rem] bg-[color:var(--color-bg)] p-5">
                <h3 className="mb-2 text-xl">{item.q}</h3>
                <p className="text-sm leading-relaxed text-[color:var(--color-fg-muted)]">{item.a}</p>
              </div>
            ))}
          </div>
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
