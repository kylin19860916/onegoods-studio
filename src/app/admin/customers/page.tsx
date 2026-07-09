import Link from "next/link";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { formatMoneyByCurrency, getAdminCustomers } from "@/lib/admin-sales";

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

export default async function AdminCustomersPage() {
  const data = await getAdminCustomers();

  return (
    <main className="mx-auto max-w-[1200px] px-6 py-12">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <Link href="/admin" className="mb-4 inline-block text-sm font-semibold text-[color:var(--color-accent)]">
            OneGoods CMS
          </Link>
          <h1 className="font-display mb-5">用户信息</h1>
          <p className="leading-relaxed text-[color:var(--color-fg-muted)]">
            汇总 Stripe 买家和 Resend 订阅者。这里只做查看，不保存客户资料到新数据库。
          </p>
        </div>
        <LogoutButton />
      </div>

      {(!data.stripeConfigured || !data.resendConfigured) && (
        <section className="mb-8 rounded-[1.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-accent-soft)] p-5">
          <p className="font-semibold">数据源未全部接上</p>
          <p className="mt-2 max-w-[72ch] leading-relaxed text-[color:var(--color-fg-muted)]">
            买家需要 `STRIPE_SECRET_KEY`，订阅者需要 `RESEND_API_KEY` 和 `RESEND_AUDIENCE_ID`。缺少时页面会保留空状态，不影响后台使用。
          </p>
        </section>
      )}

      {data.error && (
        <section className="mb-8 rounded-[1.5rem] border border-red-200 bg-red-50 p-5 text-red-900">
          <p className="font-semibold">读取用户数据时遇到问题</p>
          <p className="mt-2 text-sm leading-relaxed">{data.error}</p>
        </section>
      )}

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard label="买家邮箱" value={String(data.stats.buyerCount)} helper="来自已付款 Stripe Checkout Sessions，按邮箱去重。" />
        <StatCard label="订阅者" value={String(data.stats.subscriberCount)} helper="来自 Resend Audience 的联系人总数。" />
        <StatCard label="有效订阅" value={String(data.stats.activeSubscriberCount)} helper="排除 unsubscribed 的 Resend 联系人。" />
      </section>

      <section className="mb-8 overflow-hidden rounded-[1.5rem] border border-[color:var(--color-border)] bg-white/78 shadow-[var(--shadow-card)]">
        <div className="border-b border-[color:var(--color-border)] p-5">
          <h2 className="text-2xl">买家</h2>
          <p className="mt-2 text-sm text-[color:var(--color-fg-muted)]">由 Stripe 订单反推，不额外存储 CRM 资料。</p>
        </div>

        {data.customers.length === 0 ? (
          <div className="p-8 text-[color:var(--color-fg-muted)]">
            {data.stripeConfigured ? "暂时没有已付款买家。" : "配置 Stripe key 后这里会显示买家汇总。"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-white/70 text-[color:var(--color-fg-muted)]">
                <tr>
                  <th className="px-5 py-4 font-semibold">邮箱</th>
                  <th className="px-5 py-4 font-semibold">姓名</th>
                  <th className="px-5 py-4 font-semibold">订单数</th>
                  <th className="px-5 py-4 font-semibold">累计消费</th>
                  <th className="px-5 py-4 font-semibold">最后下单</th>
                  <th className="px-5 py-4 font-semibold">国家</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-border)]">
                {data.customers.map((customer) => (
                  <tr key={customer.email}>
                    <td className="px-5 py-4 font-semibold">{customer.email}</td>
                    <td className="px-5 py-4 text-[color:var(--color-fg-muted)]">{customer.name || "-"}</td>
                    <td className="px-5 py-4">{customer.orderCount}</td>
                    <td className="px-5 py-4 font-semibold">{formatMoneyByCurrency(customer.spendByCurrency)}</td>
                    <td className="px-5 py-4 text-[color:var(--color-fg-muted)]">{formatDate(customer.lastOrderAt)}</td>
                    <td className="px-5 py-4 text-[color:var(--color-fg-muted)]">{customer.country || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-[1.5rem] border border-[color:var(--color-border)] bg-white/78 shadow-[var(--shadow-card)]">
        <div className="border-b border-[color:var(--color-border)] p-5">
          <h2 className="text-2xl">邮件订阅者</h2>
          <p className="mt-2 text-sm text-[color:var(--color-fg-muted)]">来自 Resend Audience，适合查看新品通知名单。</p>
        </div>

        {data.subscribers.length === 0 ? (
          <div className="p-8 text-[color:var(--color-fg-muted)]">
            {data.resendConfigured ? "暂时没有订阅者。" : "配置 Resend key 和 audience 后这里会显示订阅者。"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-white/70 text-[color:var(--color-fg-muted)]">
                <tr>
                  <th className="px-5 py-4 font-semibold">邮箱</th>
                  <th className="px-5 py-4 font-semibold">姓名</th>
                  <th className="px-5 py-4 font-semibold">订阅时间</th>
                  <th className="px-5 py-4 font-semibold">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-border)]">
                {data.subscribers.map((subscriber) => (
                  <tr key={subscriber.id}>
                    <td className="px-5 py-4 font-semibold">{subscriber.email}</td>
                    <td className="px-5 py-4 text-[color:var(--color-fg-muted)]">{subscriber.name || "-"}</td>
                    <td className="px-5 py-4 text-[color:var(--color-fg-muted)]">{formatDate(subscriber.createdAt)}</td>
                    <td className="px-5 py-4">
                      <span className="pill-badge">{subscriber.unsubscribed ? "已退订" : "有效"}</span>
                    </td>
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
