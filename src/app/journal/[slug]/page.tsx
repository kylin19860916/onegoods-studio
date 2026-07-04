import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownBody } from "@/components/MarkdownBody";
import { getAllPosts, getPostBySlug } from "@/lib/content";

export async function generateStaticParams() {
  return getAllPosts({ includeDraft: true }).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Journal not found" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function JournalDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-[820px] px-6 py-20">
      <Link
        href="/journal"
        className="mb-8 inline-block text-sm text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-accent)]"
      >
        ← 返回选品日记
      </Link>

      <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
        {post.category} · {post.date}
      </p>
      <h1 className="font-display mb-6">{post.title}</h1>
      {post.excerpt && (
        <p className="mb-10 text-lg leading-relaxed text-[color:var(--color-fg-muted)]">
          {post.excerpt}
        </p>
      )}

      <section className="rounded-[2rem] border border-[color:var(--color-border)] bg-white/70 p-6 md:p-10">
        <MarkdownBody body={post.body} />
      </section>
    </article>
  );
}
