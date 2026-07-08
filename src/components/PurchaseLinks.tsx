import type { PurchaseLinks } from "@/lib/content";

const channelMeta: Record<
  keyof PurchaseLinks,
  { label: string; hint: string; className: string }
> = {
  shopee: {
    label: "虾皮购买",
    hint: "平台下单 · 物流与评价沉淀",
    className: "bg-[color:var(--color-accent)] text-white border-[color:var(--color-accent)]",
  },
  xiaohongshu: {
    label: "小红书店购买",
    hint: "看内容种草 · 店铺成交",
    className: "bg-white text-[color:var(--color-fg)] border-[color:var(--color-border)]",
  },
  instagram: {
    label: "Instagram 看实拍",
    hint: "海外内容入口 · 导回独立站",
    className: "bg-white text-[color:var(--color-fg)] border-[color:var(--color-border)]",
  },
  direct: {
    label: "独立站购买",
    hint: "未来直营 / Stripe / Shopify 入口",
    className: "bg-[color:var(--color-bg-dark)] text-white border-[color:var(--color-bg-dark)]",
  },
};

export function PurchaseLinks({ links }: { links?: PurchaseLinks }) {
  const entries = (Object.entries(links ?? {}) as [keyof PurchaseLinks, string | undefined][]).filter(([, url]) => Boolean(url));

  if (entries.length === 0) {
    return (
      <div className="rounded-[1.4rem] border border-dashed border-[color:var(--color-border)] bg-white/58 p-5">
        <p className="font-semibold">测试款准备中</p>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
          这款还在选品 / 打样 / 拍内容阶段。先加入补货与上架提醒，等虾皮或小红书店开卖。
        </p>
        <a
          href="/contact"
          className="mt-4 inline-flex rounded-full bg-[color:var(--color-accent)] px-5 py-3 text-sm font-semibold text-white"
        >
          通知我上架 →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[color:var(--color-fg-muted)]">购买入口</p>
      {entries.map(([channel, url]) => {
        const meta = channelMeta[channel];
        return (
          <a
            key={channel}
            href={url}
            target="_blank"
            rel="noreferrer"
            className={`block rounded-full border px-5 py-3 text-center text-sm font-semibold transition-transform hover:-translate-y-0.5 ${meta.className}`}
          >
            {meta.label}
            <span className="ml-2 hidden text-xs opacity-72 sm:inline">{meta.hint}</span>
          </a>
        );
      })}
    </div>
  );
}
