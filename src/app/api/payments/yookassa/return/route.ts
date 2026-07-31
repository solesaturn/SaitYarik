import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOrderAccessToken } from "@/lib/order-token";
import { fetchYooKassaPayment, isYooKassaLive } from "@/lib/yookassa";

/**
 * Return URL — только редирект на thanks.
 * PAID выставляется после проверки: live → API ЮKassa; demo → paymentId demo_* + токен заказа.
 */
export async function GET(req: NextRequest) {
  const orderNumber = req.nextUrl.searchParams.get("order");
  const token = req.nextUrl.searchParams.get("t");
  const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

  if (!orderNumber || !verifyOrderAccessToken(orderNumber, token)) {
    return NextResponse.redirect(new URL("/", base));
  }

  const order = await prisma.order.findUnique({ where: { number: orderNumber } });
  if (!order) return NextResponse.redirect(new URL("/", base));

  const thanks = new URL(`/thanks?order=${encodeURIComponent(order.number)}&t=${encodeURIComponent(token!)}`, base);

  if (order.status === "PAID") {
    return NextResponse.redirect(thanks);
  }

  if (order.paymentMethod !== "SBP" && order.paymentMethod !== "CARD") {
    return NextResponse.redirect(thanks);
  }

  let paid = false;

  if (isYooKassaLive() && order.paymentId && !order.paymentId.startsWith("demo_")) {
    const payment = await fetchYooKassaPayment(order.paymentId);
    if (
      payment &&
      (payment.status === "succeeded" || payment.status === "waiting_for_capture") &&
      Math.abs(Number(payment.amount.value) - order.total) < 0.01
    ) {
      paid = true;
    }
  } else if (
    req.nextUrl.searchParams.get("demo") === "1" &&
    order.paymentId?.startsWith("demo_") &&
    !isYooKassaLive()
  ) {
    // Демо-оплата: только свой заказ (токен уже проверен) и demo paymentId
    paid = true;
  }

  if (paid) {
    const receiptUrl =
      order.fiscalReceiptUrl ||
      `${base}/api/payments/receipt?order=${encodeURIComponent(order.number)}&t=${encodeURIComponent(token!)}`;
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        fiscalReceiptUrl: receiptUrl,
        syncedTo1c: false,
      },
    });
    await prisma.syncLog.create({
      data: {
        type: "PAYMENT",
        direction: "YOOKASSA->SITE",
        status: "OK",
        message: `Оплата ${order.number} подтверждена`,
      },
    });
  }

  return NextResponse.redirect(thanks);
}
