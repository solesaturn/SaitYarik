import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/admin";

export async function GET() {
  const { error } = await requireStaff();
  if (error) return error;
  const products = await prisma.product.findMany({ orderBy: { sku: "asc" } });
  const header = [
    "sku",
    "name",
    "priceRetail",
    "stock",
    "color",
    "productType",
    "kitRole",
    "posts",
    "warranty",
    "series",
    "active",
  ];
  const lines = [
    header.join(";"),
    ...products.map((p) =>
      [
        p.sku,
        csv(p.name),
        p.priceRetail,
        p.stock,
        p.color || "",
        p.productType || "",
        p.kitRole || "",
        p.posts ?? "",
        csv(p.warranty || ""),
        p.series || "",
        p.active ? "1" : "0",
      ].join(";")
    ),
  ];
  const body = "\uFEFF" + lines.join("\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="laitys-products.csv"',
    },
  });
}

export async function POST(req: NextRequest) {
  const { error } = await requireStaff();
  if (error) return error;
  const text = await req.text();
  const rows = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  if (rows.length < 2) return NextResponse.json({ error: "Пустой файл" }, { status: 400 });
  const header = splitCsv(rows[0]).map((h) => h.trim());
  const skuIdx = header.indexOf("sku");
  const priceIdx = header.indexOf("priceRetail") >= 0 ? header.indexOf("priceRetail") : header.indexOf("price");
  const stockIdx = header.indexOf("stock");
  const nameIdx = header.indexOf("name");
  if (skuIdx < 0) return NextResponse.json({ error: "Нужен столбец sku" }, { status: 400 });

  let updated = 0;
  for (const line of rows.slice(1)) {
    const cols = splitCsv(line);
    const sku = cols[skuIdx]?.trim();
    if (!sku) continue;
    const data: { priceRetail?: number; stock?: number; name?: string } = {};
    if (priceIdx >= 0 && cols[priceIdx] !== undefined && cols[priceIdx] !== "") {
      const n = Number(String(cols[priceIdx]).replace(",", "."));
      if (Number.isFinite(n)) data.priceRetail = n;
    }
    if (stockIdx >= 0 && cols[stockIdx] !== undefined && cols[stockIdx] !== "") {
      const n = Number(cols[stockIdx]);
      if (Number.isFinite(n)) data.stock = Math.max(0, Math.floor(n));
    }
    if (nameIdx >= 0 && cols[nameIdx]) data.name = cols[nameIdx];
    if (Object.keys(data).length === 0) continue;
    const res = await prisma.product.updateMany({ where: { sku }, data });
    updated += res.count;
  }
  return NextResponse.json({ ok: true, updated });
}

function csv(v: string) {
  if (/[;"\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function splitCsv(line: string) {
  const sep = line.includes(";") && !line.split(",")[0]?.includes(";") ? ";" : line.includes(";") ? ";" : ",";
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (q && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else q = !q;
    } else if (ch === sep && !q) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}
