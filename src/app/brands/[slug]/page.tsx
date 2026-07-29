import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = await prisma.brand.findUnique({ where: { slug } });
  if (!brand) notFound();
  const session = await getSession();
  const products = await prisma.product.findMany({
    where: { brandId: brand.id, active: true },
    include: { brand: true },
  });
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="section-title">{brand.name}</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} b2bApproved={session?.b2bApproved} />
        ))}
      </div>
    </div>
  );
}
