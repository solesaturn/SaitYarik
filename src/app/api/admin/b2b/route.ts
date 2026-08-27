import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/admin";

const STATUSES = new Set(["NEW", "IN_PROGRESS", "QUOTED", "CLOSED"]);

export async function POST(req: NextRequest) {
  const { error } = await requireStaff();
  if (error) return error;
  const body = await req.json();
  const id = String(body.id || "");
  const status = String(body.status || "");
  if (!id || !STATUSES.has(status)) {
    return NextResponse.json({ error: "Некорректный статус" }, { status: 400 });
  }
  await prisma.b2BRequest.update({ where: { id }, data: { status } });
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const { error } = await requireStaff();
  if (error) return error;
  const id = req.nextUrl.searchParams.get("id");
  const where = id ? { id } : {};
  const rows = await prisma.b2BRequest.findMany({ where, orderBy: { createdAt: "desc" } });
  const lines = [
    "id;createdAt;status;company;inn;contact;phone;email;items;file;message",
    ...rows.map((r) => {
      const items = JSON.parse(r.itemsJson || "[]") as { sku?: string; quantity?: number }[];
      const itemStr = items.map((i) => `${i.sku || "?"}x${i.quantity || 1}`).join(" ");
      return [
        r.id,
        r.createdAt.toISOString(),
        r.status,
        csv(r.companyName),
        r.inn,
        csv(r.contactName),
        r.phone,
        r.email,
        csv(itemStr),
        r.fileUrl || "",
        csv(r.message || ""),
      ].join(";");
    }),
  ];
  return new NextResponse("\uFEFF" + lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="laitys-b2b.csv"`,
    },
  });
}

function csv(v: string) {
  if (/[;"\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}
