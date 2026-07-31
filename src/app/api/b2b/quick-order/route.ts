import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getProductPrice } from "@/lib/pricing";
import { escapeHtml } from "@/lib/html";

export async function POST(req: NextRequest) {
  const session = await getSession();
  const b2bApproved = !!session?.b2bApproved;

  const form = await req.formData();
  const raw = String(form.get("skus") || "");
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 200);

  const found: {
    sku: string;
    qty: number;
    id: string;
    slug: string;
    name: string;
    price: number;
    packQty: number;
    stock: number;
    imageUrl: string | null;
  }[] = [];

  for (const line of lines) {
    const [skuPart, qtyPart] = line.split(/[;,]/);
    const sku = skuPart?.trim();
    const qty = Math.max(1, Math.min(10_000, Number(qtyPart) || 1));
    if (!sku) continue;
    const product = await prisma.product.findFirst({ where: { sku: { equals: sku }, active: true } });
    if (product) {
      found.push({
        sku: product.sku,
        qty,
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: getProductPrice(product, b2bApproved),
        packQty: product.packQty,
        stock: product.stock,
        imageUrl: product.imageUrl,
      });
    }
  }

  // JSON в script: экранируем </ чтобы не сломать HTML; имена уже как JSON-строки
  const payload = JSON.stringify(found).replace(/</g, "\\u003c");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Корзина</title></head><body>
  <p>Добавляем в корзину… ${escapeHtml(String(found.length))} поз.</p>
  <script>
    const items = ${payload};
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
  </script></body></html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    },
  });
}
