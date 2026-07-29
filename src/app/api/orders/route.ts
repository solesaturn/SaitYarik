import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { createYooKassaPayment } from "@/lib/yookassa";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const session = await getSession();
    const items = body.items as { productId: string; quantity: number; price: number }[];
    if (!items?.length) {
      return NextResponse.json({ error: "Корзина пуста" }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const orderItems = items.map((i) => {
      const p = byId.get(i.productId);
      if (!p) throw new Error("Товар не найден");
      subtotal += i.price * i.quantity;
      return {
        productId: p.id,
        name: p.name,
        sku: p.sku,
        price: i.price,
        quantity: i.quantity,
        packQty: p.packQty,
      };
    });

    let discount = 0;
    if (body.promoCode) {
      const promo = await prisma.promoCode.findUnique({ where: { code: String(body.promoCode).toUpperCase() } });
      if (promo?.active) {
        discount = promo.percent ? (subtotal * promo.percent) / 100 : promo.amount || 0;
      }
    }

    const deliveryMethod = body.deliveryMethod || "SELFPICKUP";
    let deliveryCost = 0;
    if (deliveryMethod !== "SELFPICKUP" && deliveryMethod !== "B2B_CUSTOM") {
      deliveryCost = subtotal >= 5000 ? 0 : deliveryMethod === "COURIER" ? 490 : 290;
    }

    const total = Math.max(0, subtotal - discount + deliveryCost);
    const paymentMethod = body.paymentMethod || "SBP";
    const number = generateOrderNumber();
    const needsOnlinePay = paymentMethod === "SBP" || paymentMethod === "CARD";

    const order = await prisma.order.create({
      data: {
        number,
        userId: session?.id,
        customerType: body.customerType === "B2B" ? "B2B" : "B2C",
        status: needsOnlinePay ? "AWAITING_PAYMENT" : "NEW",
        paymentMethod,
        deliveryMethod,
        email: body.email,
        phone: body.phone,
        name: body.name || null,
        companyName: body.companyName || null,
        inn: body.inn || null,
        kpp: body.kpp || null,
        legalAddress: body.legalAddress || null,
        deliveryAddress: body.deliveryAddress || null,
        comment: body.comment || null,
        subtotal,
        discount,
        deliveryCost,
        total,
        promoCode: body.promoCode || null,
        markingHandled: false,
        items: { create: orderItems },
      },
    });

    await prisma.syncLog.create({
      data: {
        type: "ORDER",
        direction: "SITE->1C",
        status: "QUEUED",
        message: `Заказ ${number} поставлен в очередь выгрузки CommerceML`,
      },
    });

    let paymentUrl: string | undefined;
    if (needsOnlinePay) {
      const payment = await createYooKassaPayment({
        amount: total,
        orderNumber: number,
        description: `Оплата заказа ${number}`,
        email: body.email,
        returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/payments/yookassa/return?order=${number}`,
      });
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentId: payment.id,
          fiscalReceiptUrl: payment.receiptUrl,
        },
      });
      paymentUrl = payment.confirmationUrl;
    }

    return NextResponse.json({ number: order.number, paymentUrl });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Ошибка" }, { status: 500 });
  }
}
