"use client";

import type { Product } from "@/lib/content";
import { useI18n } from "@/components/i18n/I18nProvider";
import { ArrowIcon } from "@/components/icons/Icons";
import type { TranslationKey } from "@/lib/i18n";

declare global {
  interface Window {
    gtag?: (cmd: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

const CHANNELS = [
  { key: "shopee", label: "purchase.shopee", desc: "purchase.shopeeDesc" },
  { key: "xiaohongshu", label: "purchase.xhs", desc: "purchase.xhsDesc" },
  { key: "instagram", label: "purchase.instagram", desc: "purchase.instagramDesc" },
  { key: "direct", label: "purchase.direct", desc: "purchase.directDesc" },
] as const;

type ChannelKey = (typeof CHANNELS)[number]["key"];

export function PurchaseLinks({ product }: { product: Product }) {
  const links = product.purchaseLinks ?? {};
  const activeLinks = CHANNELS.filter(({ key }) => Boolean(links[key]));
  const { t } = useI18n();

  function trackClick(channel: ChannelKey) {
    if (typeof window.gtag === "function") {
      window.gtag("event", "select_purchase_channel", {
        item_id: product.slug,
        item_name: product.name,
        channel,
        sales_status: product.salesStatus,
      });
    }
  }

  if (activeLinks.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white/76 p-5 shadow-[var(--shadow-card)]">
        <p className="mb-2 text-base font-semibold">{t("purchase.pendingTitle")}</p>
        <p className="mb-4 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
          {t("purchase.pendingBody")}
        </p>
        <a
          href="/contact"
          className="primary-cta w-full"
        >
          {t("purchase.notify")}
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-[1.5rem] border border-[color:var(--color-border)] bg-white/76 p-5 shadow-[var(--shadow-card)]">
      <p className="text-base font-semibold">{t("purchase.methods")}</p>
      {activeLinks.map(({ key, label, desc }) => (
        <a
          key={key}
          href={links[key]}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackClick(key)}
          className="flex min-h-14 w-full items-center justify-between gap-4 rounded-[1rem] bg-[color:var(--color-accent)] px-5 py-3 text-left text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
        >
          <span>
            <span className="block">{t(label as TranslationKey)}</span>
            <span className="block text-xs font-medium text-white/78">{t(desc as TranslationKey)}</span>
          </span>
          <ArrowIcon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}
