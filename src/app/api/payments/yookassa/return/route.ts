import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const orderNumber = req.nextUrl.searchParams.get("order");
  if (!orderNumber) return NextResponse.redirect(new URL("/", req.url));

  const order = await prisma.order.findUnique({ where: { number: orderNumber } });
  if (!order) return NextResponse.redirect(new URL("/", req.url));

  // Mark online payments as paid; fiscal receipt demo URL
  if (order.paymentMethod === "SBP" || order.paymentMethod === "CARD") {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        fiscalReceiptUrl:
          order.fiscalReceiptUrl ||
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/payments/receipt?order=${order.number}`,
        syncedTo1c: false,
      },
    });
    await prisma.syncLog.create({
      data: {
        type: "PAYMENT",
        direction: "YOOKASSA->SITE",
        status: "OK",
        message: `Оплата ${order.number} подтверждена, чек 54-ФЗ сформирован (облачная касса)`,
      },
    });
  }

  return NextResponse.redirect(new URL(`/thanks?order=${order.number}`, req.url));
}
