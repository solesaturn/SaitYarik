import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  await prisma.contactLead.create({
    data: {
      name: String(form.get("name") || ""),
      phone: String(form.get("phone") || ""),
      email: String(form.get("email") || "") || null,
      message: String(form.get("message") || "") || null,
      source: "contact",
    },
  });
  return NextResponse.redirect(new URL("/contacts?sent=1", req.url), 303);
}
