import { notFound, redirect } from "next/navigation";
import { getSession, isStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/AdminNav";
import { ProductEditForm } from "@/components/ProductEditForm";

export const dynamic = "force-dynamic";

export default async function AdminProductEdit({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isStaff(session.role)) redirect("/account");
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <AdminNav />
      <h1 className="section-title">{product.sku}</h1>
      <ProductEditForm product={product} />
    </div>
  );
}
