"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { usePriceMode } from "@/lib/price-mode";
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
  const { mode } = usePriceMode();
  const [added, setAdded] = useState(false);
  const price = getProductPrice(product, mode, b2bApproved || mode === "b2b");

  function handleAdd() {
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

  return (
    <article className="group flex flex-col overflow-hidden border border-[var(--line)] bg-white transition hover:border-[var(--ink)]/20">
      <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-[var(--sand)]">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <>
            <div
              className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#f3ebe0,transparent_55%),linear-gradient(160deg,#e8eef2,#d7dde3)]"
              aria-hidden
            />
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="h-24 w-24 rounded-full border-4 border-[var(--ink)]/10 bg-white/70 shadow-inner" />
            </div>
          </>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1">
          {product.isHit && <span className="bg-[var(--ink)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">Хит</span>}
          {product.isNew && <span className="bg-[var(--copper)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--ink)]">Новинка</span>}
          {product.isSale && <span className="bg-[#b42318] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">Акция</span>}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-[var(--muted)]">{product.brand?.name ?? "SaitYarik"} · {product.sku}</p>
        <Link href={`/product/${product.slug}`} className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-[var(--ink)] hover:underline">
          {product.name}
        </Link>
        <p className="mt-2 text-xs text-[var(--muted)]">
          {product.stock > 0 ? `В наличии: ${product.stock} шт.` : "Под заказ"}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <p className="font-[family-name:var(--font-display)] text-xl">{formatPrice(price)}</p>
            {mode === "b2b" && (
              <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">опт</p>
            )}
          </div>
          <div className="flex gap-1">
            <FavoriteButton
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
            <button
              type="button"
              className={`rounded p-2 text-white transition ${
                added ? "bg-[var(--ok)]" : "bg-[var(--ink)] hover:bg-[var(--ink)]/90"
              }`}
              aria-label={added ? "Добавлено" : "В корзину"}
              onClick={handleAdd}
            >
              {added ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <ShoppingCart className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
