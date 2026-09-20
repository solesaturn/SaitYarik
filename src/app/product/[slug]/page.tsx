import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { displayProduct } from "@/lib/product-display";
import { ProductDetails } from "@/components/ProductDetails";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({params}:Props):Promise<Metadata> {
  const {slug}=await params;
  const product=await prisma.product.findUnique({where:{slug}});
  if(!product?.active)return {title:'Товар не найден'};
  const view=displayProduct(product);
  return {title:product.seoTitle||view.title,description:product.seoDescription||view.description};
}
export default async function ProductPage({params}:Props) {
  const {slug}=await params;
  const product=await prisma.product.findUnique({where:{slug},include:{categories:{include:{category:true}}}});
  if(!product?.active)notFound();
  return <ProductDetails product={product}/>;
}
