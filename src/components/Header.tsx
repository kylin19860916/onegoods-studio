import Link from "next/link";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/journal", label: "选品日记" },
  { href: "/brand-story", label: "关于" },
  { href: "/contact", label: "联系" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg)]/86 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <Link
          href="/"
          className="font-display text-lg tracking-tight transition-colors hover:text-[color:var(--color-accent)]"
        >
          OneGoods<span className="text-[color:var(--color-fg-muted)]">·</span>Studio
        </Link>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-fg)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/shop"
          className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
        >
          看测试款
        </Link>
      </div>
    </header>
  );
}
