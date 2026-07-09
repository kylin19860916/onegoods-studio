import Link from "next/link";
import { getAllPosts } from "@/lib/content";

export const metadata = {
  title: "选品日记",
  description: "OneGoods Studio 的选品、打样、拍摄与上架测试记录",
};

export default function JournalPage() {
  const posts = getAllPosts();

  return (
    <section className="mx-auto max-w-[800px] px-6 py-24">
      <p className="mb-6 text-sm font-semibold text-[color:var(--color-accent)]">
        Journal
      </p>
      <h1 className="font-display mb-4">选品日记</h1>
      <p className="text-[color:var(--color-fg-muted)] mb-16 max-w-xl">
        记录我们为什么选这个小物、手感如何、打印是否稳定，以及内容和电商反馈。
      </p>

      {posts.length === 0 ? (
        <p className="text-[color:var(--color-fg-muted)]">暂无文章。</p>
      ) : (
        <ul className="space-y-12">
          {posts.map((post) => (
            <li
              key={post.slug}
              className="group border-t border-[color:var(--color-border-subtle)] pt-8 cursor-pointer"
            >
              <Link href={`/journal/${post.slug}`} className="block">
                <div className="flex justify-between items-start gap-6">
                  <div className="flex-1">
                    <p className="mb-2 text-xs font-semibold text-[color:var(--color-fg-muted)]">
                      {post.category} · {post.date}
                    </p>
                    <h2 className="text-2xl group-hover:text-[color:var(--color-accent)] transition-colors mb-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-[color:var(--color-fg-muted)] text-sm leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                  <span className="text-[color:var(--color-fg-muted)] group-hover:text-[color:var(--color-accent)] transition-colors mt-2">
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
