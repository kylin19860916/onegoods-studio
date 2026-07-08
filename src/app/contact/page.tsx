import { SubscribeForm } from "@/components/SubscribeForm";

export const metadata = {
  title: "购买渠道",
  description: "OneGoods Studio · 购买渠道与上架提醒",
};

const channels = [
  ["虾皮", "正式上架销售，承接付款、物流、评价与台湾/东南亚订单。"],
  ["小红书店", "中文内容种草后的店铺成交入口，适合爆款测试和评论反馈。"],
  ["Instagram", "海外视觉内容和 Reels 入口，购买链接导回 OneGoods.studio。"],
  ["独立站", "品牌承接、商品故事、渠道入口与未来直营购买。"],
];

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-[900px] px-6 py-24">
      <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
        Where to buy
      </p>
      <h1 className="font-display mb-8">购买渠道与上架提醒</h1>
      <p className="mb-12 max-w-2xl leading-relaxed text-[color:var(--color-fg-muted)]">
        OneGoods 的四个渠道都会接入电商：独立站负责品牌承接，虾皮负责上架销售，小红书负责内容 + 店铺成交，Instagram 负责海外内容并导回独立站。
      </p>

      <div className="mb-16 grid grid-cols-1 gap-4 md:grid-cols-2">
        {channels.map(([title, desc]) => (
          <div key={title} className="studio-card p-5">
            <h2 className="mb-3 text-2xl">{title}</h2>
            <p className="text-sm leading-relaxed text-[color:var(--color-fg-muted)]">{desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-2xl">订阅上架提醒</h2>
          <p className="mb-6 leading-relaxed text-[color:var(--color-fg-muted)]">
            首批解压 3D 打印小物上架、补货或开放小批量测试时通知你。
          </p>
          <SubscribeForm />
        </div>

        <div>
          <h2 className="mb-4 text-2xl">直接联系</h2>
          <ul className="space-y-4 text-[color:var(--color-fg-muted)]">
            <li>
              <span className="block text-[color:var(--color-fg)]">商务 / 合作</span>
              <a href="mailto:hello@onegoods.studio" className="transition-colors hover:text-[color:var(--color-accent)]">
                hello@onegoods.studio
              </a>
            </li>
            <li>
              <span className="block text-[color:var(--color-fg)]">小红书</span>
              客林玩好物 / OneGoods 小物内容
            </li>
            <li>
              <span className="block text-[color:var(--color-fg)]">Instagram</span>
              账号与购买链接待接入
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
