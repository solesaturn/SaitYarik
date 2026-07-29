import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } });
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="section-title">Бренды</h1>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((b) => (
          <Link key={b.id} href={`/brands/${b.slug}`} className="border border-[var(--line)] bg-white p-5 hover:border-[var(--ink)]">
            <p className="font-[family-name:var(--font-display)] text-xl">{b.name}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{b._count.products} товаров</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
