"use client";

import type { Product } from "@/lib/content";

declare global {
  interface Window {
    gtag?: (cmd: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

const CHANNELS = [
  { key: "shopee", label: "虾皮购买" },
  { key: "xiaohongshu", label: "小红书店购买" },
  { key: "instagram", label: "Instagram 看实拍" },
  { key: "direct", label: "独立站购买" },
] as const;

type ChannelKey = (typeof CHANNELS)[number]["key"];

export function PurchaseLinks({ product }: { product: Product }) {
  const links = product.purchaseLinks ?? {};
  const activeLinks = CHANNELS.filter(({ key }) => Boolean(links[key]));

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
      <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white/70 p-5">
        <p className="mb-2 text-sm font-semibold">测试款准备中</p>
        <p className="mb-4 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
          这个小物还在打样 / 拍摄 / 上架准备阶段。可以先去联系页留下邮箱，首批开放购买时通知你。
        </p>
        <a
          href="/contact"
          className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
        >
          加入上新提醒
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-[1.5rem] border border-[color:var(--color-border)] bg-white/70 p-5">
      <p className="text-sm font-semibold">购买方式</p>
      {activeLinks.map(({ key, label }) => (
        <a
          key={key}
          href={links[key]}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackClick(key)}
          className="flex w-full items-center justify-between rounded-full bg-[color:var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
        >
          <span>{label}</span>
          <span aria-hidden="true">→</span>
        </a>
      ))}
    </div>
  );
}
