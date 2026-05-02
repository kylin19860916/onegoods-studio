import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-[color:var(--color-border-subtle)]">
      <div className="mx-auto max-w-[1200px] px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="md:col-span-2">
          <h3 className="font-display text-xl mb-3">
            OneGoods Studio
            <span className="ml-2 text-[color:var(--color-fg-muted)] text-sm align-middle">
              玩物工坊
            </span>
          </h3>
          <p className="text-sm text-[color:var(--color-fg-muted)] max-w-md leading-relaxed">
            由数码科技博主延伸的产品母品牌。
            <br />
            Maker 实践 + 工业美学 + 可玩好物。
          </p>
        </div>

        {/* Sitemap */}
        <div>
          <h4 className="text-xs uppercase tracking-widest text-[color:var(--color-fg-muted)] mb-3">
            Site
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/brand-story" className="hover:text-[color:var(--color-accent)] transition-colors">品牌故事</Link></li>
            <li><Link href="/shop" className="hover:text-[color:var(--color-accent)] transition-colors">Shop</Link></li>
            <li><Link href="/journal" className="hover:text-[color:var(--color-accent)] transition-colors">工坊日记</Link></li>
            <li><Link href="/contact" className="hover:text-[color:var(--color-accent)] transition-colors">联系</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-xs uppercase tracking-widest text-[color:var(--color-fg-muted)] mb-3">
            Legal
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/legal/privacy" className="hover:text-[color:var(--color-accent)] transition-colors">隐私政策</Link></li>
            <li><Link href="/legal/terms" className="hover:text-[color:var(--color-accent)] transition-colors">用户协议</Link></li>
            <li><Link href="/legal/refund" className="hover:text-[color:var(--color-accent)] transition-colors">退换货</Link></li>
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

