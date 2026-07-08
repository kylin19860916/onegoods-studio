export const metadata = {
  title: "关于 OneGoods",
  description: "OneGoods Studio · 解压 / 情绪价值 3D 打印小物选品品牌",
};

export default function BrandStoryPage() {
  return (
    <article className="mx-auto max-w-[860px] px-6 py-24">
      <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
        About OneGoods
      </p>
      <h1 className="font-display mb-12">我们先做那些真的想被拿在手里的小东西。</h1>

      <div className="space-y-8 text-[color:var(--color-fg-muted)] leading-relaxed">
        <p className="text-xl leading-relaxed text-[color:var(--color-fg)]">
          OneGoods Studio 是一个解压 / 情绪价值 3D 打印小物选品品牌。我们不急着做很多 SKU，而是用小批量打印和内容测试，找到那些让人想捏一下、转一下、挂起来、放在桌上的小物。
        </p>
        <p>
          3D 打印让一个小想法可以很快变成真实商品：先从现有设计和可打印结构里选款，验证打印稳定度、手感、内容表现和电商反馈，再决定是否放大成系列。
        </p>
        <div className="studio-card grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
          {[
            ["选品", "看解压感、可爱度、内容好拍度。"],
            ["小批量打印", "先打样，不一开始压大量库存。"],
            ["多渠道测试", "独立站、虾皮、小红书店、Instagram 同步验证。"],
          ].map(([title, desc]) => (
            <div key={title}>
              <h2 className="mb-3 text-2xl">{title}</h2>
              <p className="text-sm leading-relaxed text-[color:var(--color-fg-muted)]">{desc}</p>
            </div>
          ))}
        </div>
        <p>
          这也是为什么 OneGoods 更像一个「选品实验室」：每一款小物都要经过真实内容和真实购买入口的测试。喜欢的人多，我们就继续优化颜色、包装、渠道和补货；反应普通，就快速换下一款。
        </p>
      </div>
    </article>
  );
}
