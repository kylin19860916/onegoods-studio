import Link from "next/link";
import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/admin-auth";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { AdminStats } from "@/components/admin/AdminStats";

const modules = [
  {
    title: "商品库",
    desc: "新增、编辑、排序、上下架 OneGoods 商品。",
    href: "/admin/products",
    status: "可用",
  },
  {
    title: "销售记录",
    desc: "查看 Stripe Checkout 订单、成交金额、买家邮箱和付款状态。",
    href: "/admin/orders",
    status: "Stripe 只读",
  },
  {
    title: "用户信息",
    desc: "汇总 Stripe 买家和 Resend 邮件订阅者，方便看谁买过、谁在等待新品。",
    href: "/admin/customers",
    status: "Stripe + Resend",
  },
  {
    title: "购买渠道",
    desc: "给每个商品配置 Shopee、小红书店、Instagram 或独立站链接。",
    href: "/admin/products",
    status: "可用",
  },
];

const workflow = ["新增商品", "填写价格与状态", "添加商品图", "保存到内容库", "检查前台", "发布到 main"];

export default async function AdminHomePage() {
  if (!(await hasAdminSession())) {
    redirect("/admin/login?next=/admin");
  }

  return (
    <main className="mx-auto max-w-[1200px] px-6 py-12">
      <div className="mb-10 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
        <div>
          <p className="mb-4 text-sm font-semibold text-[color:var(--color-accent)]">OneGoods CMS</p>
          <h1 className="font-display mb-5">后台中心</h1>
          <p className="max-w-[60ch] leading-relaxed text-[color:var(--color-fg-muted)]">
            管理商品、分类、购买入口和上架状态。当前 CMS 使用内容文件作为商品库，适合 OneGoods 这种小批量选品上架节奏。
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white/78 p-5">
          <p className="mb-3 font-semibold">发布流程</p>
          <div className="flex flex-wrap gap-2">
            {workflow.map((item) => (
              <span key={item} className="pill-badge">
                {item}
              </span>
            ))}
          </div>
          <div className="mt-5">
            <LogoutButton />
          </div>
        </div>
      </div>

      <AdminStats />

      <section className="grid gap-5 md:grid-cols-2">
        {modules.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group rounded-[1.5rem] border border-[color:var(--color-border)] bg-white/78 p-6 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <h2 className="text-3xl group-hover:text-[color:var(--color-accent)]">{item.title}</h2>
              <span className="pill-badge">{item.status}</span>
            </div>
            <p className="leading-relaxed text-[color:var(--color-fg-muted)]">{item.desc}</p>
          </Link>
        ))}
      </section>

      <section className="mt-10 rounded-[1.5rem] bg-[color:var(--color-bg-dark)] p-6 text-white md:p-8">
        <h2 className="mb-4 text-3xl text-white">现在可以怎么用</h2>
        <p className="max-w-[72ch] leading-relaxed text-white/72">
          在本地打开 CMS，新增或编辑商品，保存后会写入 `content/products`。销售记录和用户信息从 Stripe、Resend 实时读取，只做轻量查看。退款、发票和邮件名单维护仍然回各自 dashboard 处理。
        </p>
      </section>
    </main>
  );
}
