import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { homeContentSchema } from "@/lib/home-content";

export async function POST(req: NextRequest) {
  const {error} = await requireStaff(); if (error) return error;
  try {
    const body = await req.json();
    if (body.action === "discard") { await prisma.siteSetting.deleteMany({where:{key:"draft:home"}}); return NextResponse.json({ok:true}); }
    if (!["draft","publish"].includes(body.action)) return NextResponse.json({error:"Неизвестное действие"},{status:400});
    const parsed = homeContentSchema.safeParse(body.content);
    if (!parsed.success) return NextResponse.json({error: "Проверьте тексты и ссылки на изображения"},{status:400});
    const key = body.action === "draft" ? "draft:home" : "home_content";
    const value = JSON.stringify(parsed.data);
    await prisma.$transaction(async tx => {
      await tx.siteSetting.upsert({where:{key},create:{key,value},update:{value}});
      if (body.action === "publish") await tx.siteSetting.deleteMany({where:{key:"draft:home"}});
    });
    return NextResponse.json({ok:true});
  } catch {return NextResponse.json({error:"Не удалось сохранить главную страницу"},{status:400});}
}
