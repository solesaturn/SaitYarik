import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const raw = String(form.get("skus") || "");
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const found: { sku: string; qty: number; id: string; slug: string; name: string; price: number; packQty: number; stock: number; imageUrl: string | null }[] = [];

  for (const line of lines) {
    const [skuPart, qtyPart] = line.split(/[;,]/);
    const sku = skuPart?.trim();
    const qty = Math.max(1, Number(qtyPart) || 1);
    if (!sku) continue;
    const product = await prisma.product.findFirst({ where: { sku: { equals: sku } } });
    if (product) {
      found.push({
        sku: product.sku,
        qty,
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.priceWholesale,
        packQty: product.packQty,
        stock: product.stock,
        imageUrl: product.imageUrl,
      });
    }
  }

  // Pass items via cookie-like redirect query is too large — use HTML bridge page
  const html = `<!DOCTYPE html><html><body><script>
    const items = ${JSON.stringify(found)};
    const key = 'sy_cart_v1';
    const cart = JSON.parse(localStorage.getItem(key) || '[]');
    for (const p of items) {
      const existing = cart.find(c => c.productId === p.id);
      const pack = p.packQty || 1;
      const q = Math.max(pack, Math.ceil(p.qty / pack) * pack);
      if (existing) existing.quantity += q;
      else cart.push({ productId: p.id, slug: p.slug, name: p.name, sku: p.sku, price: p.price, imageUrl: p.imageUrl, packQty: pack, stock: p.stock, quantity: q });
    }
    localStorage.setItem(key, JSON.stringify(cart));
    location.href = '/cart';
  </script><p>Добавляем в корзину…</p></body></html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
