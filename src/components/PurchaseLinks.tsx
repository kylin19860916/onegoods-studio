"use client";

import type { Product } from "@/lib/content";

declare global {
  interface Window {
    gtag?: (cmd: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

const CHANNELS = [
  { key: "shopee", label: "虾皮购买", desc: "适合台湾与东南亚订单" },
  { key: "xiaohongshu", label: "小红书店购买", desc: "适合从内容种草后下单" },
  { key: "instagram", label: "Instagram 看实拍", desc: "看 Reels、场景图和海外更新" },
  { key: "direct", label: "独立站购买", desc: "未来开放 Stripe / Shopify" },
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
      <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white/76 p-5 shadow-[var(--shadow-card)]">
        <p className="mb-2 text-base font-semibold">首批购买入口准备中</p>
        <p className="mb-4 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
          这个小物还在打样、拍摄或上架准备阶段。留下邮箱，开放购买、补货或新增颜色时通知你。
        </p>
        <a
          href="/contact"
          className="primary-cta w-full"
        >
          加入上新提醒
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-[1.5rem] border border-[color:var(--color-border)] bg-white/76 p-5 shadow-[var(--shadow-card)]">
      <p className="text-base font-semibold">购买方式</p>
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
            <span className="block">{label}</span>
            <span className="block text-xs font-medium text-white/78">{desc}</span>
          </span>
          <span aria-hidden="true">→</span>
        </a>
      ))}
    </div>
  );
}
