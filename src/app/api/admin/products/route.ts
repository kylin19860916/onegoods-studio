import fs from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "@/lib/content";
import { hasAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

const PRODUCTS_DIR = path.join(process.cwd(), "content", "products");

type ProductPayload = {
  slug: string;
  name: string;
  category: string;
  family?: string;
  sourceType?: string;
  badges?: string[];
  mood?: string[];
  motion?: string[];
  salesStatus?: string;
  priceUSD?: number;
  priceLabel?: string;
  shortDesc: string;
  materials?: string;
  dimensions?: string;
  weight?: string;
  shipFrom?: string;
  shipTo?: string[];
  images?: string[];
  status?: string;
  order?: number;
  purchaseLinks?: {
    shopee?: string;
    xiaohongshu?: string;
    instagram?: string;
    direct?: string;
  };
  body?: string;
};

function sanitizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function yamlString(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "''");
}

function yamlArray(values?: string[]) {
  const clean = (values ?? []).map((item) => item.trim()).filter(Boolean);
  if (clean.length === 0) return "[]";
  return `[${clean.map((item) => `'${yamlString(item)}'`).join(", ")}]`;
}

function optionalLine(key: string, value?: string | number) {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value === "number") return `${key}: ${value}\n`;
  return `${key}: ${yamlString(value)}\n`;
}

function buildProductMdx(product: ProductPayload) {
  const slug = sanitizeSlug(product.slug);
  const links = product.purchaseLinks ?? {};
  const images = (product.images ?? []).map((src) => src.trim()).filter(Boolean);
  const body = product.body?.trim() || [
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
  ].join("\n");

  return [
    "---",
    `slug: ${slug}`,
    `name: ${yamlString(product.name)}`,
    `category: ${yamlString(product.category || "Stress Relief")}`,
    optionalLine("family", product.family).trimEnd(),
    optionalLine("sourceType", product.sourceType).trimEnd(),
    `badges: ${yamlArray(product.badges)}`,
    `mood: ${yamlArray(product.mood)}`,
    `motion: ${yamlArray(product.motion)}`,
    `salesStatus: ${product.salesStatus || "testing"}`,
    "purchaseLinks:",
    `  shopee: ${links.shopee ?? ""}`,
    `  xiaohongshu: ${links.xiaohongshu ?? ""}`,
    `  instagram: ${links.instagram ?? ""}`,
    `  direct: ${links.direct ?? ""}`,
    `priceUSD: ${Number(product.priceUSD ?? 0)}`,
    optionalLine("priceLabel", product.priceLabel).trimEnd(),
    `shortDesc: ${yamlString(product.shortDesc)}`,
    optionalLine("materials", product.materials).trimEnd(),
    optionalLine("dimensions", product.dimensions).trimEnd(),
    optionalLine("weight", product.weight).trimEnd(),
    `shipFrom: ${yamlString(product.shipFrom || "AU")}`,
    `shipTo: ${yamlArray(product.shipTo?.length ? product.shipTo : ["CN", "AU", "HK", "MO", "TW"])}`,
    "images:",
    ...(images.length ? images.map((src) => `  - ${src}`) : ["  - /images/products/onegoods-stress-relief-goods.png"]),
    `status: ${product.status || "published"}`,
    `order: ${Number(product.order ?? 999)}`,
    "---",
    "",
    body,
    "",
  ].filter((line) => line !== "").join("\n");
}

export async function GET() {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Please log in to OneGoods CMS." }, { status: 401 });
  }

  return NextResponse.json({ products: getAllProducts({ includeDraft: true }) });
}

export async function POST(request: NextRequest) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Please log in to OneGoods CMS." }, { status: 401 });
  }

  const product = (await request.json()) as ProductPayload;
  const slug = sanitizeSlug(product.slug);
  if (!slug || !product.name || !product.shortDesc) {
    return NextResponse.json({ error: "Slug, name, and short description are required." }, { status: 400 });
  }

  fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
  const filePath = path.join(PRODUCTS_DIR, `${slug}.mdx`);
  fs.writeFileSync(filePath, buildProductMdx({ ...product, slug }), "utf-8");

  return NextResponse.json({ ok: true, slug, file: `content/products/${slug}.mdx` });
}
