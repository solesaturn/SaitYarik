import { NextRequest, NextResponse } from "next/server";
import { canApproveB2B, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !canApproveB2B(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { userId } = await req.json();
  await prisma.user.update({
    where: { id: userId },
    data: { b2bApproved: true, role: "B2B", customerType: "B2B" },
  });
  await prisma.b2BRequest.updateMany({
    where: { userId, status: "NEW" },
    data: { status: "APPROVED" },
  });
  return NextResponse.json({ ok: true });
}
