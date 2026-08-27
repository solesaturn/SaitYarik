import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/admin";

export async function POST(req: NextRequest) {
  const { error } = await requireStaff();
  if (error) return error;
  const body = await req.json();
  if (body.action === "create") {
    await prisma.faqItem.create({
      data: {
        question: String(body.question || "").slice(0, 300),
        answer: String(body.answer || "").slice(0, 4000),
        sortOrder: Number(body.sortOrder || 0),
      },
    });
    return NextResponse.json({ ok: true });
  }
  if (body.action === "delete") {
    await prisma.faqItem.delete({ where: { id: String(body.id) } });
    return NextResponse.json({ ok: true });
  }
  if (body.action === "update") {
    await prisma.faqItem.update({
      where: { id: String(body.id) },
      data: {
        question: String(body.question || ""),
        answer: String(body.answer || ""),
      },
    });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "unknown" }, { status: 400 });
}
