import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { requireStaff } from "@/lib/admin";

export async function POST(req: NextRequest) {
  const {error} = await requireStaff(); if (error) return error;
  const form = await req.formData();
  const file = form.get("image");
  if (!(file instanceof File) || !file.size || file.size > 12 * 1024 * 1024) return NextResponse.json({error: "Выберите фото до 12 МБ"}, {status: 400});
  try {
    const input = Buffer.from(await file.arrayBuffer());
    const meta = await sharp(input, {limitInputPixels: 40_000_000}).metadata();
    if (!["jpeg", "png", "webp", "avif", "heif"].includes(meta.format || "")) throw new Error();
    const hero = form.get("kind") === "hero";
    let image = sharp(input).rotate();
    if (hero) image = image.resize({width: 2400, height: 2400, fit: "inside", withoutEnlargement: true});
    else image = image.trim({threshold: 10}).resize(1360, 1360, {fit: "contain", background:"#f3f4f5"}).extend({top:120,bottom:120,left:120,right:120,background:"#f3f4f5"}).flatten({background:"#f3f4f5"});
    const bytes = await image.webp({quality:90}).toBuffer();
    return NextResponse.json({url: `data:image/webp;base64,${bytes.toString("base64")}`, warning: Math.max(meta.width || 0, meta.height || 0) < (hero ? 2000 : 1600) ? "Исходное фото меньше рекомендуемого разрешения. Лучше загрузить оригинал." : null});
  } catch { return NextResponse.json({error: "Не удалось прочитать фото. Используйте JPG, PNG, WebP или AVIF."}, {status:400}); }
}
