import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/admin";

const STATUSES = new Set(["NEW", "AWAITING_PAYMENT", "PAID", "SHIPPED", "CANCELLED", "DONE"]);

export async function POST(req: NextRequest) {
  const { error } = await requireStaff();
  if (error) return error;
  const body = await req.json();
  const id = String(body.id || "");
  const status = String(body.status || "");
  if (!id || !STATUSES.has(status)) {
    return NextResponse.json({ error: "Некорректный статус" }, { status: 400 });
  }
  await prisma.order.update({ where: { id }, data: { status } });
  return NextResponse.json({ ok: true });
}
