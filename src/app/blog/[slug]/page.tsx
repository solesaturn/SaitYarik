import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) notFound();
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="section-title">{post.title}</h1>
      <p className="mt-6 text-sm leading-relaxed text-[var(--muted)]">{post.content}</p>
    </article>
  );
}
