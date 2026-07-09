import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[color:var(--color-border-subtle)] bg-white/28">
      <div className="og-container grid grid-cols-1 gap-10 py-14 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
        <div>
          <h3 className="mb-3 font-display text-2xl font-bold">OneGoods Studio</h3>
          <p className="max-w-md text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
            玩物工坊。把日常小物，变得更好玩。小批量 3D 打印、手感测试、内容反馈，再决定下一批。
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold text-[color:var(--color-fg)]">站内</h4>
          <ul className="space-y-3 text-sm text-[color:var(--color-fg-muted)]">
            <li><Link href="/shop" className="transition-colors hover:text-[color:var(--color-coral)]">商品</Link></li>
            <li><Link href="/journal" className="transition-colors hover:text-[color:var(--color-coral)]">选品日记</Link></li>
            <li><Link href="/brand-story" className="transition-colors hover:text-[color:var(--color-coral)]">品牌故事</Link></li>
            <li><Link href="/contact" className="transition-colors hover:text-[color:var(--color-coral)]">联系</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold text-[color:var(--color-fg)]">购买渠道</h4>
          <ul className="space-y-3 text-sm text-[color:var(--color-fg-muted)]">
            <li>Shopee</li>
            <li>小红书店</li>
            <li>Instagram</li>
            <li>独立站提醒</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[color:var(--color-border-subtle)]">
        <div className="og-container flex flex-col items-center justify-between gap-3 py-6 text-xs text-[color:var(--color-fg-soft)] md:flex-row">
          <span>© 2026 OneGoods Studio · 玩物工坊</span>
          <span>Everyday little things, made more fun.</span>
        </div>
      </div>
    </footer>
  );
}
