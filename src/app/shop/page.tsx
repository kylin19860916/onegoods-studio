import Link from "next/link";
import { getAllProducts, type Product } from "@/lib/content";
import { ProductImage } from "@/components/ProductImage";

export const metadata = {
  title: "Shop",
  description: "OneGoods Studio 解压 3D 打印小物",
};

const familyLabels: Record<string, string> = {
  fruit: "水果造型",
  food: "食物造型",
  nature: "自然造型",
  studio: "工坊候选",
};

const statusLabels: Record<NonNullable<Product["salesStatus"]>, string> = {
  idea: "候选中",
  testing: "首批测试",
  "sample-ready": "样品完成",
  listed: "已上架",
  "sold-out": "补货中",
  retired: "已下架",
};

const categoryLabels: Record<string, string> = {
  "Stress Relief": "解压小物",
  "Mini Case": "小收纳",
  "Modular System": "工坊候选",
};

const categoryTones = [
  "var(--color-peach)",
  "var(--color-butter)",
  "var(--color-mint)",
  "var(--color-sky)",
  "var(--color-lavender)",
];

function familyLabel(product: Product) {
  if (product.family && familyLabels[product.family]) return familyLabels[product.family];
  return categoryLabels[product.category] ?? product.category;
}

function productTags(product: Product) {
  return Array.from(
    new Set([
      ...(product.motion ?? []),
      ...(product.mood ?? []),
      ...(product.badges ?? []),
    ]),
  ).slice(0, 5);
}

function shopHref(query: { tag?: string; category?: string }) {
  return { pathname: "/shop", query, hash: "products" } as const;
}

function FilterPill({
  label,
  active,
  href,
}: {
  label: string;
  active: boolean;
  href: ReturnType<typeof shopHref>;
}) {
  return (
    <Link
      href={href}
      aria-pressed={active}
      className={`pill-badge transition-colors ${
        active
          ? "!border-[color:var(--color-accent)] !bg-[color:var(--color-accent)] !text-white"
          : "hover:!border-[color:var(--color-accent)] hover:!text-[color:var(--color-accent)]"
      }`}
    >
      {label}
    </Link>
  );
}

function ProductCard({ sku }: { sku: Product }) {
  const tags = productTags(sku);
  const status = statusLabels[sku.salesStatus ?? "testing"];
  const image = sku.images?.[0] ?? "/images/products/onegoods-stress-relief-goods.png";

  return (
    <Link href={`/shop/${sku.slug}`} className="group block">
      <div className="h-full overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white/78 shadow-[var(--shadow-card)] transition-transform group-hover:-translate-y-1">
        <div className="relative aspect-[4/3] overflow-hidden">
          <ProductImage
            src={image}
            alt={sku.name}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            className="transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
        <div className="p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="pill-badge">{status}</span>
            {tags.map((tag) => (
              <span key={tag} className="pill-badge">
                {tag}
              </span>
            ))}
          </div>
          <p className="mb-2 text-sm font-semibold text-[color:var(--color-accent)]">
            {familyLabel(sku)}
          </p>
          <h3 className="mb-3 text-2xl transition-colors group-hover:text-[color:var(--color-accent)]">
            {sku.name}
          </h3>
          <p className="mb-5 min-h-[4.5rem] leading-relaxed text-[color:var(--color-fg-muted)]">
            {sku.shortDesc}
          </p>
          <div className="flex items-center justify-between gap-4 border-t border-[color:var(--color-border-subtle)] pt-4 text-sm font-semibold">
            <span>{sku.priceLabel ?? (sku.priceUSD ? `$${sku.priceUSD} USD` : "价格准备中")}</span>
            <span className="text-[color:var(--color-accent)]">查看详情</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const products = getAllProducts().filter((product) => product.salesStatus !== "idea").sort((a, b) => {
    if (a.salesStatus === "testing" && b.salesStatus !== "testing") return -1;
    if (a.salesStatus !== "testing" && b.salesStatus === "testing") return 1;
    return a.order - b.order;
  });

  const categories = Array.from(new Set(products.map((product) => product.category)));
  const motionTags = Array.from(new Set(products.flatMap((product) => product.motion ?? [])));
  const moodTags = Array.from(new Set(products.flatMap((product) => product.mood ?? [])));

  const rawCategory = firstParam(params.category);
  const rawTag = firstParam(params.tag);
  const activeCategory = categories.includes(rawCategory ?? "") ? rawCategory : undefined;
  const activeTag = [...motionTags, ...moodTags].includes(rawTag ?? "") ? rawTag : undefined;

  const filtered = products.filter((product) => {
    if (activeCategory && product.category !== activeCategory) return false;
    if (activeTag) {
      const tags = [...(product.motion ?? []), ...(product.mood ?? []), ...(product.badges ?? [])];
      if (!tags.includes(activeTag)) return false;
    }
    return true;
  });

  const hasFilter = Boolean(activeCategory || activeTag);

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-20">
      <div className="mb-12 max-w-3xl">
        <p className="mb-5 text-sm font-semibold text-[color:var(--color-accent)]">Shop</p>
        <h1 className="font-display mb-6">选一个手边的小暂停。</h1>
        <p className="max-w-[66ch] text-lg leading-relaxed text-[color:var(--color-fg-muted)]">
          解压 3D 打印小物目录。先按系列、动作或情绪价值逛，再进入商品页查看购买状态。
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Link
          href={shopHref(activeTag ? { tag: activeTag } : {})}
          aria-pressed={!activeCategory}
          className={`rounded-[1.25rem] border bg-white/78 p-4 transition-transform hover:-translate-y-1 ${
            !activeCategory ? "border-[color:var(--color-accent)]" : "border-[color:var(--color-border)]"
          }`}
        >
          <div className="mb-4 h-2 w-16 rounded-full bg-[color:var(--color-accent)]" />
          <p className="font-display text-xl">全部小物</p>
          <p className="mt-1 text-sm text-[color:var(--color-fg-muted)]">{products.length} 款测试中</p>
        </Link>
        {categories.map((category, index) => {
          const count = products.filter((product) => product.category === category).length;
          const active = activeCategory === category;
          return (
            <Link
              href={shopHref({ category, ...(activeTag ? { tag: activeTag } : {}) })}
              key={category}
              aria-pressed={active}
              className={`rounded-[1.25rem] border bg-white/78 p-4 transition-transform hover:-translate-y-1 ${
                active ? "border-[color:var(--color-accent)]" : "border-[color:var(--color-border)]"
              }`}
            >
              <div
                className="mb-4 h-2 w-16 rounded-full"
                style={{ background: categoryTones[index % categoryTones.length] }}
              />
              <p className="font-display text-xl">{categoryLabels[category] ?? category}</p>
              <p className="mt-1 text-sm text-[color:var(--color-fg-muted)]">{count} 款</p>
            </Link>
          );
        })}
      </div>

      <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <div className="soft-panel p-5">
          <p className="mb-3 font-semibold">按解压动作找</p>
          <div className="flex flex-wrap gap-2">
            {motionTags.map((value) => (
              <FilterPill
                key={value}
                label={value}
                active={activeTag === value}
                href={shopHref(
                  activeTag === value
                    ? { ...(activeCategory ? { category: activeCategory } : {}) }
                    : { tag: value, ...(activeCategory ? { category: activeCategory } : {}) },
                )}
              />
            ))}
          </div>
        </div>
        <div className="soft-panel p-5">
          <p className="mb-3 font-semibold">按情绪价值找</p>
          <div className="flex flex-wrap gap-2">
            {moodTags.map((value) => (
              <FilterPill
                key={value}
                label={value}
                active={activeTag === value}
                href={shopHref(
                  activeTag === value
                    ? { ...(activeCategory ? { category: activeCategory } : {}) }
                    : { tag: value, ...(activeCategory ? { category: activeCategory } : {}) },
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {hasFilter && (
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold">
            {filtered.length} 款符合
            {activeCategory ? `「${categoryLabels[activeCategory] ?? activeCategory}」` : ""}
            {activeTag ? `「${activeTag}」` : ""}
          </span>
          <Link
            href={shopHref({})}
            className="font-semibold text-[color:var(--color-accent)] hover:underline"
          >
            清除筛选
          </Link>
        </div>
      )}

      {filtered.length === 0 ? (
        <div id="products" className="soft-panel p-8">
          <h2 className="mb-3 text-3xl">{hasFilter ? "这个组合暂时没有小物" : "商品正在准备中"}</h2>
          <p className="mb-5 text-[color:var(--color-fg-muted)]">
            {hasFilter
              ? "换一个动作或情绪价值看看，或者浏览全部测试款。"
              : "首批测试款上架后会出现在这里。"}
          </p>
          {hasFilter && (
            <Link href={shopHref({})} className="secondary-cta">
              看全部小物
            </Link>
          )}
        </div>
      ) : (
        <div id="products" className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((sku) => (
            <ProductCard key={sku.slug} sku={sku} />
          ))}
        </div>
      )}
    </section>
  );
}
