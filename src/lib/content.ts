import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_ROOT = path.join(process.cwd(), "content");

// =============================================================
// Products (MDX-driven SKU)
// =============================================================

export type Product = {
  slug: string;
  name: string;
  category: string;
  family?: string;
  sourceType?: string;
  badges?: string[];
  mood?: string[];
  motion?: string[];
  salesStatus?: "idea" | "testing" | "sample-ready" | "listed" | "sold-out" | "retired";
  purchaseLinks?: {
    shopee?: string;
    xiaohongshu?: string;
    instagram?: string;
    direct?: string;
  };
  priceUSD: number;
  shortDesc: string;
  materials?: string;
  dimensions?: string;
  weight?: string;
  shipFrom?: string;
  shipTo?: string[];
  images?: string[];
  status: "draft" | "published";
  order: number;
  body: string;
};

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string" && value.trim()) return value.split(",").map((item) => item.trim());
  return [];
}

function normalizeImages(value: unknown): string[] {
  return toStringArray(value).filter((src) => {
    if (src.startsWith("http")) return true;
    if (!src.startsWith("/")) return false;
    return fs.existsSync(path.join(process.cwd(), "public", src));
  });
}

function toPurchaseLinks(value: unknown): Product["purchaseLinks"] {
  if (!value || typeof value !== "object") return {};
  const raw = value as Record<string, unknown>;
  return {
    shopee: typeof raw.shopee === "string" ? raw.shopee : undefined,
    xiaohongshu: typeof raw.xiaohongshu === "string" ? raw.xiaohongshu : undefined,
    instagram: typeof raw.instagram === "string" ? raw.instagram : undefined,
    direct: typeof raw.direct === "string" ? raw.direct : undefined,
  };
}

export function getAllProducts(opts?: { includeDraft?: boolean }): Product[] {
  const dir = path.join(CONTENT_ROOT, "products");
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
  const products = files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const { data, content } = matter(raw);
    return {
      slug: data.slug ?? file.replace(/\.mdx$/, ""),
      name: data.name ?? "Untitled",
      category: data.category ?? "Misc",
      family: data.family,
      sourceType: data.sourceType,
      badges: toStringArray(data.badges),
      mood: toStringArray(data.mood),
      motion: toStringArray(data.motion),
      salesStatus: data.salesStatus ?? "testing",
      purchaseLinks: toPurchaseLinks(data.purchaseLinks),
      priceUSD: Number(data.priceUSD ?? 0),
      shortDesc: data.shortDesc ?? "",
      materials: data.materials,
      dimensions: data.dimensions,
      weight: data.weight,
      shipFrom: data.shipFrom ?? "AU",
      shipTo: data.shipTo ?? ["CN", "AU", "HK", "MO", "TW"],
      images: normalizeImages(data.images),
      status: (data.status ?? "draft") as "draft" | "published",
      order: Number(data.order ?? 999),
      body: content,
    };
  });
  return products
    .filter((p) => opts?.includeDraft || p.status === "published")
    .sort((a, b) => a.order - b.order);
}

export function getProductBySlug(slug: string): Product | null {
  return getAllProducts({ includeDraft: true }).find((p) => p.slug === slug) ?? null;
}

// =============================================================
// Journal posts (MDX-driven blog)
// =============================================================

export type JournalPost = {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  status: "draft" | "published";
  order: number;
  body: string;
};

export function getAllPosts(opts?: { includeDraft?: boolean }): JournalPost[] {
  const dir = path.join(CONTENT_ROOT, "journal");
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const { data, content } = matter(raw);
    // gray-matter parses unquoted YAML dates into Date objects;
    // coerce to ISO string so React can render it.
    const rawDate = data.date;
    const dateStr =
      rawDate instanceof Date
        ? rawDate.toISOString().slice(0, 10)
        : String(rawDate ?? "1970-01-01");

    return {
      slug: data.slug ?? file.replace(/\.mdx$/, ""),
      title: data.title ?? "Untitled",
      date: dateStr,
      category: data.category ?? "Journal",
      excerpt: data.excerpt ?? "",
      status: (data.status ?? "draft") as "draft" | "published",
      order: Number(data.order ?? 999),
      body: content,
    };
  });
  return posts
    .filter((p) => opts?.includeDraft || p.status === "published")
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getPostBySlug(slug: string): JournalPost | null {
  return getAllPosts({ includeDraft: true }).find((p) => p.slug === slug) ?? null;
}
