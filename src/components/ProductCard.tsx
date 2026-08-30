"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy, ShoppingCart } from "lucide-react";
import { formatPriceLabel } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { getProductPrice, hasConfirmedPrice } from "@/lib/pricing";

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
  isHit?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  brand?: { name: string } | null;
};

export function ProductCard({ product }: { product: ProductCardData; b2bApproved?: boolean }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);
  const priced = hasConfirmedPrice(product);
  const price = getProductPrice({ ...product, priceWholesale: product.priceWholesale || 0 });

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!priced) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      price,
      imageUrl: product.imageUrl,
      packQty: product.packQty,
      stock: product.stock,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  async function copySku(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(product.sku);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* ignore */
    }
  }

  const stockLabel =
    product.stock > 0 ? `В наличии ${product.stock} шт` : "Наличие уточняется";

  return (
    <article className="group flex min-w-0 flex-col">
      <Link href={`/product/${product.slug}`} className="relative block overflow-hidden rounded-2xl bg-[var(--card)]">
        <div className="aspect-square">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover object-left" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="h-20 w-20 rounded-full bg-white/70" />
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col pt-3">
        <p className="text-xs text-[var(--muted)]">{stockLabel}</p>
        <Link href={`/product/${product.slug}`} className="mt-1 line-clamp-2 text-sm font-medium leading-snug hover:opacity-70">
          {product.name}
        </Link>
        <div className="mt-auto flex flex-col gap-1 pt-3">
          <p className="text-sm font-semibold tracking-tight sm:text-base">{formatPriceLabel(price)}</p>
          <button
            type="button"
            onClick={copySku}
            className="inline-flex max-w-full items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--ink)]"
            title="Скопировать артикул"
          >
            <span className="truncate font-mono">{product.sku}</span>
            {copied ? <Check className="h-3.5 w-3.5 shrink-0 text-[var(--ok)]" /> : <Copy className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />}
          </button>
        </div>
        {priced ? (
          <button
            type="button"
            onClick={handleAdd}
            className={`btn mt-3 w-full !rounded-xl !px-2 text-xs sm:!px-5 sm:text-sm ${added ? "!bg-[var(--ok)] text-white" : "btn-primary"}`}
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
          <p className="mt-3 rounded-xl bg-[var(--sand)] px-2 py-2.5 text-center text-xs text-[var(--muted)] sm:px-3 sm:text-sm">
            Цена уточняется
          </p>
        )}
      </div>
    </article>
  );
}
