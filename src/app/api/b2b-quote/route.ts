import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isValidRuPhone, toE164 } from "@/lib/phone";
import { notifyStaff } from "@/lib/notify";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const rl = rateLimit(`b2b:${clientIp(req)}`, 10, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Слишком много запросов" }, { status: 429 });

  const form = await req.formData();
  const companyName = String(form.get("companyName") || "").trim();
  const inn = String(form.get("inn") || "").trim();
  const contactName = String(form.get("contactName") || "").trim();
  const phone = String(form.get("phone") || "").trim();
  const email = String(form.get("email") || "").trim();
  const message = String(form.get("message") || "").trim();
  const itemsRaw = String(form.get("items") || "[]");

  if (!companyName || !inn || !contactName || !email) {
    return NextResponse.json({ error: "Заполните компанию, ИНН, контакт и e-mail" }, { status: 400 });
  }
  if (!isValidRuPhone(phone)) {
    return NextResponse.json({ error: "Некорректный телефон" }, { status: 400 });
  }

  let itemsJson = "[]";
  try {
    const parsed = JSON.parse(itemsRaw);
    if (Array.isArray(parsed)) itemsJson = JSON.stringify(parsed.slice(0, 200));
  } catch {
    itemsJson = "[]";
  }

  let fileName: string | null = null;
  let fileUrl: string | null = null;
  const file = form.get("file");
  if (file && typeof file === "object" && "arrayBuffer" in file && (file as File).size > 0) {
    const uploaded = file as File;
    if (uploaded.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Файл больше 8 МБ" }, { status: 400 });
    }
    const ext = path.extname(uploaded.name || "").toLowerCase();
    const allowed = [".xlsx", ".xls", ".pdf", ".csv", ".doc", ".docx"];
    if (!allowed.includes(ext)) {
      return NextResponse.json({ error: "Допустимы Excel, PDF, CSV, Word" }, { status: 400 });
    }
    const safe = `${Date.now()}-${uploaded.name.replace(/[^\w.\-а-яА-ЯёЁ]+/g, "_").slice(0, 80)}`;
    const dir = path.join(process.cwd(), "public", "uploads", "b2b");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, safe), Buffer.from(await uploaded.arrayBuffer()));
    fileName = uploaded.name;
    fileUrl = `/uploads/b2b/${safe}`;
  }

  const session = await getSession();
  const created = await prisma.b2BRequest.create({
    data: {
      userId: session?.id,
      companyName,
      inn,
      contactName,
      phone: toE164(phone),
      email,
      message: message || null,
      itemsJson,
      fileName,
      fileUrl,
      type: "QUOTE",
      status: "NEW",
    },
  });

  await notifyStaff({
    title: `B2B заявка ${created.id.slice(-6)}`,
    text: `${companyName}, ИНН ${inn}\n${contactName}, ${phone}, ${email}\n${message || "без комментария"}`,
  });

  return NextResponse.json({ ok: true, id: created.id });
}
