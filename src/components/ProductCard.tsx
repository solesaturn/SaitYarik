"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy, ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { getProductPrice } from "@/lib/pricing";
import { FavoriteButton } from "@/components/FavoriteButton";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  priceRetail: number;
  priceWholesale: number;
  stock: number;
  packQty: number;
  imageUrl: string | null;
  isHit?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  brand?: { name: string } | null;
};

export function ProductCard({ product, b2bApproved = false }: { product: ProductCardData; b2bApproved?: boolean }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);
  const price = getProductPrice(product, b2bApproved);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
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
    product.stock <= 0
      ? "Под заказ"
      : product.stock < 500
        ? `В наличии < ${product.stock} шт`
        : `В наличии ${product.stock} шт`;

  return (
    <article className="group flex flex-col">
      <div className="relative overflow-hidden rounded-2xl bg-[var(--card)]">
        <Link href={`/product/${product.slug}`} className="relative block aspect-square">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-contain p-8 transition duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="h-20 w-20 rounded-full bg-white/70" />
            </div>
          )}
        </Link>
        <div className="absolute right-3 top-3 z-10">
          <FavoriteButton
            className="!rounded-full !border-0 !bg-white/80 !p-2 shadow-none backdrop-blur hover:!bg-white"
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              sku: product.sku,
              priceRetail: product.priceRetail,
              priceWholesale: product.priceWholesale,
              imageUrl: product.imageUrl,
              brandName: product.brand?.name,
            }}
          />
        </div>
        <div className="pointer-events-none absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--ink)]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--ink)]/25" />
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--ink)]/25" />
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--ink)]/25" />
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <p className="text-xs text-[var(--muted)]">{stockLabel}</p>
        <Link
          href={`/product/${product.slug}`}
          className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-[var(--ink)] hover:opacity-70"
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <p className="text-base font-bold tracking-tight">{formatPrice(price)}</p>
          <button
            type="button"
            onClick={copySku}
            className="inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--ink)]"
            title="Скопировать артикул"
          >
            <span className="font-mono">{product.sku}</span>
            {copied ? <Check className="h-3.5 w-3.5 text-[var(--ok)]" /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />}
          </button>
        </div>
        {b2bApproved && <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[var(--muted)]">Ваша цена</p>}
        <button
          type="button"
          onClick={handleAdd}
          className={`btn mt-3 w-full !rounded-xl ${added ? "!bg-[var(--ok)] text-white" : "btn-copper"}`}
        >
          {added ? (
            <>
              <Check className="h-4 w-4" strokeWidth={2.5} /> Добавлено
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" strokeWidth={1.5} /> В корзину
            </>
          )}
        </button>
      </div>
    </article>
  );
}
