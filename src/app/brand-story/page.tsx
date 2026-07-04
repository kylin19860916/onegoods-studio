export const metadata = {
  title: "关于",
  description: "OneGoods Studio 的选品与小批量 3D 打印方式",
};

const principles = [
  {
    title: "先让手想碰",
    desc: "一个款式能不能留下来，先看动作是否直觉、手感是否反复、视频里是否一眼看懂。",
  },
  {
    title: "少量测试，不急着铺货",
    desc: "首批商品会先打样、拍摄、上架，再根据真实询问和成交决定是否放大。",
  },
  {
    title: "把制作特征说清楚",
    desc: "3D 打印会有层纹和批次差异。我们会把材质、尺寸、出货状态和注意事项写清楚。",
  },
];

export default function BrandStoryPage() {
  return (
    <article className="mx-auto max-w-[1000px] px-6 py-24">
      <div className="mb-14 max-w-3xl">
        <p className="mb-5 text-sm font-semibold text-[color:var(--color-accent)]">
          About OneGoods
        </p>
        <h1 className="font-display mb-6">我们做小小的解压物，也做清楚的选品。</h1>
        <p className="text-lg leading-relaxed text-[color:var(--color-fg-muted)]">
          OneGoods Studio 是一个专注解压和情绪价值 3D 打印小物的选品型品牌。我们把好玩、可爱、有触感的小东西做成少量测试款，再用内容和电商反馈决定下一步。
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {principles.map((item) => (
          <div key={item.title} className="soft-panel p-6">
            <h2 className="mb-4 text-2xl">{item.title}</h2>
            <p className="leading-relaxed text-[color:var(--color-fg-muted)]">{item.desc}</p>
          </div>
        ))}
      </div>

      <section className="mt-14 grid gap-8 rounded-[2rem] bg-[color:var(--color-bg-dark)] p-6 text-[color:var(--color-fg-dark)] md:grid-cols-[0.9fr_1.1fr] md:p-10">
        <div>
          <h2 className="font-display mb-4">品牌不是个人副业页。</h2>
          <p className="leading-relaxed text-white/72">
            创作者和工坊经验会留在幕后。消费者看到的 OneGoods，应该是一个有审美、有说明、有购买路径的小物品牌。
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {["解压手感", "可爱造型", "小批量 3D 打印", "多渠道购买"].map((item) => (
            <div key={item} className="rounded-[1rem] border border-white/10 bg-white/6 p-4 font-semibold">
              {item}
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
