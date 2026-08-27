"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice, formatPriceLabel } from "@/lib/utils";
import { PhoneField } from "@/components/PhoneField";
import { isValidRuPhone, toE164 } from "@/lib/phone";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const unpriced = items.filter((i) => !(i.price > 0));
  const ready = items.length > 0 && unpriced.length === 0;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!ready) {
      setError("В заказе есть позиции без подтверждённой цены");
      return;
    }
    if (!isValidRuPhone(phone)) {
      setError("Проверьте номер телефона");
      return;
    }
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      customerType: "B2C",
      deliveryMethod: "OZON",
      paymentMethod: "ONLINE",
      email: String(form.get("email") || ""),
      phone: toE164(phone),
      name: String(form.get("name") || ""),
      deliveryAddress: String(form.get("deliveryAddress") || ""),
      comment: String(form.get("comment") || ""),
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    };

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Ошибка оформления");
      return;
    }
    clear();
    if (data.paymentUrl) {
      window.location.href = data.paymentUrl;
      return;
    }
    router.push(data.thanksUrl || `/thanks?order=${encodeURIComponent(data.number)}`);
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="section-title">Нечего оформлять</h1>
        <Link href="/catalog" className="btn btn-primary mt-6">
          В каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="section-title">Оформление заказа</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Имя, телефон, e-mail и адрес. Доставка Ozon. Оплата на сайте. Заказ станет оплаченным после подтверждения
        платёжной системы.
      </p>
      {!ready && (
        <p className="mt-4 rounded-2xl bg-[var(--sand)] p-4 text-sm">
          Часть товаров без цены. Уберите их из корзины или отправьте{" "}
          <Link href="/b2b" className="underline">
            заявку для бизнеса
          </Link>
          .
        </p>
      )}
      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="grid gap-3 rounded-2xl bg-white p-5 sm:grid-cols-2">
            <p className="font-semibold sm:col-span-2">Контакты</p>
            <label className="grid gap-1 text-sm sm:col-span-2">
              <span className="text-[var(--muted)]">Имя</span>
              <input name="name" required placeholder="Имя" className="rounded-full border border-[var(--line)] px-3 py-2 text-sm" />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-[var(--muted)]">Телефон</span>
              <PhoneField value={phone} onChange={setPhone} />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-[var(--muted)]">E-mail</span>
              <input name="email" type="email" required placeholder="mail@example.com" className="rounded-full border border-[var(--line)] px-3 py-2 text-sm" />
            </label>
          </div>

          <div className="rounded-2xl bg-white p-5">
            <p className="font-semibold">Доставка</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Ozon Доставка. Стоимость считает Ozon по адресу.</p>
            <label className="mt-3 grid gap-1 text-sm">
              <span className="text-[var(--muted)]">Адрес доставки</span>
              <input
                name="deliveryAddress"
                required
                placeholder="Город, улица, дом, квартира"
                className="w-full rounded-full border border-[var(--line)] px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="rounded-2xl bg-white p-5">
            <p className="font-semibold">Оплата</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Онлайн на сайте. Базовый контур — ЮKassa; Ozon Pay подключается отдельно, когда будут доступы.
            </p>
            <textarea
              name="comment"
              placeholder="Комментарий (необязательно)"
              className="mt-3 w-full rounded-2xl border border-[var(--line)] px-3 py-2 text-sm"
              rows={2}
            />
          </div>

          <label className="flex items-start gap-2 text-xs text-[var(--muted)]">
            <input type="checkbox" required className="mt-0.5" />
            Принимаю{" "}
            <Link href="/legal/offer" className="underline">
              оферту
            </Link>{" "}
            и{" "}
            <Link href="/legal/privacy" className="underline">
              политику обработки персональных данных
            </Link>
          </label>
        </div>

        <aside className="h-fit rounded-2xl bg-white p-5 lg:sticky lg:top-28">
          <p className="font-semibold">Заказ</p>
          <ul className="mt-3 space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-2">
                <span className="line-clamp-1">
                  {i.name} × {i.quantity}
                </span>
                <span>{formatPriceLabel(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 text-sm">
            <p className="flex justify-between">
              <span>Товары</span>
              <span>{ready ? formatPrice(subtotal) : "уточняется"}</span>
            </p>
            <p className="flex justify-between">
              <span>Доставка Ozon</span>
              <span>по тарифу</span>
            </p>
            <p className="flex justify-between border-t border-[var(--line)] pt-2 text-base font-semibold">
              <span>К оплате за товар</span>
              <span>{ready ? formatPrice(subtotal) : "—"}</span>
            </p>
          </div>
          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={loading || !ready} className="btn btn-primary mt-5 w-full disabled:opacity-50">
            {loading ? "Оформляем…" : "Оплатить"}
          </button>
        </aside>
      </form>
    </div>
  );
}
