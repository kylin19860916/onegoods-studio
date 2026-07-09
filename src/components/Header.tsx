import Link from "next/link";

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/shop", label: "商品" },
  { href: "/brand-story", label: "品牌故事" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg)]/86 backdrop-blur-xl">
      <div className="og-container flex h-[72px] items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-[-0.03em] transition-colors hover:text-[color:var(--color-coral)]">
          <span className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-[color:var(--color-coral)] text-sm font-black text-white shadow-[0_10px_22px_-14px_rgba(239,106,85,.8)]">
            OG
          </span>
          OneGoods Studio
        </Link>

        <nav className="hidden items-center gap-2 rounded-full bg-white/62 p-1 text-sm font-bold shadow-sm md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-full px-4 py-2 text-[color:var(--color-fg-muted)] transition-colors hover:bg-white hover:text-[color:var(--color-fg)]">
              {link.label}
            </Link>
          ))}
        </nav>

        <Link href="/shop" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[color:var(--color-coral)] shadow-sm transition-colors hover:bg-[color:var(--color-cream-deep)]">
          逛小物
        </Link>
      </div>
    </header>
  );
}
