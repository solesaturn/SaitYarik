import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession, isStaff } from "@/lib/auth";
import { readDraft, productFields } from "@/lib/editor-server";
import { prisma } from "@/lib/prisma";
import { ProductDetails } from "@/components/ProductDetails";
export const dynamic = 'force-dynamic';
export const metadata = {title:'Предпросмотр товара',robots:{index:false,follow:false}};
export default async function PreviewProduct({params}:{params:Promise<{id:string}>}) {
  const session=await getSession();if(!session||!isStaff(session.role))redirect('/account');
  const {id}=await params;const draft=await readDraft(id);if(!draft)notFound();
  const categories=await prisma.category.findMany({where:{id:{in:draft.categoryIds}}});
  const existing=await prisma.product.findUnique({where:{id}});
  const product={...productFields(draft),id,priceWholesale:existing?.priceWholesale||0,packQty:existing?.packQty||1,certNumber:existing?.certNumber||null,documentsJson:existing?.documentsJson||'[]',categories:categories.map(category=>({category}))};
  return <><div className="bg-amber-100 p-4 text-center text-sm">Черновик. Посетители его не видят. <Link className="underline" href={`/admin/products/${id}`}>Вернуться в редактор</Link></div><ProductDetails product={product} preview/></>;
}
