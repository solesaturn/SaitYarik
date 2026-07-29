import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SitemapHtmlPage() {
  const [categories, products, posts] = await Promise.all([
    prisma.category.findMany({ select: { slug: true, name: true } }),
    prisma.product.findMany({ where: { active: true }, select: { slug: true, name: true }, take: 200 }),
    prisma.blogPost.findMany({ select: { slug: true, title: true } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="section-title">Карта сайта</h1>
      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="font-semibold">Разделы</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {["/", "/catalog", "/b2b", "/account", "/delivery", "/about", "/contacts", "/blog", "/brands"].map((h) => (
              <li key={h}>
                <Link href={h} className="underline">
                  {h}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-semibold">Категории</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/catalog/${c.slug}`} className="underline">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-semibold">Товары</h2>
          <ul className="mt-2 max-h-80 space-y-1 overflow-auto text-sm">
            {products.map((p) => (
              <li key={p.slug}>
                <Link href={`/product/${p.slug}`} className="underline">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-semibold">Блог</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {posts.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="underline">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
