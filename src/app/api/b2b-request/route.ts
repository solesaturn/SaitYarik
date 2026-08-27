import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidRuPhone, toE164 } from "@/lib/phone";

export async function POST(req: NextRequest) {
  const accept = req.headers.get("accept") || "";
  const contentType = req.headers.get("content-type") || "";
  const wantsJson = accept.includes("application/json") || contentType.includes("application/json");

  let contactName = "";
  let phone = "";
  let email = "";
  let message: string | null = null;
  let companyName = "";
  let inn = "";

  if (contentType.includes("application/json")) {
    const body = await req.json();
    contactName = String(body.contactName || body.name || "");
    phone = String(body.phone || "");
    email = String(body.email || "");
    message = body.message ? String(body.message) : null;
    companyName = String(body.companyName || "");
    inn = String(body.inn || "");
  } else {
    const form = await req.formData();
    contactName = String(form.get("contactName") || form.get("name") || "");
    phone = String(form.get("phone") || "");
    email = String(form.get("email") || "");
    message = String(form.get("message") || "") || null;
    companyName = String(form.get("companyName") || "");
    inn = String(form.get("inn") || "");
  }

  if (!contactName.trim() || !phone.trim()) {
    if (wantsJson) return NextResponse.json({ error: "Укажите имя и телефон" }, { status: 400 });
    return NextResponse.redirect(new URL("/b2b?error=1", req.url), 303);
  }
  if (!isValidRuPhone(phone)) {
    if (wantsJson) return NextResponse.json({ error: "Некорректный телефон" }, { status: 400 });
    return NextResponse.redirect(new URL("/b2b?error=1", req.url), 303);
  }

  await prisma.b2BRequest.create({
    data: {
      companyName: companyName.trim() || "Уточнит менеджер",
      inn: inn.trim() || "—",
      contactName: contactName.trim(),
      phone: toE164(phone),
      email: email.trim() || "",
      message,
      type: "PARTNERSHIP",
    },
  });

  if (wantsJson) return NextResponse.json({ ok: true });
  return NextResponse.redirect(new URL("/b2b?sent=1", req.url), 303);
}
