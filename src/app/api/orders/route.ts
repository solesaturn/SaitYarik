import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateOrderNumber, packQuantity } from "@/lib/utils";
import { createYooKassaPayment } from "@/lib/yookassa";
import { hasConfirmedPrice } from "@/lib/pricing";
import { orderAccessToken } from "@/lib/order-token";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { isValidRuPhone, toE164 } from "@/lib/phone";
import { notifyStaff } from "@/lib/notify";

export async function POST(req: NextRequest) {
  try {
    const rl = rateLimit(`orders:${clientIp(req)}`, 20, 60_000);
    if (!rl.ok) {
      return NextResponse.json({ error: "Слишком много запросов" }, { status: 429 });
    }

    const body = await req.json();
    const session = await getSession();
    const items = body.items as { productId: string; quantity: number }[];
    if (!items?.length) {
      return NextResponse.json({ error: "Корзина пуста" }, { status: 400 });
    }
    if (items.length > 100) {
      return NextResponse.json({ error: "Слишком много позиций" }, { status: 400 });
    }

    const phone = String(body.phone || "");
    if (!isValidRuPhone(phone)) {
      return NextResponse.json({ error: "Некорректный телефон" }, { status: 400 });
    }

    const email = String(body.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Укажите e-mail" }, { status: 400 });
    }

    const name = String(body.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Укажите имя" }, { status: 400 });
    }

    const deliveryAddress = String(body.deliveryAddress || "").trim();
    if (!deliveryAddress) {
      return NextResponse.json({ error: "Укажите адрес доставки" }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) }, active: true },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const orderItems = items.map((i) => {
      const p = byId.get(i.productId);
      if (!p) throw new Error("Товар не найден");
      if (!hasConfirmedPrice(p)) {
        throw new Error(`Нет подтверждённой цены: ${p.sku}`);
      }
      const qtyRaw = Number(i.quantity);
      if (!Number.isFinite(qtyRaw) || qtyRaw <= 0 || qtyRaw > 10_000) {
        throw new Error("Некорректное количество");
      }
      const quantity = packQuantity(qtyRaw, p.packQty || 1);
      if (p.stock > 0 && quantity > p.stock) {
        throw new Error(`Недостаточно на складе: ${p.sku}`);
      }
      const price = p.priceRetail;
      subtotal += price * quantity;
      return {
        productId: p.id,
        name: p.name,
        sku: p.sku,
        price,
        quantity,
        packQty: p.packQty,
      };
    });

    const deliveryCost = 0;
    const total = subtotal;
    const number = generateOrderNumber();
    const accessToken = orderAccessToken(number);
    const base = req.nextUrl.origin;

    const order = await prisma.order.create({
      data: {
        number,
        userId: session?.id,
        customerType: "B2C",
        status: "AWAITING_PAYMENT",
        paymentMethod: "ONLINE",
        deliveryMethod: "OZON",
        email,
        phone: toE164(phone),
        name: name.slice(0, 120),
        deliveryAddress,
        comment: String(body.comment || "").slice(0, 2000) || null,
        subtotal,
        discount: 0,
        deliveryCost,
        total,
        markingHandled: false,
        items: { create: orderItems },
      },
    });

    if (total <= 0) {
      return NextResponse.json({ error: "Сумма оплаты должна быть больше нуля" }, { status: 400 });
    }

    const returnUrl = `${base}/api/payments/yookassa/return?order=${encodeURIComponent(number)}&t=${encodeURIComponent(accessToken)}`;
    const receiptUrl = `${base}/api/payments/receipt?order=${encodeURIComponent(number)}&t=${encodeURIComponent(accessToken)}`;
    const payment = await createYooKassaPayment({
      amount: total,
      orderNumber: number,
      description: `Оплата заказа ${number}`,
      email,
      returnUrl,
    });
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentId: payment.id,
        fiscalReceiptUrl: receiptUrl,
      },
    });

    await notifyStaff({
      title: `Новый заказ ${number}`,
      text: `${name}, ${phone}, ${email}\n${deliveryAddress}\nСумма ${total} ₽. Ожидает оплату.`,
    });

    return NextResponse.json({
      number: order.number,
      paymentUrl: payment.confirmationUrl,
      accessToken,
      thanksUrl: `/thanks?order=${encodeURIComponent(number)}&t=${encodeURIComponent(accessToken)}`,
    });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Ошибка";
    const safe =
      msg.startsWith("Товар") ||
      msg.startsWith("Некоррект") ||
      msg.startsWith("Недостаточно") ||
      msg.startsWith("Нет подтвержд") ||
      msg.startsWith("ЮKassa")
        ? msg
        : "Не удалось оформить заказ";
    return NextResponse.json({ error: safe }, { status: 500 });
  }
}
