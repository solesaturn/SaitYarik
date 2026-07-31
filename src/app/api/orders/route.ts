import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateOrderNumber, packQuantity } from "@/lib/utils";
import { createYooKassaPayment } from "@/lib/yookassa";
import { getProductPrice } from "@/lib/pricing";
import { calcPromoDiscount } from "@/lib/promo";
import { orderAccessToken } from "@/lib/order-token";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { isValidRuPhone, toE164 } from "@/lib/phone";

const DELIVERY_OK = new Set(["SELFPICKUP", "PICKUP_POINT", "COURIER", "B2B_CUSTOM"]);

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

    const emailRaw = String(body.email || "").trim().toLowerCase();
    const email =
      emailRaw && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)
        ? emailRaw
        : `${toE164(phone).replace(/\D/g, "")}@order.saityarik.ru`;

    const b2bApproved = !!session?.b2bApproved;
    const wantsBusiness = body.customerType === "B2B" || body.forBusiness === true;
    // Оптовая цена и спец-доставка — только после одобрения сессии
    const customerType = b2bApproved || wantsBusiness ? "B2B" : "B2C";

    let paymentMethod = String(body.paymentMethod || "SBP");
    if (paymentMethod === "INVOICE" && !b2bApproved && !wantsBusiness) {
      paymentMethod = "SBP";
    }

    let deliveryMethod = String(body.deliveryMethod || "SELFPICKUP");
    if (!DELIVERY_OK.has(deliveryMethod)) {
      deliveryMethod = "SELFPICKUP";
    }
    if (deliveryMethod === "B2B_CUSTOM" && !b2bApproved) {
      deliveryMethod = "COURIER";
    }

    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) }, active: true },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const orderItems = items.map((i) => {
      const p = byId.get(i.productId);
      if (!p) throw new Error("Товар не найден");
      const qtyRaw = Number(i.quantity);
      if (!Number.isFinite(qtyRaw) || qtyRaw <= 0 || qtyRaw > 10_000) {
        throw new Error("Некорректное количество");
      }
      const quantity = packQuantity(qtyRaw, p.packQty || 1);
      if (p.stock > 0 && quantity > p.stock) {
        throw new Error(`Недостаточно на складе: ${p.sku}`);
      }
      const price = getProductPrice(p, b2bApproved);
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

    const promoResult = await calcPromoDiscount(body.promoCode, subtotal);
    if (promoResult.error && body.promoCode) {
      return NextResponse.json({ error: promoResult.error }, { status: 400 });
    }
    const discount = promoResult.discount;

    let deliveryCost = 0;
    if (deliveryMethod !== "SELFPICKUP" && deliveryMethod !== "B2B_CUSTOM") {
      deliveryCost = subtotal >= 5000 ? 0 : deliveryMethod === "COURIER" ? 490 : 290;
    }

    const total = Math.max(0, subtotal - discount + deliveryCost);
    const number = generateOrderNumber();
    const accessToken = orderAccessToken(number);
    const needsOnlinePay = paymentMethod === "SBP" || paymentMethod === "CARD";
    const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    if (deliveryMethod !== "SELFPICKUP" && !String(body.deliveryAddress || "").trim()) {
      return NextResponse.json({ error: "Укажите адрес или код ПВЗ" }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        number,
        userId: session?.id,
        customerType,
        status: needsOnlinePay ? "AWAITING_PAYMENT" : "NEW",
        paymentMethod,
        deliveryMethod,
        email,
        phone: toE164(phone),
        name: String(body.name || "").slice(0, 120) || null,
        companyName: wantsBusiness || b2bApproved ? String(body.companyName || "") || null : null,
        inn: wantsBusiness || b2bApproved ? String(body.inn || "") || null : null,
        kpp: wantsBusiness || b2bApproved ? String(body.kpp || "") || null : null,
        legalAddress: null,
        deliveryAddress: String(body.deliveryAddress || "") || null,
        comment: String(body.comment || "").slice(0, 2000) || null,
        subtotal,
        discount,
        deliveryCost,
        total,
        promoCode: promoResult.code,
        markingHandled: false,
        items: { create: orderItems },
      },
    });

    await prisma.syncLog.create({
      data: {
        type: "ORDER",
        direction: "SITE->1C",
        status: "QUEUED",
        message: `Заказ ${number} в очереди выгрузки`,
      },
    });

    let paymentUrl: string | undefined;
    const receiptUrl = `${base}/api/payments/receipt?order=${encodeURIComponent(number)}&t=${encodeURIComponent(accessToken)}`;

    if (needsOnlinePay) {
      if (total <= 0) {
        return NextResponse.json({ error: "Сумма оплаты должна быть больше нуля" }, { status: 400 });
      }
      const returnUrl = `${base}/api/payments/yookassa/return?order=${encodeURIComponent(number)}&t=${encodeURIComponent(accessToken)}`;
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
      paymentUrl = payment.confirmationUrl;
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: { fiscalReceiptUrl: receiptUrl },
      });
    }

    return NextResponse.json({
      number: order.number,
      paymentUrl,
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
      msg.startsWith("ЮKassa")
        ? msg
        : "Не удалось оформить заказ";
    return NextResponse.json({ error: safe }, { status: 500 });
  }
}
