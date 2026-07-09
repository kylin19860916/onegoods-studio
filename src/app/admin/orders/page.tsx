import Link from "next/link";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { formatMoneyByCurrency, getAdminOrders } from "@/lib/admin-sales";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-Hans", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function StatCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white/78 p-5 shadow-[var(--shadow-card)]">
      <p className="mb-3 text-sm font-semibold text-[color:var(--color-fg-muted)]">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
      <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">{helper}</p>
    </div>
  );
}

export default async function AdminOrdersPage() {
  const data = await getAdminOrders();

  return (
    <main className="mx-auto max-w-[1200px] px-6 py-12">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <Link href="/admin" className="mb-4 inline-block text-sm font-semibold text-[color:var(--color-accent)]">
            OneGoods CMS
          </Link>
          <h1 className="font-display mb-5">销售记录</h1>
          <p className="leading-relaxed text-[color:var(--color-fg-muted)]">
            只读查看 Stripe Checkout 订单。退款、发票和争议处理仍然回 Stripe Dashboard 操作。
          </p>
        </div>
        <LogoutButton />
      </div>

      {!data.configured && (
        <section className="mb-8 rounded-[1.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-accent-soft)] p-5">
          <p className="font-semibold">还没接上 Stripe</p>
          <p className="mt-2 max-w-[72ch] leading-relaxed text-[color:var(--color-fg-muted)]">
            当前环境没有 `STRIPE_SECRET_KEY`。配置后这里会自动显示最近 100 个 Checkout Sessions。
          </p>
        </section>
      )}

      {data.error && (
        <section className="mb-8 rounded-[1.5rem] border border-red-200 bg-red-50 p-5 text-red-900">
          <p className="font-semibold">Stripe 读取失败</p>
          <p className="mt-2 text-sm leading-relaxed">{data.error}</p>
        </section>
      )}

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard label="已付款订单" value={String(data.stats.orderCount)} helper="只统计 payment_status=paid 的 Checkout Sessions。" />
        <StatCard label="最近 7 天" value={String(data.stats.last7DaysCount)} helper="用于快速判断本周是否有新成交。" />
        <StatCard label="收入" value={formatMoneyByCurrency(data.stats.revenueByCurrency)} helper="按 Stripe 返回币种聚合，未做汇率换算。" />
      </section>

      <section className="overflow-hidden rounded-[1.5rem] border border-[color:var(--color-border)] bg-white/78 shadow-[var(--shadow-card)]">
        <div className="border-b border-[color:var(--color-border)] p-5">
          <h2 className="text-2xl">最近订单</h2>
          <p className="mt-2 text-sm text-[color:var(--color-fg-muted)]">最多显示最近 100 笔，按 Stripe 创建时间倒序。</p>
        </div>

        {data.orders.length === 0 ? (
          <div className="p-8 text-[color:var(--color-fg-muted)]">
            {data.configured ? "暂时没有 Checkout Sessions。" : "配置 Stripe key 后这里会显示订单列表。"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-white/70 text-[color:var(--color-fg-muted)]">
                <tr>
                  <th className="px-5 py-4 font-semibold">时间</th>
                  <th className="px-5 py-4 font-semibold">商品</th>
                  <th className="px-5 py-4 font-semibold">买家</th>
                  <th className="px-5 py-4 font-semibold">金额</th>
                  <th className="px-5 py-4 font-semibold">状态</th>
                  <th className="px-5 py-4 font-semibold">国家</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-border)]">
                {data.orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-5 py-4 text-[color:var(--color-fg-muted)]">{formatDate(order.created)}</td>
                    <td className="px-5 py-4">
                      <span className="block font-semibold">{order.productName}</span>
                      <span className="mt-1 block text-xs text-[color:var(--color-fg-muted)]">{order.productSlug || order.id}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="block font-semibold">{order.customerEmail || "未提供邮箱"}</span>
                      {order.customerName && <span className="mt-1 block text-xs text-[color:var(--color-fg-muted)]">{order.customerName}</span>}
                    </td>
                    <td className="px-5 py-4 font-semibold">{order.currency} {order.amountTotal.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className="pill-badge">{order.paymentStatus}</span>
                    </td>
                    <td className="px-5 py-4 text-[color:var(--color-fg-muted)]">{order.country || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
