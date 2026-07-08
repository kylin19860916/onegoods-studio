import Link from "next/link";
import { getAllPosts } from "@/lib/content";

export const metadata = {
  title: "选品日记",
  description: "OneGoods Studio 选品、打印、内容测试与上架记录",
};

export default function JournalPage() {
  const posts = getAllPosts({ includeDraft: true });

  return (
    <section className="mx-auto max-w-[800px] px-6 py-24">
      <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
        Selection journal
      </p>
      <h1 className="font-display mb-4">选品日记</h1>
      <p className="mb-16 max-w-xl text-[color:var(--color-fg-muted)]">
        记录每个解压小物从选品、打印、拍内容、上架到反馈复盘的过程。
      </p>

      {posts.length === 0 ? (
        <p className="text-[color:var(--color-fg-muted)]">暂无文章。</p>
      ) : (
        <ul className="space-y-12">
          {posts.map((post) => (
            <li
              key={post.slug}
              className="group cursor-pointer border-t border-[color:var(--color-border-subtle)] pt-8"
            >
              <Link href={`/journal/${post.slug}`} className="block">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <p className="mb-2 font-mono text-xs uppercase tracking-widest text-[color:var(--color-fg-muted)]">
                      {post.category} · {post.date}
                    </p>
                    <h2 className="mb-2 text-2xl transition-colors group-hover:text-[color:var(--color-accent)]">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                  <span className="mt-2 text-[color:var(--color-fg-muted)] transition-colors group-hover:text-[color:var(--color-accent)]">
                    →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
