import Link from "next/link";
import { ConstructorWizard } from "@/components/ConstructorWizard";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Собрать блок",
  description: "Соберите рамку и механизмы Laitys одного цвета",
};

export const dynamic = "force-dynamic";

export default async function KitPage() {
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
      <h1 className="section-title mt-3">Собрать блок</h1>
      <ConstructorWizard products={products} />
    </div>
  );
}
