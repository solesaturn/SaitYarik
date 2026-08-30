import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return { title: "Категория" };
  return {
    title: category.seoTitle || category.name,
    description: category.seoDescription || category.description || undefined,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const products = await prisma.product.findMany({
    where: { active: true, categories: { some: { categoryId: category.id } } },
    include: { brand: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
      <nav className="text-xs text-[var(--muted)]">
        <Link href="/">Главная</Link>
        {" > "}
        <Link href="/catalog">Каталог</Link>
        {" > "}
        <span>{category.name}</span>
      </nav>
      <h1 className="section-title mt-3">{category.name}</h1>
      {category.description && <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">{category.description}</p>}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
