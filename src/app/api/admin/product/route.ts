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
  if (!id) return NextResponse.json({ error: "Нет id" }, { status: 400 });

  const priceRetail = Number(form.get("priceRetail") || 0);
  const stock = Number(form.get("stock") || 0);
  const name = String(form.get("name") || "");
  const sku = String(form.get("sku") || "");
  const description = String(form.get("description") || "");
  const color = String(form.get("color") || "");
  const series = String(form.get("series") || "Laitys");
  const kitRole = String(form.get("kitRole") || "");
  const productType = String(form.get("productType") || "");
  const warranty = String(form.get("warranty") || "");
  const posts = Number(form.get("posts") || 0);
  const active = form.get("active") === "on" || form.get("active") === "true";

  let imageUrl: string | undefined;
  const file = form.get("image");
  if (file && typeof file === "object" && "arrayBuffer" in file && (file as File).size > 0) {
    const uploaded = file as File;
    const ext = path.extname(uploaded.name || ".jpg").toLowerCase() || ".jpg";
    const safe = `${id}${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads", "products");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, safe), Buffer.from(await uploaded.arrayBuffer()));
    imageUrl = `/uploads/products/${safe}`;
  }

  const full = form.get("full") === "1";
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(name ? { name } : {}),
      ...(sku && full ? { sku } : {}),
      ...(full ? { description } : {}),
      ...(full ? { color: color || null } : {}),
      ...(full ? { series } : {}),
      ...(full ? { kitRole: kitRole || null } : {}),
      ...(full ? { productType: productType || null } : {}),
      ...(full ? { warranty: warranty || null } : {}),
      ...(full ? { posts: posts || null } : {}),
      priceRetail: Number.isFinite(priceRetail) ? priceRetail : 0,
      stock: Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : 0,
      ...(full ? { active } : {}),
      ...(imageUrl ? { imageUrl, imagesJson: JSON.stringify([imageUrl]) } : {}),
    },
  });

  return NextResponse.json({ ok: true, id: product.id });
}
