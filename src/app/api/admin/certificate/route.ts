import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/admin";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const { error } = await requireStaff();
  if (error) return error;
  const form = await req.formData();
  const id = String(form.get("id") || "");
  const file = form.get("file");
  if (!id || !file || typeof file !== "object" || !("arrayBuffer" in file)) {
    return NextResponse.json({ error: "Файл и id обязательны" }, { status: 400 });
  }
  const uploaded = file as File;
  const ext = path.extname(uploaded.name || ".pdf").toLowerCase() || ".pdf";
  const cert = await prisma.certificate.findUnique({ where: { id } });
  if (!cert) return NextResponse.json({ error: "Не найден" }, { status: 404 });
  const filename = `cert-${cert.number.replace(/[^\w]+/g, "").slice(-8)}${ext}`;
  const dir = path.join(process.cwd(), "public", "docs");
  fs.mkdirSync(dir, { recursive: true });
  const rel = `/docs/${filename}`;
  fs.writeFileSync(path.join(dir, filename), Buffer.from(await uploaded.arrayBuffer()));
  await prisma.certificate.update({ where: { id }, data: { fileUrl: rel } });

  const skus = cert.skuList.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
  const products = await prisma.product.findMany();
  for (const p of products) {
    if (!skus.some((s) => s.includes(p.sku) || p.sku.startsWith(s.replace(/\/.*/, "")))) continue;
    const docs = JSON.parse(p.documentsJson || "[]") as { name: string; url: string }[];
    const next = docs.filter((d) => !d.name.includes(cert.number));
    next.push({ name: `Сертификат соответствия ${cert.number}`, url: rel });
    await prisma.product.update({
      where: { id: p.id },
      data: { documentsJson: JSON.stringify(next), certNumber: cert.number },
    });
  }
  return NextResponse.json({ ok: true, url: rel });
}
