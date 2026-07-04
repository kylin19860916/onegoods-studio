import { SubscribeForm } from "@/components/SubscribeForm";

export const metadata = {
  title: "联系",
  description: "OneGoods Studio 上新提醒与购买渠道",
};

const contactItems = [
  {
    title: "购买渠道",
    desc: "商品开放后，每个商品页会放 Shopee、小红书店、Instagram 或独立站购买入口。",
  },
  {
    title: "合作与询问",
    desc: "商品合作、授权、拍摄或批量需求可以发邮件到 hello@onegoods.studio。",
  },
  {
    title: "上新提醒",
    desc: "首批测试款开放购买、补货或新增颜色时，我们会优先通知订阅用户。",
  },
];

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-[1000px] px-6 py-24">
      <div className="mb-12 max-w-3xl">
        <p className="mb-5 text-sm font-semibold text-[color:var(--color-accent)]">Contact</p>
        <h1 className="font-display mb-6">想知道什么时候可以买？</h1>
        <p className="text-lg leading-relaxed text-[color:var(--color-fg-muted)]">
          留下邮箱。首批小物上架、补货、开放新颜色时，我们会发一封简短提醒。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[0.95fr_1.05fr]">
        <div className="soft-panel p-6 md:p-8">
          <h2 className="mb-4 text-3xl">订阅上新提醒</h2>
          <p className="mb-6 leading-relaxed text-[color:var(--color-fg-muted)]">
            不发长篇邮件，只通知真正开放购买、补货或重要更新。
          </p>
          <SubscribeForm />
        </div>

        <div className="grid gap-4">
          {contactItems.map((item) => (
            <div key={item.title} className="rounded-[1.25rem] border border-[color:var(--color-border)] bg-white/70 p-5">
              <h2 className="mb-2 text-2xl">{item.title}</h2>
              <p className="leading-relaxed text-[color:var(--color-fg-muted)]">{item.desc}</p>
            </div>
          ))}
          <a
            href="mailto:hello@onegoods.studio"
            className="secondary-cta justify-start"
          >
            hello@onegoods.studio
          </a>
        </div>
      </div>
    </section>
  );
}
