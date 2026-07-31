import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCommerceML } from "@/lib/commerceml";
import { authorizeCml } from "@/lib/cml-auth";

const MAX_BODY_BYTES = 5 * 1024 * 1024;

function unauthorized() {
  return new NextResponse("failure\nauth", {
    status: 401,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "WWW-Authenticate": 'Basic realm="1C Exchange"',
    },
  });
}

/**
 * CommerceML 2.05+ receiver. Все mode требуют HTTP Basic (CML_LOGIN / CML_PASSWORD).
 */
export async function GET(req: NextRequest) {
  if (!authorizeCml(req)) return unauthorized();

  const type = req.nextUrl.searchParams.get("type");
  const mode = req.nextUrl.searchParams.get("mode");

  if (type === "catalog" || type === "sale") {
    if (mode === "checkauth") {
      return new NextResponse("success\nsession_id\ncml_ok", {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    if (mode === "init") {
      return new NextResponse(`zip=no\nfile_limit=${MAX_BODY_BYTES}`, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    if (mode === "import") {
      return new NextResponse("success", {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    if (mode === "query") {
      const orders = await prisma.order.findMany({
        where: { syncedTo1c: false },
        include: { items: true },
        take: 50,
      });
      const xml = buildOrdersXml(orders);
      await prisma.order.updateMany({
        where: { id: { in: orders.map((o) => o.id) } },
        data: { syncedTo1c: true },
      });
      await prisma.syncLog.create({
        data: {
          type: "ORDERS_EXPORT",
          direction: "SITE->1C",
          status: "OK",
          message: `Выгружено заказов: ${orders.length}`,
        },
      });
      return new NextResponse(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
    }
    if (mode === "success") {
      return new NextResponse("success", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
  }

  return new NextResponse("failure\nbad request", {
    status: 400,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function POST(req: NextRequest) {
  if (!authorizeCml(req)) return unauthorized();

  const filename = (req.nextUrl.searchParams.get("filename") || "import.xml").replace(/[^a-zA-Z0-9._-]/g, "");
  const length = Number(req.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) {
    return new NextResponse("failure\nfile too large", {
      status: 413,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const xml = await req.text();
  if (xml.length > MAX_BODY_BYTES) {
    return new NextResponse("failure\nfile too large", {
      status: 413,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  try {
    const result = await parseCommerceML(xml, filename);
    await prisma.syncLog.create({
      data: {
        type: filename.includes("offers") ? "OFFERS" : "CATALOG",
        direction: "1C->SITE",
        status: "OK",
        message: result.message,
      },
    });
    return new NextResponse("success", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Import failed";
    await prisma.syncLog.create({
      data: {
        type: "IMPORT_ERROR",
        direction: "1C->SITE",
        status: "ERROR",
        message,
      },
    });
    return new NextResponse("failure\nimport error", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

function buildOrdersXml(
  orders: {
    number: string;
    email: string;
    phone: string;
    name: string | null;
    total: number;
    items: { sku: string; name: string; quantity: number; price: number }[];
  }[]
) {
  const docs = orders
    .map(
      (o) => `
  <Документ>
    <Ид>${o.number}</Ид>
    <Номер>${o.number}</Номер>
    <Дата>${new Date().toISOString().slice(0, 10)}</Дата>
    <ХозОперация>Заказ товара</ХозОперация>
    <Роль>Продавец</Роль>
    <Валюта>RUB</Валюта>
    <Контрагенты><Контрагент><Наименование>${escapeXml(o.name || o.email)}</Наименование><Контакты>
      <Контакт><Тип>Почта</Тип><Значение>${escapeXml(o.email)}</Значение></Контакт>
      <Контакт><Тип>Телефон</Тип><Значение>${escapeXml(o.phone)}</Значение></Контакт>
    </Контакты></Контрагент></Контрагенты>
    <Товары>
      ${o.items
        .map(
          (i) => `<Товар><Ид>${escapeXml(i.sku)}</Ид><Наименование>${escapeXml(i.name)}</Наименование>
        <Количество>${i.quantity}</Количество><ЦенаЗаЕдиницу>${i.price}</ЦенаЗаЕдиницу></Товар>`
        )
        .join("")}
    </Товары>
    <Сумма>${o.total}</Сумма>
  </Документ>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<КоммерческаяИнформация ВерсияСхемы="2.05" ДатаФормирования="${new Date().toISOString()}">
${docs}
</КоммерческаяИнформация>`;
}

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
