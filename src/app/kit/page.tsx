import Link from "next/link";
import { ConstructorWizard } from "@/components/ConstructorWizard";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Собрать блок",
  description: "Соберите рамку и механизмы Laitys одного цвета",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function KitPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const products = await prisma.product.findMany({
    where: { active: true },
    select: {
      id: true,
      slug: true,
      sku: true,
      name: true,
      color: true,
      posts: true,
      kitRole: true,
      productType: true,
      imageUrl: true,
      priceRetail: true,
      priceWholesale: true,
      stock: true,
      packQty: true,
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <nav className="text-xs text-[var(--muted)]">
        <Link href="/">Главная</Link>
        {" / "}
        <span>Собрать блок</span>
      </nav>
      <p className="mt-3 text-xs uppercase tracking-wide text-[var(--muted)]">Рамка + механизмы</p>
      <h1 className="section-title mt-2">Собрать блок</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
        Выберите размер и цвет рамки, затем наполните её розетками и выключателями. Состав и вид блока обновляются при каждом выборе.
      </p>
      <ConstructorWizard key={one(sp.preset) || "default"} products={products} preset={one(sp.preset)} />
    </div>
  );
}
