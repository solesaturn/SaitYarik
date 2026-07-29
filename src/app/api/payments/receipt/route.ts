import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const orderNumber = req.nextUrl.searchParams.get("order");
  const order = orderNumber
    ? await prisma.order.findUnique({ where: { number: orderNumber }, include: { items: true } })
    : null;

  const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>Чек ${orderNumber || ""}</title>
  <style>body{font-family:system-ui;max-width:420px;margin:40px auto;padding:24px;border:1px solid #ddd}
  h1{font-size:18px} .muted{color:#666;font-size:12px}</style></head><body>
  <h1>Кассовый чек (демо 54-ФЗ)</h1>
  <p class="muted">Облачная касса ЮKassa · ОФД → ФНС</p>
  ${
    order
      ? `<p>Заказ ${order.number}</p><p>Сумма: ${order.total.toFixed(2)} ₽</p>
         <ul>${order.items.map((i) => `<li>${i.name} × ${i.quantity} — ${(i.price * i.quantity).toFixed(2)} ₽</li>`).join("")}</ul>
         <p class="muted">Маркировка «Честный ЗНАК»: коды передаются при комплектации со склада (не с витрины).</p>`
      : "<p>Чек не найден</p>"
  }
  </body></html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
