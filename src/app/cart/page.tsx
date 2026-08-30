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
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
      <h1 className="section-title">Корзина</h1>
      <div className="mt-6 space-y-3 sm:mt-8">
        {items.map((item) => (
          <div key={item.productId} className="flex flex-col gap-3 rounded-2xl bg-white p-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <Link href={`/product/${item.slug}`} className="font-semibold hover:opacity-70">
                {item.name}
              </Link>
              <p className="text-xs text-[var(--muted)]">арт. {item.sku}</p>
            </div>
            <div className="flex items-center justify-between gap-3 sm:contents">
              <input
                type="number"
                min={item.packQty}
                step={item.packQty}
                value={item.quantity}
                onChange={(e) => setQty(item.productId, Number(e.target.value))}
                className="w-24 rounded-full border border-[var(--line)] px-3 py-1.5 text-sm"
              />
              <p className="font-semibold sm:w-36">{formatPriceLabel(item.price * item.quantity)}</p>
              <button type="button" className="text-sm text-[var(--muted)] hover:text-[var(--ink)]" onClick={() => removeItem(item.productId)}>
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-[var(--line)] pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <button type="button" className="order-2 text-left text-sm text-[var(--muted)] underline sm:order-1" onClick={clear}>
          Очистить корзину
        </button>
        <div className="order-1 text-left sm:order-2 sm:text-right">
          <p className="text-2xl font-semibold tracking-tight">
            Итого: {canCheckout ? formatPrice(subtotal) : "уточняется"}
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
            <Link href="/b2b?from=cart" className="btn btn-copper w-full sm:w-auto">
              Запросить расчёт для бизнеса
            </Link>
            {canCheckout ? (
              <Link href="/checkout" className="btn btn-primary w-full sm:w-auto">
                Оформить заказ
              </Link>
            ) : (
              <span className="btn btn-ghost w-full cursor-not-allowed opacity-60 sm:w-auto">Оформить заказ</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
