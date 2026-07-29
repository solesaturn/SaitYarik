import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } });
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="section-title">Блог</h1>
      <div className="mt-8 space-y-4">
        {posts.map((p) => (
          <Link key={p.id} href={`/blog/${p.slug}`} className="block border border-[var(--line)] bg-white p-5 hover:border-[var(--ink)]">
            <h2 className="text-xl font-semibold">{p.title}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{p.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
