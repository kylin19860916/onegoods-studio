import Link from "next/link";
import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/admin-auth";
import { LogoutButton } from "@/components/admin/LogoutButton";

const modules = [
  {
    title: "商品库",
    desc: "新增、编辑、排序、上下架 OneGoods 商品。",
    href: "/admin/products",
    status: "可用",
  },
  {
    title: "集合与分类",
    desc: "管理 Best Sellers、New Arrivals、Desk Buddies 等首页集合。",
    href: "/admin/products",
    status: "商品标签驱动",
  },
  {
    title: "购买渠道",
    desc: "给每个商品配置 Shopee、小红书店、Instagram 或独立站链接。",
    href: "/admin/products",
    status: "可用",
  },
  {
    title: "素材库",
    desc: "管理商品图、场景图和后续短视频素材。",
    href: "/admin/products",
    status: "图片路径驱动",
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
          在本地打开 CMS，新增或编辑商品，保存后会写入 `content/products`。检查前台没问题后推到 main，线上站会自动更新。后续如果要像 Shopify 一样在线保存，需要继续接数据库、图片上传和登录权限。
        </p>
      </section>
    </main>
  );
}
