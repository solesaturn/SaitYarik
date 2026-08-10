"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/favorites-context";
import { useCart } from "@/lib/cart-context";
import { getProductPrice } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";

export default function FavoritesPage() {
  const { items, remove, count } = useFavorites();
  const { addItem } = useCart();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="section-title">Избранное</h1>
      <p className="mt-3 text-sm text-[var(--muted)]">Сохранено позиций: {count}</p>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[var(--line)] bg-white p-10 text-center">
          <Heart className="mx-auto h-8 w-8 text-[var(--muted)]" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-[var(--muted)]">Пока пусто. Нажмите сердечко на карточке товара.</p>
          <Link href="/catalog" className="btn btn-primary mt-6 inline-flex">
            В каталог
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {items.map((item) => {
            const price = getProductPrice({
              priceRetail: item.priceRetail,
              priceWholesale: item.priceWholesale,
            });
            return (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl bg-white p-4 sm:flex-row sm:items-center"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded bg-[var(--sand)]">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt="" className="h-full w-full object-contain p-1" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  {item.slug ? (
                    <Link href={`/product/${item.slug}`} className="font-semibold hover:underline">
                      {item.name}
                    </Link>
                  ) : (
                    <p className="font-semibold">{item.name}</p>
                  )}
                  <p className="text-xs text-[var(--muted)]">
                    {item.brandName ? `${item.brandName} · ` : ""}
                    {item.sku || item.id}
                  </p>
                  <p className="mt-1 text-lg font-bold tracking-tight">{formatPrice(price)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.slug && (
                    <button
                      type="button"
                      className="btn btn-primary !py-2"
                      onClick={() =>
                        addItem({
                          productId: item.id,
                          slug: item.slug,
                          name: item.name,
                          sku: item.sku,
                          price,
                          imageUrl: item.imageUrl,
                          packQty: 1,
                          stock: 999,
                        })
                      }
                    >
                      В корзину
                    </button>
                  )}
                  <button type="button" className="btn btn-ghost !py-2" onClick={() => remove(item.id)}>
                    Удалить
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
