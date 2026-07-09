import { formatMoneyByCurrency, getAdminCustomers, getAdminOrders } from "@/lib/admin-sales";

function MiniStat({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-[1.25rem] border border-[color:var(--color-border)] bg-white/78 p-4">
      <p className="text-xs font-semibold text-[color:var(--color-fg-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-[color:var(--color-fg-muted)]">{helper}</p>
    </div>
  );
}

export async function AdminStats() {
  const [orders, customers] = await Promise.all([getAdminOrders(), getAdminCustomers()]);

  return (
    <section className="mb-8 grid gap-4 md:grid-cols-4">
      <MiniStat
        label="已付款订单"
        value={orders.configured ? String(orders.stats.orderCount) : "-"}
        helper={orders.configured ? "Stripe 最近 100 笔" : "待配置 Stripe"}
      />
      <MiniStat
        label="最近 7 天"
        value={orders.configured ? String(orders.stats.last7DaysCount) : "-"}
        helper="快速看本周成交"
      />
      <MiniStat
        label="收入"
        value={orders.configured ? formatMoneyByCurrency(orders.stats.revenueByCurrency) : "-"}
        helper="按币种显示"
      />
      <MiniStat
        label="用户"
        value={customers.stripeConfigured || customers.resendConfigured ? String(customers.stats.buyerCount + customers.stats.activeSubscriberCount) : "-"}
        helper={customers.stripeConfigured || customers.resendConfigured ? "买家 + 有效订阅" : "待配置数据源"}
      />
    </section>
  );
}
