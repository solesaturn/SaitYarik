import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchYooKassaPayment, isYooKassaLive } from "@/lib/yookassa";
import { orderAccessToken } from "@/lib/order-token";

/**
 * Webhook ЮKassa: https://yookassa.ru/developers/using-api/webhooks
 * Подтверждаем статус через API (не доверяем телу целиком).
 */
export async function POST(req: NextRequest) {
  if (!isYooKassaLive()) {
    return NextResponse.json({ error: "Live YooKassa only" }, { status: 400 });
  }

  let body: { event?: string; object?: { id?: string } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const paymentId = body.object?.id;
  if (!paymentId) return NextResponse.json({ error: "No payment id" }, { status: 400 });

  const payment = await fetchYooKassaPayment(paymentId);
  if (!payment || payment.status !== "succeeded") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const order =
    (await prisma.order.findFirst({ where: { paymentId } })) ||
    (payment.metadata?.orderNumber
      ? await prisma.order.findUnique({ where: { number: payment.metadata.orderNumber } })
      : null);

  if (!order) return NextResponse.json({ ok: true, ignored: true });

  if (Math.abs(Number(payment.amount.value) - order.total) >= 0.01) {
    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
  }

  if (order.status !== "PAID") {
    const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const t = orderAccessToken(order.number);
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paymentId,
        fiscalReceiptUrl:
          order.fiscalReceiptUrl ||
          `${base}/api/payments/receipt?order=${encodeURIComponent(order.number)}&t=${encodeURIComponent(t)}`,
        syncedTo1c: false,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
