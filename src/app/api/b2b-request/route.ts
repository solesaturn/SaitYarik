import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  await prisma.b2BRequest.create({
    data: {
      companyName: String(form.get("companyName") || ""),
      inn: String(form.get("inn") || ""),
      contactName: String(form.get("contactName") || ""),
      phone: String(form.get("phone") || ""),
      email: String(form.get("email") || ""),
      message: String(form.get("message") || "") || null,
      type: "PARTNERSHIP",
    },
  });
  return NextResponse.redirect(new URL("/b2b?sent=1", req.url), 303);
}
