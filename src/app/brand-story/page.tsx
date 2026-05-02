export const metadata = {
  title: "品牌故事",
  description: "OneGoods Studio · 玩物工坊的品牌故事",
};

export default function BrandStoryPage() {
  return (
    <article className="mx-auto max-w-[800px] px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-accent)] mb-6">
        Brand Story
      </p>
      <h1 className="font-display mb-12">关于我们</h1>

      <div className="prose prose-invert max-w-none text-[color:var(--color-fg-muted)] space-y-6 leading-relaxed">
        <p className="text-xl text-[color:var(--color-fg)] leading-relaxed">
          [PRD §3 品牌定位 + §4 用户画像 内容 — 待填入]
        </p>
        <p>
          这里展开品牌故事：
          为什么从数码博主延伸到 Maker 品牌、
          OneGoods Studio 与 客林玩好物 的关系、
          MagBlock 等子品牌的由来、
          团队 / 工坊场景。
        </p>

        <div className="my-12 aspect-video bg-[color:var(--color-bg-elevated)] rounded-2xl border border-[color:var(--color-border)] flex items-center justify-center text-sm">
          [品牌故事配图 — 等 GPT Image 2.0 出图]
        </div>
      </div>
    </article>
  );
}

