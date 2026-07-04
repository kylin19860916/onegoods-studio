import Link from "next/link";
import { getAllProducts, type Product } from "@/lib/content";

const motions = [
  { label: "想捏一下", desc: "按压、回弹、掌心小动作", color: "var(--color-butter)" },
  { label: "想转一下", desc: "旋钮、转盘、循环把玩", color: "var(--color-mint)" },
  { label: "想推一下", desc: "滑盖、滑块、咔哒反馈", color: "var(--color-sky)" },
  { label: "想摆桌上", desc: "陪伴、装饰、工作间隙看一眼", color: "var(--color-peach)" },
  { label: "想送朋友", desc: "不贵，但有一点被惦记的感觉", color: "var(--color-lavender)" },
];

const steps = ["选品", "打印", "拍内容", "上架", "看反馈", "放大爆款"];

function statusLabel(status?: Product["salesStatus"]) {
  if (status === "listed") return "已上架";
  if (status === "sample-ready") return "样品完成";
  if (status === "sold-out") return "补货中";
  if (status === "idea") return "候选中";
  return "测试中";
}

function ProductMiniCard({ product }: { product: Product }) {
  const tags = [...(product.motion ?? []), ...(product.mood ?? [])].slice(0, 4);

  return (
    <Link href={`/shop/${product.slug}`} className="studio-card group block overflow-hidden transition-transform hover:-translate-y-1">
      <div className="flex aspect-[4/3] items-center justify-center bg-[linear-gradient(135deg,var(--color-butter),var(--color-mint),#fffaf2)] p-6 text-center">
        {product.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div>
            <div className="sticker-icon mx-auto mb-3 h-16 w-16 bg-white/76">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/icons/v4-clean/squishy-blob.png" alt="" className="h-12 w-12 object-contain" />
            </div>
            <p className="text-xs font-semibold text-[color:var(--color-fg-muted)]">实拍素材准备中</p>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="pill-badge">{statusLabel(product.salesStatus)}</span>
          {tags.map((tag) => (
            <span key={tag} className="pill-badge">
              {tag}
            </span>
          ))}
        </div>
        <h3 className="mb-2 text-xl transition-colors group-hover:text-[color:var(--color-accent)]">
          {product.name}
        </h3>
        <p className="text-sm leading-relaxed text-[color:var(--color-fg-muted)]">{product.shortDesc}</p>
      </div>
    </Link>
  );
}

export default function Home() {
  const products = getAllProducts()
    .sort((a, b) => {
      if (a.salesStatus === "testing" && b.salesStatus !== "testing") return -1;
      if (a.salesStatus !== "testing" && b.salesStatus === "testing") return 1;
      return a.order - b.order;
    })
    .slice(0, 3);

  return (
    <>
      <section className="relative -mt-16 overflow-hidden pt-16 grain">
        <div className="mx-auto grid min-h-[720px] max-w-[1200px] grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-[1fr_0.9fr]">
          <div className="relative z-10 max-w-2xl">
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
              OneGoods Studio
            </p>
            <h1 className="font-display mb-8">
              给手一点
              <br />
              <span className="text-[color:var(--color-fg-muted)]">小小的解压。</span>
            </h1>
            <p className="mb-8 max-w-xl text-lg leading-relaxed text-[color:var(--color-fg-muted)]">
              我们挑选、打印并测试那些可爱、有触感、适合日常把玩的 3D 打印小物。先小批量上架，看真实反馈，再放大真正好玩的款。
            </p>
            <div className="mb-10 flex flex-wrap gap-2">
              {["解压 3D 打印小物", "情绪价值", "小批量测试", "桌面陪伴"].map((badge) => (
                <span key={badge} className="pill-badge">
                  {badge}
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-center font-semibold text-white shadow-[0_18px_40px_rgba(255,127,92,0.24)] transition-transform hover:-translate-y-0.5"
              >
                看本周测试款
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-[color:var(--color-border)] bg-white/72 px-6 py-3 text-center font-semibold transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
              >
                加入上新提醒
              </Link>
            </div>
          </div>

          <div className="studio-card relative overflow-hidden p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-fg-muted)]">
                  Tiny mood loop
                </p>
                <h2 className="mt-2 text-3xl">选品实验室</h2>
              </div>
              <div className="sticker-icon h-16 w-16 bg-[color:var(--color-butter)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/icons/v4-clean/fidget-puck.png" alt="" className="h-12 w-12 object-contain" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {steps.map((step, index) => (
                <div key={step} className="rounded-[1.25rem] border border-[color:var(--color-border)] bg-white/70 p-4">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-fg-muted)]">
                    0{index + 1}
                  </p>
                  <p className="text-lg font-semibold">{step}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 rounded-[1.25rem] bg-[color:var(--color-accent-soft)] p-4 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
              核心不是一次做很多 SKU，而是找到那些 3 秒内看懂、拿在手里有爽感、适合拍内容也适合成交的小东西。
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
              This week picks
            </p>
            <h2 className="font-display">本周测试款</h2>
          </div>
          <p className="max-w-md text-[color:var(--color-fg-muted)]">
            先从少量小物开始，看看哪些真的让人想一直摸、一直玩、一直放在桌上。
          </p>
        </div>
        <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
          {products.map((product) => (
            <ProductMiniCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="mb-10">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
            Shop by mood
          </p>
          <h2 className="font-display">按今天的心情逛。</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {motions.map((item) => (
            <Link
              href="/shop"
              key={item.label}
              className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white/72 p-5 transition-transform hover:-translate-y-1"
            >
              <div className="mb-4 h-2 w-16 rounded-full" style={{ background: item.color }} />
              <h3 className="mb-3 text-2xl">{item.label}</h3>
              <p className="text-sm leading-relaxed text-[color:var(--color-fg-muted)]">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="dark-panel grid grid-cols-1 gap-10 rounded-[2rem] p-8 md:grid-cols-[0.85fr_1fr] md:p-12">
          <div>
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-butter)]">
              Where to buy
            </p>
            <h2 className="font-display mb-4">喜欢就带走。</h2>
            <p className="leading-relaxed text-white/72">
              独立站负责承接品牌和商品页；真实成交先从虾皮、小红书店和 Instagram 内容入口开始跑。
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {["Shopee 台湾 / 东南亚", "小红书店", "Instagram 实拍内容", "OneGoods.studio 商品页"].map((channel) => (
              <div key={channel} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white/84">
                {channel}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
