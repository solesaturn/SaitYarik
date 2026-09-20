import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/admin";
import { productEditorSchema } from "@/lib/product-content";
import { productFields } from "@/lib/editor-server";

export async function POST(req: NextRequest) {
  const { error } = await requireStaff(); if (error) return error;
  try {
    // Quick price/stock edits are explicitly immediate; the full editor saves drafts.
    if (!req.headers.get("content-type")?.includes("application/json")) {
      const form = await req.formData();
      const id = String(form.get("id") || "");
      const priceRetail = Number(form.get("priceRetail")); const stock = Number(form.get("stock"));
      if (!id || !Number.isFinite(priceRetail) || priceRetail < 0 || !Number.isInteger(stock) || stock < 0) return NextResponse.json({error:"Проверьте цену и остаток"}, {status:400});
      await prisma.product.update({where:{id},data:{priceRetail,stock}});
      return NextResponse.json({ok:true,id});
    }
    const body = await req.json();
    const id = String(body.id || "");
    if (!/^[a-zA-Z0-9-]{1,80}$/.test(id) || !["draft","publish","discard"].includes(body.action)) return NextResponse.json({error:"Некорректный запрос"},{status:400});
    const key = `draft:product:${id}`;
    if (body.action === "discard") {
      await prisma.siteSetting.deleteMany({where:{key}}); return NextResponse.json({ok:true,id});
    }
    const parsed = productEditorSchema.safeParse(body.product);
    if (!parsed.success) return NextResponse.json({error:parsed.error.issues.map(i=>i.message).join(". ")},{status:400});
    const product = parsed.data;
    const conflict = await prisma.product.findFirst({where:{id:{not:id},OR:[{sku:product.sku},{slug:product.slug}]},select:{id:true}});
    if (conflict) return NextResponse.json({error:"Артикул или адрес уже занят другим товаром"},{status:409});
    const categoryCount = await prisma.category.count({where:{id:{in:product.categoryIds}}});
    if (categoryCount !== new Set(product.categoryIds).size) return NextResponse.json({error:"Категория не найдена"},{status:400});
    if (body.action === "draft") {
      const value = JSON.stringify(product);
      await prisma.siteSetting.upsert({where:{key},create:{key,value},update:{value}});
    } else {
      const data = productFields(product);
      await prisma.$transaction(async tx => {
        await tx.product.upsert({where:{id},create:{id,...data,priceWholesale:0},update:data});
        await tx.productCategory.deleteMany({where:{productId:id}});
        for (const categoryId of new Set(product.categoryIds)) await tx.productCategory.create({data:{productId:id,categoryId}});
        await tx.siteSetting.deleteMany({where:{key}});
      });
    }
    return NextResponse.json({ok:true,id});
  } catch {
    return NextResponse.json({error:"Не удалось сохранить товар. Проверьте данные и повторите."},{status:400});
  }
}
