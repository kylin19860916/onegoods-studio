export const metadata = {
  title: "关于",
  description: "OneGoods Studio 的选品与小批量 3D 打印方式",
};

export default function BrandStoryPage() {
  return (
    <article className="mx-auto max-w-[800px] px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-accent)] mb-6">
        Brand Story
      </p>
      <h1 className="font-display mb-12">小而快的解压小物实验室。</h1>

      <div className="prose prose-invert max-w-none text-[color:var(--color-fg-muted)] space-y-6 leading-relaxed">
        <p className="text-xl text-[color:var(--color-fg)] leading-relaxed">
          OneGoods Studio 挑选、打印并测试那些可爱、有触感、适合日常把玩的 3D 打印小物。
        </p>
        <p>
          我们不急着做大而全的商城，也不一开始堆很多复杂产品。现阶段更像一个选品实验室：先从解压感、可爱度、打印稳定度、内容表现和电商成交潜力判断小物是否值得打样。
        </p>
        <p>
          每个候选款都会经历一个很直接的流程：选品、打印、拍内容、上架、看反馈，再决定是否继续放大。真正重要的不是“看起来有很多 SKU”，而是找到那些 3 秒内能被看懂、拿在手里有爽感、放在桌面也愿意留下的小东西。
        </p>
        <p>
          OneGoods 与创作者账号的关系会留在幕后。对消费者来说，OneGoods Studio 就是一个专注解压和情绪价值小物的品牌。
        </p>

        <div className="my-12 aspect-video bg-[color:var(--color-bg-elevated)] rounded-2xl border border-[color:var(--color-border)] flex items-center justify-center text-sm">
          首批商品实拍准备中
        </div>
      </div>
    </article>
  );
}
