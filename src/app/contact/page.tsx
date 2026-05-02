export const metadata = {
  title: "联系",
  description: "OneGoods Studio · 玩物工坊 联系方式",
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-[800px] px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-accent)] mb-6">
        Contact
      </p>
      <h1 className="font-display mb-12">保持联系</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Email subscribe */}
        <div>
          <h2 className="text-2xl mb-4">订阅工坊日记</h2>
          <p className="text-[color:var(--color-fg-muted)] mb-6 leading-relaxed">
            新品 · Maker 实践 · 工作流分享 — 每月 1-2 封，没废话。
          </p>
          <form className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="your@email.com"
              className="px-4 py-3 bg-[color:var(--color-bg-elevated)] border border-[color:var(--color-border)] rounded-full focus:outline-none focus:border-[color:var(--color-accent)] transition-colors"
            />
            <button
              type="submit"
              disabled
              className="px-6 py-3 bg-[color:var(--color-accent)] text-[color:var(--color-bg)] font-medium rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              订阅 (Resend 接入待实现)
            </button>
          </form>
        </div>

        {/* Direct contact */}
        <div>
          <h2 className="text-2xl mb-4">直接联系</h2>
          <ul className="space-y-4 text-[color:var(--color-fg-muted)]">
            <li>
              <span className="text-[color:var(--color-fg)] block">商务合作</span>
              <a href="mailto:hello@onegoods.studio" className="hover:text-[color:var(--color-accent)] transition-colors">
                hello@onegoods.studio
              </a>
            </li>
            <li>
              <span className="text-[color:var(--color-fg)] block">小红书</span>
              客林玩好物
            </li>
            <li>
              <span className="text-[color:var(--color-fg)] block">YouTube</span>
              客林研究所
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

