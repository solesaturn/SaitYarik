import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { error } = await requireStaff();
  if (error) return error;
  const form = await req.formData();
  const image = form.get("image");
  if (!(image instanceof File) || !image.size || image.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Выберите изображение до 5 МБ" }, { status: 400 });
  }
  const bytes = Buffer.from(await image.arrayBuffer());
  const mime = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? "image/png"
    : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 ? "image/jpeg"
    : bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP" ? "image/webp" : null;
  if (!mime) return NextResponse.json({ error: "Поддерживаются PNG, JPG и WebP" }, { status: 400 });
  // Keep the banner with its setting; this also works on read-only deployments.
  const value = `data:${mime};base64,${bytes.toString("base64")}`;
  await prisma.siteSetting.upsert({ where: { key: "hero_image" }, create: { key: "hero_image", value }, update: { value } });
  return NextResponse.json({ ok: true });
}
