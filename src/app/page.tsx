import Link from "next/link";

const series = [
  {
    name: "水果系列",
    label: "Fruit Friends",
    desc: "草莓、蜜桃、葡萄、柑橘这些有记忆点的造型，可以做成按压、挂件、桌面小物或小工具。",
    examples: "草莓 · 蜜桃 · 葡萄 · 柑橘",
    iconSrc: "/images/icons/v4-series-clean/fruit-squishy.png",
    color: "var(--color-butter)",
  },
  {
    name: "美食系列",
    label: "Snack & Food",
    desc: "甜甜圈、布丁、饭团、面包、奶茶杯，把日常食物变成可爱、疗愈、好玩的随身小物。",
    examples: "甜点 · 饮料 · 面包 · 小吃",
    iconSrc: "/images/icons/v4-series-clean/food-smile.png",
    color: "var(--color-peach)",
  },
  {
    name: "自然系列",
    label: "Nature Mood",
    desc: "云朵、蘑菇、花朵、海浪、星星，适合做成更轻柔、更治愈的视觉主题。",
    examples: "云朵 · 蘑菇 · 花朵 · 星星",
    iconSrc: "/images/icons/v4-series-clean/nature-sparkle.png",
    color: "var(--color-mint)",
  },
  {
    name: "工坊系列",
    label: "Studio Maker",
    desc: "MagBlock、磁吸结构、模块化桌面小物，以及被重新调整过的实用玩物。",
    examples: "MagBlock · 磁吸 · 模块化 · 改造款",
    iconSrc: "/images/icons/v4-series-clean/studio-block.png",
    color: "var(--color-sky)",
  },
];

const valueBadges = ["解压", "疗愈", "好玩", "好看", "可爱"];

export default function Home() {
  return (
    <>
      <section className="relative -mt-16 overflow-hidden pt-16 grain">
        <div className="mx-auto grid min-h-[760px] max-w-[1200px] grid-cols-1 items-center gap-12 px-6 py-24 lg:grid-cols-[1fr_0.95fr]">
          <div className="relative z-10 max-w-2xl">
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
              OneGoods Studio · 玩物工坊
            </p>
            <h1 className="font-display mb-8">
              一系列好看、
              <br />
              <span className="text-[color:var(--color-fg-muted)]">好玩、可爱的日常小物。</span>
            </h1>
            <p className="mb-8 max-w-xl text-lg leading-relaxed text-[color:var(--color-fg-muted)]">
              不按功能把商品切碎，而是按「系列」来逛：水果、美食、自然、工坊。每个系列都可以同时承载解压、疗愈、好玩、好看、可爱这些选品核心。
            </p>
            <div className="mb-10 flex flex-wrap gap-2">
              {valueBadges.map((badge) => (
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
                逛逛系列 →
              </Link>
              <Link
                href="/brand-story"
                className="rounded-full border border-[color:var(--color-border)] bg-white/72 px-6 py-3 text-center font-semibold transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
              >
                了解工坊
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="studio-card relative aspect-[4/5] overflow-hidden p-6">
              <div className="absolute left-6 top-6 rounded-full bg-[color:var(--color-accent-soft)] px-4 py-2 text-xs font-bold text-[color:var(--color-accent)]">
                series-first product world
              </div>

              <div className="absolute inset-x-8 top-24 grid grid-cols-2 gap-4">
                {series.map((item, idx) => (
                  <div
                    key={item.name}
                    className="rounded-[1.4rem] border border-[color:var(--color-border)] bg-white/78 p-4 shadow-sm"
                  >
                    <div
                      className="sticker-icon mb-3 h-12 w-12 text-2xl"
                      style={{ background: item.color }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.iconSrc} alt="" className="h-10 w-10 object-contain" />
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-fg-muted)]">
                      0{idx + 1} · {item.label}
                    </p>
                    <h3 className="mt-1 text-xl">{item.name}</h3>
                  </div>
                ))}
              </div>

              <div className="absolute bottom-8 left-8 right-8 rounded-[1.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-bg)]/82 p-5 backdrop-blur">
                <p className="mb-3 text-sm font-semibold">选品核心</p>
                <div className="flex flex-wrap gap-2">
                  {valueBadges.map((badge) => (
                    <span key={badge} className="rounded-full bg-white/72 px-3 py-1 text-xs font-semibold text-[color:var(--color-fg-muted)]">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
              Browse by series
            </p>
            <h2 className="font-display">从系列出发，而不是从功能出发。</h2>
          </div>
          <p className="max-w-md text-[color:var(--color-fg-muted)]">
            同一个按压玩具可以是水果系列，也可以是挂件；所以 OneGoods 用视觉主题建立系列，用选品维度控制质感。
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {series.map((item) => (
            <Link href="/shop" key={item.name} className="studio-card group p-6 transition-transform hover:-translate-y-1">
              <div className="sticker-icon mb-5 h-14 w-14 text-2xl" style={{ background: item.color }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.iconSrc} alt="" className="h-12 w-12 object-contain" />
              </div>
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-[color:var(--color-fg-muted)]">
                {item.label}
              </p>
              <h3 className="mb-4 text-2xl group-hover:text-[color:var(--color-accent)]">{item.name}</h3>
              <p className="mb-4 min-h-[5.8rem] leading-relaxed text-[color:var(--color-fg-muted)]">{item.desc}</p>
              <p className="text-sm font-semibold text-[color:var(--color-fg)]">{item.examples}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="dark-panel grid grid-cols-1 gap-12 rounded-[2rem] p-8 md:grid-cols-2 md:p-12">
          <div>
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-butter)]">
              Curation rule
            </p>
            <h2 className="font-display mb-6">
              系列负责记忆点，
              <br />
              选品负责情绪价值。
            </h2>
          </div>
          <div className="space-y-6 leading-relaxed text-white/74">
            <p>
              OneGoods 不把商品固定成“解压类 / 挂件类 / 工具类”。我们先建立水果、美食、自然、工坊这些容易被记住的系列，再选择符合解压、疗愈、好玩、好看、可爱的单品形态。
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {valueBadges.map((value) => (
                <div key={value} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/84">
                  {value}
                </div>
              ))}
            </div>
            <Link href="/brand-story" className="inline-block text-[color:var(--color-butter)] hover:underline">
              了解我们的故事 →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
