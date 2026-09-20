import Link from "next/link";
import { ConstructorWizard } from "@/components/ConstructorWizard";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Собрать блок",
  description: "Соберите блок из рамки и модулей Laitys одного цвета на 2, 3 или 4 поста",
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
      attrsJson: true,
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <nav className="text-xs text-[var(--muted)]">
        <Link href="/">Главная</Link>
        {" / "}
        <span>Собрать блок</span>
      </nav>
      <p className="mt-3 text-xs uppercase tracking-wide text-[var(--muted)]">Рамка + модули</p>
      <h1 className="section-title mt-2">Соберите блок из рамки и модулей</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
        Выберите рамку на 2, 3 или 4 поста, цвет и по одному модулю для каждой позиции. Состав комплекта и схема обновятся автоматически.
      </p>
      <ConstructorWizard key={one(sp.preset) || "default"} products={products} preset={one(sp.preset)} />
    </div>
  );
}
