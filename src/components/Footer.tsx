import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-[color:var(--color-border-subtle)]">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <h3 className="font-display mb-3 text-xl">
            OneGoods Studio
            <span className="ml-2 align-middle text-sm text-[color:var(--color-fg-muted)]">
              玩物工坊
            </span>
          </h3>
          <p className="max-w-md text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
            解压 / 情绪价值 3D 打印小物选品品牌。
            <br />
            选品 → 打印 → 拍内容 → 上架 → 看反馈 → 放大爆款。
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-xs uppercase tracking-widest text-[color:var(--color-fg-muted)]">
            Site
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/shop" className="transition-colors hover:text-[color:var(--color-accent)]">测试款</Link></li>
            <li><Link href="/journal" className="transition-colors hover:text-[color:var(--color-accent)]">选品日记</Link></li>
            <li><Link href="/brand-story" className="transition-colors hover:text-[color:var(--color-accent)]">关于</Link></li>
            <li><Link href="/contact" className="transition-colors hover:text-[color:var(--color-accent)]">购买渠道</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-xs uppercase tracking-widest text-[color:var(--color-fg-muted)]">
            Channels
          </h4>
          <ul className="space-y-2 text-sm text-[color:var(--color-fg-muted)]">
            <li>虾皮 · 上架销售</li>
            <li>小红书 · 内容 + 店铺</li>
            <li>Instagram · 内容导流</li>
            <li>OneGoods.studio · 品牌承接</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[color:var(--color-border-subtle)]">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-6 py-6 text-xs text-[color:var(--color-fg-muted)] md:flex-row">
          <span>© 2026 OneGoods Studio. All rights reserved.</span>
          <span className="font-mono">selection lab · v0.2</span>
        </div>
      </div>
    </footer>
  );
}
