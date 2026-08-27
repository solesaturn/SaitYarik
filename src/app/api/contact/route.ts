import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidRuPhone, toE164 } from "@/lib/phone";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { notifyStaff } from "@/lib/notify";

async function saveLead(data: {
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  source?: string;
}) {
  const name = data.name.trim();
  const phoneRaw = data.phone.trim();
  if (!name || !phoneRaw) {
    return { error: "Укажите имя и телефон", status: 400 as const };
  }
  if (!isValidRuPhone(phoneRaw)) {
    return { error: "Некорректный телефон", status: 400 as const };
  }
  await prisma.contactLead.create({
    data: {
      name,
      phone: toE164(phoneRaw),
      email: data.email?.trim() || null,
      message: data.message?.trim() || null,
      source: data.source || "contact",
    },
  });
  await notifyStaff({
    title: "Сообщение с сайта",
    text: `${name}, ${phoneRaw}\n${data.email || ""}\n${data.message || ""}`,
  });
  return { ok: true as const };
}

export async function POST(req: NextRequest) {
  const accept = req.headers.get("accept") || "";
  const contentType = req.headers.get("content-type") || "";
  const wantsJson = accept.includes("application/json") || contentType.includes("application/json");

  const rl = rateLimit(`contact:${clientIp(req)}`, 15, 60_000);
  if (!rl.ok) {
    if (wantsJson) return NextResponse.json({ error: "Слишком много запросов" }, { status: 429 });
    return NextResponse.redirect(new URL("/contacts?error=1", req.url), 303);
  }

  let payload: {
    name: string;
    phone: string;
    email?: string | null;
    message?: string | null;
    source?: string;
  };

  if (contentType.includes("application/json")) {
    const body = await req.json();
    payload = {
      name: String(body.name || ""),
      phone: String(body.phone || ""),
      email: body.email ? String(body.email) : null,
      message: body.message ? String(body.message) : null,
      source: body.source ? String(body.source) : "contact",
    };
  } else {
    const form = await req.formData();
    payload = {
      name: String(form.get("name") || ""),
      phone: String(form.get("phone") || ""),
      email: String(form.get("email") || "") || null,
      message: String(form.get("message") || "") || null,
      source: String(form.get("source") || "contact"),
    };
  }

  const result = await saveLead(payload);
  if ("error" in result) {
    if (wantsJson) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.redirect(new URL("/contacts?error=1", req.url), 303);
  }

  if (wantsJson) return NextResponse.json({ ok: true });
  return NextResponse.redirect(new URL("/contacts?sent=1", req.url), 303);
}
