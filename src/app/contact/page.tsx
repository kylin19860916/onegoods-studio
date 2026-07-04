import { SubscribeForm } from "@/components/SubscribeForm";

export const metadata = {
  title: "联系",
  description: "OneGoods Studio 上新提醒与购买渠道",
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-[800px] px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-accent)] mb-6">
        Contact
      </p>
      <h1 className="font-display mb-12">保持联系</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Email subscribe */}
        <div>
          <h2 className="text-2xl mb-4">订阅上新提醒</h2>
          <p className="text-[color:var(--color-fg-muted)] mb-6 leading-relaxed">
            首批测试款开放购买、补货或上新时通知你。频率很低，只发真正有用的更新。
          </p>
          <SubscribeForm />
        </div>

        {/* Direct contact */}
        <div>
          <h2 className="text-2xl mb-4">购买与合作</h2>
          <ul className="space-y-4 text-[color:var(--color-fg-muted)]">
            <li>
              <span className="text-[color:var(--color-fg)] block">Email</span>
              <a href="mailto:hello@onegoods.studio" className="hover:text-[color:var(--color-accent)] transition-colors">
                hello@onegoods.studio
              </a>
            </li>
            <li>
              <span className="text-[color:var(--color-fg)] block">Shopee</span>
              商品上架后会放入对应商品页。
            </li>
            <li>
              <span className="text-[color:var(--color-fg)] block">小红书 / Instagram</span>
              用于查看实拍内容、测试款反馈和购买入口。
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
