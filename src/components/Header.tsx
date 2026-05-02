import Link from "next/link";

const navLinks = [
  { href: "/brand-story", label: "品牌故事" },
  { href: "/shop", label: "Shop" },
  { href: "/journal", label: "工坊日记" },
  { href: "/contact", label: "联系" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[color:var(--color-bg)]/70 border-b border-[color:var(--color-border-subtle)]">
      <div className="mx-auto max-w-[1200px] px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-lg tracking-tight hover:text-[color:var(--color-accent)] transition-colors"
        >
          OneGoods<span className="text-[color:var(--color-fg-muted)]">·</span>Studio
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/shop"
          className="text-sm font-medium px-4 py-2 rounded-full border border-[color:var(--color-border)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] transition-colors"
        >
          Shop
        </Link>
      </div>
    </header>
  );
}

