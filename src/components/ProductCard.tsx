"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { formatPriceLabel } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { getProductPrice, hasConfirmedPrice } from "@/lib/pricing";
import { displayProduct, productAlt } from "@/lib/product-display";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  priceRetail: number;
  priceWholesale?: number;
  stock: number;
  packQty: number;
  imageUrl: string | null;
  color?: string | null;
  productType?: string | null;
  kitRole?: string | null;
  isHit?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  brand?: { name: string } | null;
};

export function ProductCard({ product }: { product: ProductCardData; b2bApproved?: boolean }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const priced = hasConfirmedPrice(product);
  const price = getProductPrice({ ...product, priceWholesale: product.priceWholesale || 0 });
  const view = displayProduct(product);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!priced) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: view.title,
      sku: product.sku,
      price,
      imageUrl: product.imageUrl,
      packQty: product.packQty,
      stock: product.stock,
      color: product.color,
      kitRole: product.kitRole,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  const stockLabel = product.stock > 0 ? `В наличии ${product.stock} шт` : "Наличие уточняется";

  return (
    <article className="group flex min-w-0 flex-col">
      <Link href={`/product/${product.slug}`} className="relative block overflow-hidden rounded-2xl bg-[var(--card)]">
        <div className="aspect-square">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={productAlt(product)} className="h-full w-full object-cover object-left" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="h-20 w-20 rounded-full bg-white/70" />
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col pt-3">
        <p className="text-xs text-[var(--muted)]">{stockLabel}</p>
        <Link href={`/product/${product.slug}`} className="mt-1 line-clamp-2 text-[0.9375rem] font-medium leading-snug hover:opacity-70">
          {view.title}
        </Link>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {view.badges.map((b) => (
            <span
              key={b}
              className={`rounded-full px-2 py-0.5 text-xs ${
                b === "Без рамки" ? "bg-[var(--ink)] text-white" : "bg-[var(--sand)] text-[var(--muted)]"
              }`}
            >
              {b}
            </span>
          ))}
        </div>
        <p className="mt-auto pt-3 text-lg font-semibold tracking-tight">{formatPriceLabel(price)}</p>
        {priced ? (
          <button
            type="button"
            onClick={handleAdd}
            className={`btn mt-3 w-full !rounded-xl !px-2 text-sm sm:!px-5 ${added ? "!bg-[var(--ok)] text-white" : "btn-primary"}`}
          >
            {added ? (
              <>
                <Check className="h-4 w-4" strokeWidth={2.5} /> Добавлено
              </>
            ) : (
              <>
                <ShoppingCart className="hidden h-4 w-4 sm:inline" strokeWidth={1.5} /> В корзину
              </>
            )}
          </button>
        ) : (
          <p className="mt-3 rounded-xl bg-[var(--sand)] px-2 py-2.5 text-center text-sm text-[var(--muted)]">Цена уточняется</p>
        )}
      </div>
    </article>
  );
}
