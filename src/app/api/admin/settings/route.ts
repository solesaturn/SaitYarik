import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/admin";

export async function POST(req: NextRequest) {
  const { error } = await requireStaff();
  if (error) return error;
  const body = (await req.json()) as Record<string, string>;
  const entries = Object.entries(body).filter(([k]) => k);
  for (const [key, value] of entries) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: String(value ?? "") },
      create: { key, value: String(value ?? "") },
    });
  }
  return NextResponse.json({ ok: true });
}
