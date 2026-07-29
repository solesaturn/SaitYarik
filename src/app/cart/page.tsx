"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, setQty, removeItem, subtotal, clear } = useCart();

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
          <div key={item.productId} className="flex flex-col gap-3 border border-[var(--line)] bg-white p-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Link href={`/product/${item.slug}`} className="font-semibold hover:underline">
                {item.name}
              </Link>
              <p className="text-xs text-[var(--muted)]">арт. {item.sku} · кратность {item.packQty}</p>
            </div>
            <input
              type="number"
              min={item.packQty}
              step={item.packQty}
              value={item.quantity}
              onChange={(e) => setQty(item.productId, Number(e.target.value))}
              className="w-24 rounded border border-[var(--line)] px-2 py-1.5 text-sm"
            />
            <p className="w-28 font-semibold">{formatPrice(item.price * item.quantity)}</p>
            <button type="button" className="text-sm text-red-700" onClick={() => removeItem(item.productId)}>
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
          <p className="text-sm text-[var(--muted)]">Предварительная доставка рассчитывается на оформлении</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-2xl">Итого: {formatPrice(subtotal)}</p>
          <Link href="/checkout" className="btn btn-primary mt-4">
            Оформить заказ
          </Link>
        </div>
      </div>
    </div>
  );
}
