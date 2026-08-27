"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice, formatPriceLabel } from "@/lib/utils";

export default function CartPage() {
  const { items, setQty, removeItem, subtotal, clear } = useCart();
  const unpriced = items.filter((i) => !(i.price > 0));
  const canCheckout = items.length > 0 && unpriced.length === 0;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="section-title">Корзина пуста</h1>
        <Link href="/catalog" className="btn btn-primary mt-6">
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="section-title">Корзина</h1>
      <div className="mt-8 space-y-3">
        {items.map((item) => (
          <div key={item.productId} className="flex flex-col gap-3 rounded-2xl bg-white p-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Link href={`/product/${item.slug}`} className="font-semibold hover:opacity-70">
                {item.name}
              </Link>
              <p className="text-xs text-[var(--muted)]">арт. {item.sku}</p>
            </div>
            <input
              type="number"
              min={item.packQty}
              step={item.packQty}
              value={item.quantity}
              onChange={(e) => setQty(item.productId, Number(e.target.value))}
              className="w-24 rounded-full border border-[var(--line)] px-3 py-1.5 text-sm"
            />
            <p className="w-36 font-semibold">{formatPriceLabel(item.price * item.quantity)}</p>
            <button type="button" className="text-sm text-[var(--muted)] hover:text-[var(--ink)]" onClick={() => removeItem(item.productId)}>
              Удалить
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-6">
        <button type="button" className="text-sm text-[var(--muted)] underline" onClick={clear}>
          Очистить корзину
        </button>
        <div className="text-right">
          <p className="text-2xl font-semibold tracking-tight">
            Итого: {canCheckout ? formatPrice(subtotal) : "уточняется"}
          </p>
          <div className="mt-4 flex flex-wrap justify-end gap-3">
            <Link href="/b2b?from=cart" className="btn btn-copper">
              Запросить расчёт для бизнеса
            </Link>
            {canCheckout ? (
              <Link href="/checkout" className="btn btn-primary">
                Оформить заказ
              </Link>
            ) : (
              <span className="btn btn-ghost cursor-not-allowed opacity-60">Оформить заказ</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
