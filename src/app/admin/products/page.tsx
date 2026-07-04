"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LogoutButton } from "@/components/admin/LogoutButton";

type AdminProduct = {
  slug: string;
  name: string;
  category: string;
  family?: string;
  sourceType?: string;
  badges?: string[];
  mood?: string[];
  motion?: string[];
  salesStatus?: string;
  purchaseLinks?: {
    shopee?: string;
    xiaohongshu?: string;
    instagram?: string;
    direct?: string;
  };
  priceUSD: number;
  priceLabel?: string;
  shortDesc: string;
  materials?: string;
  dimensions?: string;
  weight?: string;
  shipFrom?: string;
  shipTo?: string[];
  images?: string[];
  status: string;
  order: number;
  body: string;
};

const blankProduct: AdminProduct = {
  slug: "",
  name: "",
  category: "Stress Relief",
  family: "fruit",
  sourceType: "热门精选",
  badges: ["解压", "可爱", "桌面小物"],
  mood: ["解压", "桌面陪伴"],
  motion: ["按一下"],
  salesStatus: "testing",
  purchaseLinks: {},
  priceUSD: 0,
  priceLabel: "预计 NT$280 起",
  shortDesc: "",
  materials: "PLA / PETG 3D printed body",
  dimensions: "",
  weight: "",
  shipFrom: "AU",
  shipTo: ["CN", "AU", "HK", "MO", "TW"],
  images: ["/images/products/onegoods-stress-relief-goods.png"],
  status: "published",
  order: 10,
  body: [
    "## 它适合谁",
    "",
    "写给消费者看的使用场景。",
    "",
    "## 手感",
    "",
    "- 动作反馈",
    "- 触感特点",
    "- 适合拍摄的点",
    "",
    "## 下单前知道",
    "",
    "说明 3D 打印层纹、温度、使用年龄、批次差异等。",
  ].join("\n"),
};

function toCsv(values?: string[]) {
  return (values ?? []).join(", ");
}

function fromCsv(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function fromLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function TextField({
  label,
  value,
  onChange,
  required,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  helper?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <input
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-[0.9rem] border border-[color:var(--color-border)] bg-white px-4 outline-none focus:border-[color:var(--color-accent)]"
      />
      {helper && <span className="mt-2 block text-xs text-[color:var(--color-fg-muted)]">{helper}</span>}
    </label>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [draft, setDraft] = useState<AdminProduct>(blankProduct);
  const [message, setMessage] = useState("正在读取商品...");

  const hasProducts = useMemo(() => products.length > 0, [products]);

  async function loadProducts() {
    setMessage("正在读取商品...");
    const response = await fetch("/api/admin/products");
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "读取失败。线上使用需要先配置 ADMIN_TOKEN。");
    return;
  }
    setProducts(data.products);
    setMessage(`已读取 ${data.products.length} 个商品。`);
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadProducts();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  function updateField<Key extends keyof AdminProduct>(key: Key, value: AdminProduct[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("正在保存商品...");

    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(draft),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "保存失败。");
      return;
    }
    setSelectedSlug(data.slug);
    setMessage(`已保存：${data.file}。检查前台后发布到 main 即可上线。`);
    await loadProducts();
  }

  return (
    <main className="mx-auto max-w-[1200px] px-6 py-12">
      <div className="mb-10 max-w-3xl">
        <Link href="/admin" className="mb-4 inline-block text-sm font-semibold text-[color:var(--color-accent)]">
          OneGoods CMS
        </Link>
        <h1 className="font-display mb-5">商品库</h1>
        <p className="leading-relaxed text-[color:var(--color-fg-muted)]">
          新增、编辑、上下架商品资料。保存后会写入内容库，前台首页、Shop 和商品详情页会自动读取。
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-3 rounded-[1.5rem] border border-[color:var(--color-border)] bg-white/78 p-5 md:flex-row md:items-center md:justify-between">
        <p className="text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
          已登录 OneGoods CMS。商品保存后会写入内容库。
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => loadProducts()} className="primary-cta">
            重新读取
          </button>
          <LogoutButton />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white/78 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-2xl">商品列表</h2>
            <button
              type="button"
              onClick={() => {
                setSelectedSlug("");
                setDraft(blankProduct);
              }}
              className="secondary-cta min-h-10 px-4 py-2 text-sm"
            >
              新建
            </button>
          </div>
          <div className="space-y-2">
            {!hasProducts && (
              <p className="rounded-[1rem] bg-white p-3 text-sm text-[color:var(--color-fg-muted)]">
                暂无商品或还没有读取成功。
              </p>
            )}
            {products.map((product) => (
              <button
                key={product.slug}
                type="button"
                onClick={() => {
                  setSelectedSlug(product.slug);
                  setDraft(product);
                }}
                className={`w-full rounded-[1rem] border p-3 text-left transition-colors ${
                  selectedSlug === product.slug
                    ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)]"
                    : "border-[color:var(--color-border)] bg-white"
                }`}
              >
                <span className="block font-semibold">{product.name}</span>
                <span className="mt-1 block text-xs text-[color:var(--color-fg-muted)]">
                  /shop/{product.slug}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <form onSubmit={saveProduct} className="space-y-6 rounded-[1.5rem] border border-[color:var(--color-border)] bg-white/78 p-5 md:p-7">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Slug" value={draft.slug} onChange={(value) => updateField("slug", value)} required helper="/shop/ 后面的英文路径" />
            <TextField label="商品名" value={draft.name} onChange={(value) => updateField("name", value)} required />
            <TextField label="分类 category" value={draft.category} onChange={(value) => updateField("category", value)} />
            <TextField label="family" value={draft.family ?? ""} onChange={(value) => updateField("family", value)} helper="fruit / food / nature / studio" />
            <TextField label="sourceType" value={draft.sourceType ?? ""} onChange={(value) => updateField("sourceType", value)} />
            <TextField label="salesStatus" value={draft.salesStatus ?? "testing"} onChange={(value) => updateField("salesStatus", value)} helper="idea / testing / sample-ready / listed / sold-out / retired" />
            <TextField label="显示价格" value={draft.priceLabel ?? ""} onChange={(value) => updateField("priceLabel", value)} />
            <TextField label="排序 order" value={String(draft.order ?? 999)} onChange={(value) => updateField("order", Number(value))} />
          </div>

          <TextField label="一句话商品描述" value={draft.shortDesc} onChange={(value) => updateField("shortDesc", value)} required />

          <div className="grid gap-4 md:grid-cols-3">
            <TextField label="badges" value={toCsv(draft.badges)} onChange={(value) => updateField("badges", fromCsv(value))} helper="用逗号分隔" />
            <TextField label="mood" value={toCsv(draft.mood)} onChange={(value) => updateField("mood", fromCsv(value))} helper="用逗号分隔" />
            <TextField label="motion" value={toCsv(draft.motion)} onChange={(value) => updateField("motion", fromCsv(value))} helper="用逗号分隔" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <TextField label="材质" value={draft.materials ?? ""} onChange={(value) => updateField("materials", value)} />
            <TextField label="尺寸" value={draft.dimensions ?? ""} onChange={(value) => updateField("dimensions", value)} />
            <TextField label="重量" value={draft.weight ?? ""} onChange={(value) => updateField("weight", value)} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Shopee 链接" value={draft.purchaseLinks?.shopee ?? ""} onChange={(value) => updateField("purchaseLinks", { ...draft.purchaseLinks, shopee: value })} />
            <TextField label="小红书店链接" value={draft.purchaseLinks?.xiaohongshu ?? ""} onChange={(value) => updateField("purchaseLinks", { ...draft.purchaseLinks, xiaohongshu: value })} />
            <TextField label="Instagram 链接" value={draft.purchaseLinks?.instagram ?? ""} onChange={(value) => updateField("purchaseLinks", { ...draft.purchaseLinks, instagram: value })} />
            <TextField label="独立站链接" value={draft.purchaseLinks?.direct ?? ""} onChange={(value) => updateField("purchaseLinks", { ...draft.purchaseLinks, direct: value })} />
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">商品图片</span>
            <textarea
              value={(draft.images ?? []).join("\n")}
              onChange={(event) => updateField("images", fromLines(event.target.value))}
              rows={4}
              className="w-full rounded-[0.9rem] border border-[color:var(--color-border)] bg-white px-4 py-3 outline-none focus:border-[color:var(--color-accent)]"
            />
            <span className="mt-2 block text-xs text-[color:var(--color-fg-muted)]">
              每行一个图片路径，例如 /images/products/product.png
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">商品正文</span>
            <textarea
              value={draft.body}
              onChange={(event) => updateField("body", event.target.value)}
              rows={14}
              className="w-full rounded-[0.9rem] border border-[color:var(--color-border)] bg-white px-4 py-3 font-mono text-sm outline-none focus:border-[color:var(--color-accent)]"
            />
          </label>

          <div className="flex flex-col gap-3 border-t border-[color:var(--color-border)] pt-5 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-[color:var(--color-fg-muted)]">{message}</p>
            <button type="submit" className="primary-cta">
              保存商品
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
