import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-[800px] flex-col items-start px-6 py-32">
      <p className="mb-5 text-sm font-semibold text-[color:var(--color-accent)]">404</p>
      <h1 className="font-display mb-6">这个小物不在这里。</h1>
      <p className="mb-10 max-w-[50ch] text-lg leading-relaxed text-[color:var(--color-fg-muted)]">
        链接可能已经更新，或者这个页面还没上架。去 Shop 看看现在正在测试的小物吧。
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/shop" className="primary-cta">
          看全部小物
        </Link>
        <Link href="/" className="secondary-cta">
          回首页
        </Link>
      </div>
    </section>
  );
}
