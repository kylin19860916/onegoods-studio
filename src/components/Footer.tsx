import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-[color:var(--color-border-subtle)]">
      <div className="mx-auto max-w-[1200px] px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="md:col-span-2">
          <h3 className="font-display text-xl mb-3">
            OneGoods Studio
          </h3>
          <p className="text-sm text-[color:var(--color-fg-muted)] max-w-md leading-relaxed">
            解压 / 情绪价值 3D 打印小物。
            <br />
            小批量选品、打印、拍内容、上架测试。
          </p>
        </div>

        {/* Sitemap */}
        <div>
          <h4 className="text-xs uppercase tracking-widest text-[color:var(--color-fg-muted)] mb-3">
            Site
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/shop" className="hover:text-[color:var(--color-accent)] transition-colors">Shop</Link></li>
            <li><Link href="/journal" className="hover:text-[color:var(--color-accent)] transition-colors">选品日记</Link></li>
            <li><Link href="/brand-story" className="hover:text-[color:var(--color-accent)] transition-colors">关于</Link></li>
            <li><Link href="/contact" className="hover:text-[color:var(--color-accent)] transition-colors">联系</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-[color:var(--color-fg-muted)] mb-3">
            Channels
          </h4>
          <ul className="space-y-2 text-sm">
            <li>Shopee</li>
            <li>小红书店</li>
            <li>Instagram</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[color:var(--color-border-subtle)]">
        <div className="mx-auto max-w-[1200px] px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[color:var(--color-fg-muted)]">
          <span>© 2026 OneGoods Studio. All rights reserved.</span>
          <span className="font-mono">v0.0.1 · Built with Next.js</span>
        </div>
      </div>
    </footer>
  );
}
