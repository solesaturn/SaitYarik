import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json();
  const promo = await prisma.promoCode.findUnique({
    where: { code: String(code || "").toUpperCase() },
  });
  if (!promo || !promo.active) {
    return NextResponse.json({ error: "Промокод не найден" }, { status: 404 });
  }
  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return NextResponse.json({ error: "Промокод истёк" }, { status: 400 });
  }
  const discount = promo.percent ? (Number(subtotal) * promo.percent) / 100 : promo.amount || 0;
  return NextResponse.json({ discount, code: promo.code });
}
