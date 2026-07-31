"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { getProductPrice } from "@/lib/pricing";
import { formatPrice, packQuantity } from "@/lib/utils";
import { FavoriteButton } from "@/components/FavoriteButton";
import { OneClickBuy } from "@/components/OneClickBuy";
import { LeadForm } from "@/components/LeadForm";

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

export function ProductBuyBox({ product, b2bApproved }: { product: Product; b2bApproved: boolean }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(product.packQty || 1);
  const [added, setAdded] = useState(false);
  const price = getProductPrice(product, b2bApproved);

  function handleAdd() {
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
    <div className="mt-6 space-y-4">
      <div className="border border-[var(--line)] bg-white p-4">
        <p className="font-[family-name:var(--font-display)] text-3xl">{formatPrice(price)}</p>
        {b2bApproved && <p className="mt-1 text-xs uppercase tracking-wide text-[var(--muted)]">Ваша цена</p>}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="text-sm">
            Кол-во
            <input
              type="number"
              min={product.packQty}
              step={product.packQty}
              value={qty}
              onChange={(e) => setQty(packQuantity(Number(e.target.value) || product.packQty, product.packQty))}
              className="ml-2 w-24 rounded border border-[var(--line)] px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            className={`btn ${added ? "!bg-[var(--ok)] text-white" : "btn-primary"}`}
            onClick={handleAdd}
          >
            {added ? (
              <>
                <Check className="h-4 w-4" strokeWidth={2.5} /> Добавлено
              </>
            ) : (
              "В корзину"
            )}
          </button>
          <FavoriteButton
            className="!rounded-full !px-3 !py-3"
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              sku: product.sku,
              priceRetail: product.priceRetail,
              priceWholesale: product.priceWholesale,
              imageUrl: product.imageUrl,
            }}
          />
          <OneClickBuy
            productId={product.id}
            productName={product.name}
            sku={product.sku}
            quantity={qty}
          />
        </div>
      </div>

      {!b2bApproved && (
        <div className="border border-[var(--line)] bg-[var(--sand)]/40 p-4">
          <LeadForm
            variant="bulk"
            source="product_bulk"
            productSku={product.sku}
            productName={product.name}
          />
        </div>
      )}
    </div>
  );
}
