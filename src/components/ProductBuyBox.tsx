"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { getProductPrice, hasConfirmedPrice } from "@/lib/pricing";
import { formatPriceLabel, packQuantity } from "@/lib/utils";

type Product = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  priceRetail: number;
  priceWholesale: number;
  stock: number;
  packQty: number;
  imageUrl: string | null;
};

export function ProductBuyBox({ product }: { product: Product; b2bApproved?: boolean }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(product.packQty || 1);
  const [added, setAdded] = useState(false);
  const priced = hasConfirmedPrice(product);
  const price = getProductPrice(product);

  function handleAdd() {
    if (!priced) return;
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        sku: product.sku,
        price,
        imageUrl: product.imageUrl,
        packQty: product.packQty,
        stock: product.stock,
      },
      qty
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="mt-6 rounded-2xl bg-white p-5">
      <p className="text-3xl font-semibold tracking-tight">{formatPriceLabel(price)}</p>
      {product.stock > 0 ? (
        <p className="mt-1 text-sm text-[var(--muted)]">В наличии {product.stock} шт.</p>
      ) : (
        <p className="mt-1 text-sm text-[var(--muted)]">Наличие уточняется</p>
      )}
      {priced ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="text-sm text-[var(--muted)]">
            Кол-во
            <input
              type="number"
              min={product.packQty}
              step={product.packQty}
              value={qty}
              onChange={(e) => setQty(packQuantity(Number(e.target.value) || product.packQty, product.packQty))}
              className="ml-2 w-24 rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 text-[var(--ink)]"
            />
          </label>
          <button type="button" className={`btn ${added ? "!bg-[var(--ok)] text-white" : "btn-primary"}`} onClick={handleAdd}>
            {added ? (
              <>
                <Check className="h-4 w-4" strokeWidth={2.5} /> Добавлено
              </>
            ) : (
              "В корзину"
            )}
          </button>
        </div>
      ) : (
        <p className="mt-4 text-sm text-[var(--muted)]">
          Цену подтвердит продавец. Можно добавить товар в заявку для бизнеса из корзины после появления цены или
          отправить запрос в разделе «Для бизнеса».
        </p>
      )}
    </div>
  );
}
