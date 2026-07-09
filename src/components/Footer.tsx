"use client";

import Link from "next/link";
import { T } from "@/components/i18n/I18nProvider";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[color:var(--color-border-subtle)] bg-white/28">
      <div className="og-container grid grid-cols-1 gap-10 py-14 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
        <div>
          <h3 className="mb-3 font-display text-2xl font-bold">OneGoods Studio</h3>
          <p className="max-w-md text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
            <T k="footer.tagline" />
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold text-[color:var(--color-fg)]"><T k="footer.site" /></h4>
          <ul className="space-y-3 text-sm text-[color:var(--color-fg-muted)]">
            <li><Link href="/shop" className="transition-colors hover:text-[color:var(--color-coral)]"><T k="footer.products" /></Link></li>
            <li><Link href="/journal" className="transition-colors hover:text-[color:var(--color-coral)]"><T k="footer.journal" /></Link></li>
            <li><Link href="/brand-story" className="transition-colors hover:text-[color:var(--color-coral)]"><T k="footer.story" /></Link></li>
            <li><Link href="/contact" className="transition-colors hover:text-[color:var(--color-coral)]"><T k="footer.contact" /></Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold text-[color:var(--color-fg)]"><T k="footer.channels" /></h4>
          <ul className="space-y-3 text-sm text-[color:var(--color-fg-muted)]">
            <li>Shopee</li>
            <li><T k="footer.xhs" /></li>
            <li>Instagram</li>
            <li><T k="footer.reminder" /></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[color:var(--color-border-subtle)]">
        <div className="og-container flex flex-col items-center justify-between gap-3 py-6 text-xs text-[color:var(--color-fg-soft)] md:flex-row">
          <span>© 2026 OneGoods Studio · 玩物工坊</span>
          <span><T k="footer.bottom" /></span>
        </div>
      </div>
    </footer>
  );
}
