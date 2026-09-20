import { notFound, redirect } from "next/navigation";
import { getSession, isStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/AdminNav";
import { ProductEditForm } from "@/components/ProductEditForm";
import { editorFromProduct, readDraft } from "@/lib/editor-server";
import type { ProductEditor } from "@/lib/product-content";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export default async function AdminProductEdit({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isStaff(session.role)) redirect("/account");
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include:{categories:true} });
  const draft = await readDraft(id);
  const categories = await prisma.category.findMany({orderBy:{sortOrder:'asc'}});
  if (!product && !draft && id !== 'new') notFound();
  const initial: ProductEditor = draft || (product ? editorFromProduct(product) : {
    name:'',sku:'',slug:'',description:'',color:'белый',series:'Zero',kitRole:'mechanism',productType:'механизм',warranty:'',posts:1,
    priceRetail:0,stock:0,active:true,constructorEnabled:false,attrs:{},photos:[],categoryIds:[],seoTitle:'',seoDescription:'',
  });
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <AdminNav />
      <h1 className="section-title">{initial.sku || 'Новый товар'}</h1>
      <ProductEditForm key={JSON.stringify(initial)} id={id === 'new' ? randomUUID() : id} product={initial} categories={categories} hasDraft={!!draft} />
    </div>
  );
}
