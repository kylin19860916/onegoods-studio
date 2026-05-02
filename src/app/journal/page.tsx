export const metadata = {
  title: "工坊日记",
  description: "Maker 实践记录 / 桌面 setup / 设计幕后",
};

const placeholderPosts = [
  { slug: "magblock-from-zero", title: "MagBlock 从 0 到 1：14 天做出磁吸桌面系统", date: "2026-04-22", category: "Maker 日记" },
  { slug: "5-ai-employees-trim", title: "5 个 AI 员工，我裁到 2 个反而更稳", date: "2026-05-02", category: "AI 工作流" },
  { slug: "industrial-monogram-design", title: "OneGoods Studio Logo 设计过程", date: "2026-05-01", category: "品牌设计" },
];

export default function JournalPage() {
  return (
    <section className="mx-auto max-w-[800px] px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-accent)] mb-6">
        Journal
      </p>
      <h1 className="font-display mb-4">工坊日记</h1>
      <p className="text-[color:var(--color-fg-muted)] mb-16 max-w-xl">
        Maker 实践记录 · 设计幕后 · 桌面 setup · AI 工作流。
      </p>

      <ul className="space-y-12">
        {placeholderPosts.map((post) => (
          <li
            key={post.slug}
            className="group border-t border-[color:var(--color-border-subtle)] pt-8 cursor-pointer"
          >
            <div className="flex justify-between items-start gap-6">
              <div className="flex-1">
                <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-fg-muted)] mb-2">
                  {post.category} · {post.date}
                </p>
                <h2 className="text-2xl group-hover:text-[color:var(--color-accent)] transition-colors">
                  {post.title}
                </h2>
              </div>
              <span className="text-[color:var(--color-fg-muted)] group-hover:text-[color:var(--color-accent)] transition-colors mt-2">
                →
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

