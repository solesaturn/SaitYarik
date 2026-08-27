import Link from "next/link";
import { ConstructorWizard } from "@/components/ConstructorWizard";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Конструктор комплекта",
  description: "Соберите механизм и рамку Laitys одного цвета",
};

export const dynamic = "force-dynamic";

export default async function ConstructorPage() {
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
    <div className="mx-auto max-w-5xl px-4 py-12">
      <nav className="text-xs text-[var(--muted)]">
        <Link href="/">Главная</Link>
        {" / "}
        <span>Конструктор</span>
      </nav>
      <h1 className="section-title mt-3">Соберите комплект</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
        Сначала механизм, затем число постов и цвет. Несовместимые сочетания собрать нельзя: рамка и механизм только
        одного цвета, число постов рамки — 2, 3 или 4.
      </p>
      <ConstructorWizard products={products} />
    </div>
  );
}
