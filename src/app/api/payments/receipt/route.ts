import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isStaff } from "@/lib/auth";
import { verifyOrderAccessToken } from "@/lib/order-token";
import { escapeHtml } from "@/lib/html";

export async function GET(req: NextRequest) {
  const orderNumber = req.nextUrl.searchParams.get("order");
  const token = req.nextUrl.searchParams.get("t");

  if (!orderNumber) {
    return new NextResponse("Not found", { status: 404 });
  }

  const session = await getSession();
  const staff = session && isStaff(session.role);
  const tokenOk = verifyOrderAccessToken(orderNumber, token);

  const order = await prisma.order.findUnique({
    where: { number: orderNumber },
    include: { items: true },
  });

  if (!order) {
    return new NextResponse("Not found", { status: 404 });
  }

  const owner = session && (session.id === order.userId || (staff ?? false));
  if (!tokenOk && !owner) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const itemsHtml = order.items
    .map(
      (i) =>
        `<li>${escapeHtml(i.name)} × ${i.quantity} — ${(i.price * i.quantity).toFixed(2)} ₽</li>`
    )
    .join("");

  const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>Чек ${escapeHtml(order.number)}</title>
  <style>body{font-family:system-ui;max-width:420px;margin:40px auto;padding:24px;border:1px solid #ddd}
  h1{font-size:18px} .muted{color:#666;font-size:12px}</style></head><body>
  <h1>Кассовый чек (демо 54-ФЗ)</h1>
  <p class="muted">Облачная касса ЮKassa · ОФД → ФНС</p>
  <p>Заказ ${escapeHtml(order.number)}</p>
  <p>Сумма: ${order.total.toFixed(2)} ₽</p>
  <ul>${itemsHtml}</ul>
  <p class="muted">Маркировка «Честный ЗНАК»: коды передаются при комплектации со склада.</p>
  </body></html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
