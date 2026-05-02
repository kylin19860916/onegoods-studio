import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* === Full-Bleed Hero === */}
      <section className="relative h-[90vh] min-h-[600px] -mt-16 overflow-hidden">
        {/* Background — uses hero-1.png when present, falls back to amber radial gradient */}
        <div
          className="absolute inset-0 bg-[color:var(--color-bg)]"
          style={{
            backgroundImage:
              "url('/images/hero-1.png'), radial-gradient(ellipse at 70% 50%, rgba(242,169,59,0.35) 0%, rgba(10,10,10,1) 60%)",
            backgroundSize: "cover, cover",
            backgroundPosition: "center, center",
            backgroundRepeat: "no-repeat, no-repeat",
          }}
        />

        {/* Left gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--color-bg)] via-[color:var(--color-bg)]/85 via-30% to-transparent to-60% pointer-events-none" />

        {/* Bottom subtle fade into next section */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[color:var(--color-bg)] to-transparent pointer-events-none" />

        {/* Text overlay */}
        <div className="relative h-full mx-auto max-w-[1200px] px-6 flex items-center pt-16">
          <div className="max-w-xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-accent)] mb-6">
              OneGoods Studio · Est. 2026
            </p>
            <h1 className="font-display mb-8">
              玩物 · 工坊
              <br />
              <span className="text-[color:var(--color-fg-muted)]">
                A Maker&apos;s Brand
              </span>
            </h1>
            <p className="text-lg text-[color:var(--color-fg-muted)] leading-relaxed mb-12">
              从数码博主到 Maker 品牌——
              <br />
              把每件「值得玩」的东西，做成你想拥有的样子。
              <br />
              <span className="text-sm">工业美学 · 模块化设计 · 桌面好物</span>
            </p>
            <div className="flex gap-4">
              <Link
                href="/shop"
                className="px-6 py-3 bg-[color:var(--color-accent)] text-[color:var(--color-bg)] font-medium rounded-full hover:opacity-90 transition-opacity"
              >
                看产品 →
              </Link>
              <Link
                href="/brand-story"
                className="px-6 py-3 border border-[color:var(--color-border)] rounded-full backdrop-blur-sm hover:border-[color:var(--color-accent)] transition-colors"
              >
                品牌故事
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* === Featured Categories === */}
      <section className="mx-auto max-w-[1200px] px-6 py-24">
        <h2 className="font-display mb-12">招牌好物</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["MagBlock 模块化系统", "桌面 Setup 配件", "Maker 工具"].map((cat) => (
            <div
              key={cat}
              className="aspect-square bg-[color:var(--color-bg-elevated)] rounded-2xl border border-[color:var(--color-border)] p-8 flex flex-col justify-end hover:border-[color:var(--color-accent)] transition-colors cursor-pointer"
            >
              <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-fg-muted)] mb-2">
                Category
              </p>
              <h3 className="text-2xl">{cat}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* === Brand Statement === */}
      <section className="mx-auto max-w-[1200px] px-6 py-24 border-t border-[color:var(--color-border-subtle)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-fg-muted)] mb-6">
              About
            </p>
            <h2 className="font-display mb-6">
              不只是物，
              <br />
              是值得玩的物。
            </h2>
          </div>
          <div className="text-[color:var(--color-fg-muted)] leading-relaxed space-y-4">
            <p>
              OneGoods Studio · 玩物工坊 是从「客林玩好物」延伸的产品母品牌。
            </p>
            <p>
              我们相信：好物不只是被使用，它应该被
              <span className="text-[color:var(--color-fg)]">玩</span>。
              所以我们做的每件东西都有可拆、可换、可组合的可能性。
            </p>
            <Link
              href="/brand-story"
              className="inline-block mt-4 text-[color:var(--color-accent)] hover:underline"
            >
              了解我们的故事 →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

