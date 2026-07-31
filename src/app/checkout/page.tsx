"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import { PhoneField } from "@/components/PhoneField";
import { isValidRuPhone, toE164 } from "@/lib/phone";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [forBusiness, setForBusiness] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState("SELFPICKUP");
  const [paymentMethod, setPaymentMethod] = useState("SBP");
  const [phone, setPhone] = useState("");
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const deliveryCost = useMemo(() => {
    if (deliveryMethod === "SELFPICKUP") return 0;
    if (subtotal >= 5000) return 0;
    return deliveryMethod === "COURIER" ? 490 : 290;
  }, [deliveryMethod, subtotal]);

  const total = Math.max(0, subtotal - discount + deliveryCost);
  const needsAddress = deliveryMethod !== "SELFPICKUP";

  async function applyPromo() {
    const res = await fetch("/api/promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: promo, subtotal }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Промокод недействителен");
      setDiscount(0);
      return;
    }
    setDiscount(data.discount);
    setError("");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!isValidRuPhone(phone)) {
      setError("Проверьте номер телефона");
      return;
    }
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      customerType: forBusiness ? "B2B" : "B2C",
      deliveryMethod,
      paymentMethod,
      email: String(form.get("email") || "") || `${digitsFallback(phone)}@order.saityarik.ru`,
      phone: toE164(phone),
      name: String(form.get("name") || ""),
      companyName: String(form.get("companyName") || ""),
      inn: String(form.get("inn") || ""),
      kpp: String(form.get("kpp") || ""),
      legalAddress: String(form.get("legalAddress") || ""),
      deliveryAddress: String(form.get("deliveryAddress") || ""),
      comment: String(form.get("comment") || ""),
      promoCode: promo || undefined,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        price: i.price,
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
    router.push(`/thanks?order=${data.number}`);
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
      <p className="mt-2 text-sm text-[var(--muted)]">Без регистрации. Контакты, доставка и оплата — на одной странице.</p>
      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="grid gap-3 border border-[var(--line)] bg-white p-4 sm:grid-cols-2">
            <p className="font-semibold sm:col-span-2">Контакты</p>
            <label className="grid gap-1 text-sm sm:col-span-2">
              <span className="text-[var(--muted)]">Как к вам обращаться</span>
              <input
                name="name"
                required
                placeholder="Имя"
                className="rounded border border-[var(--line)] px-3 py-2 text-sm"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-[var(--muted)]">Телефон</span>
              <PhoneField value={phone} onChange={setPhone} />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-[var(--muted)]">E-mail (для чека, необязательно)</span>
              <input
                name="email"
                type="email"
                placeholder="mail@example.com"
                className="rounded border border-[var(--line)] px-3 py-2 text-sm"
              />
            </label>
            <p className="text-xs text-[var(--muted)] sm:col-span-2">
              Позвоним один раз, чтобы подтвердить заказ. Рассылок не будет.
            </p>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={forBusiness}
                onChange={(e) => {
                  setForBusiness(e.target.checked);
                  setPaymentMethod(e.target.checked ? "INVOICE" : "SBP");
                }}
              />
              Покупаю как организация (счёт на оплату)
            </label>
            {forBusiness && (
              <>
                <input
                  name="companyName"
                  required
                  placeholder="Организация"
                  className="rounded border border-[var(--line)] px-3 py-2 text-sm sm:col-span-2"
                />
                <input name="inn" required placeholder="ИНН" className="rounded border border-[var(--line)] px-3 py-2 text-sm" />
                <input name="kpp" placeholder="КПП" className="rounded border border-[var(--line)] px-3 py-2 text-sm" />
              </>
            )}
          </div>

          <div className="border border-[var(--line)] bg-white p-4">
            <p className="font-semibold">Доставка</p>
            <div className="mt-3 grid gap-2 text-sm">
              {[
                ["SELFPICKUP", "Самовывоз со склада (бесплатно)"],
                ["PICKUP_POINT", "Пункт выдачи (ПВЗ)"],
                ["COURIER", "Курьер до адреса"],
                ["B2B_CUSTOM", "Доставка на объект (согласование)"],
              ].map(([v, label]) => (
                <label key={v} className="flex items-center gap-2">
                  <input type="radio" name="delivery" checked={deliveryMethod === v} onChange={() => setDeliveryMethod(v)} />
                  {label}
                </label>
              ))}
            </div>
            {needsAddress && (
              <label className="mt-3 grid gap-1 text-sm">
                <span className="text-[var(--muted)]">
                  {deliveryMethod === "PICKUP_POINT"
                    ? "Адрес или код пункта выдачи"
                    : "Адрес доставки"}
                </span>
                <input
                  name="deliveryAddress"
                  required
                  placeholder={
                    deliveryMethod === "PICKUP_POINT"
                      ? "Например: ПВЗ на ул. Ленина, 10 или код CDEK-…"
                      : "Город, улица, дом"
                  }
                  className="w-full rounded border border-[var(--line)] px-3 py-2 text-sm"
                />
              </label>
            )}
          </div>

          <div className="border border-[var(--line)] bg-white p-4">
            <p className="font-semibold">Оплата</p>
            <div className="mt-3 grid gap-2 text-sm">
              {!forBusiness ? (
                <>
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={paymentMethod === "SBP"} onChange={() => setPaymentMethod("SBP")} />
                    СБП
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={paymentMethod === "CARD"} onChange={() => setPaymentMethod("CARD")} />
                    Карта «Мир» / другие
                  </label>
                </>
              ) : (
                <>
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={paymentMethod === "INVOICE"} onChange={() => setPaymentMethod("INVOICE")} />
                    Счёт на оплату (безнал)
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={paymentMethod === "SBP"} onChange={() => setPaymentMethod("SBP")} />
                    СБП / карта организации
                  </label>
                </>
              )}
            </div>
            <textarea
              name="comment"
              placeholder="Комментарий к заказу (необязательно)"
              className="mt-3 w-full rounded border border-[var(--line)] px-3 py-2 text-sm"
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

        <aside className="h-fit border border-[var(--line)] bg-white p-5 lg:sticky lg:top-28">
          <p className="font-semibold">Ваш заказ</p>
          <ul className="mt-3 space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-2">
                <span className="line-clamp-1">
                  {i.name} × {i.quantity}
                </span>
                <span>{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <input
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              placeholder="Промокод"
              className="flex-1 rounded border border-[var(--line)] px-2 py-1.5 text-sm"
            />
            <button type="button" className="btn btn-ghost !px-3 !py-1.5" onClick={applyPromo}>
              OK
            </button>
          </div>
          <div className="mt-4 space-y-1 text-sm">
            <p className="flex justify-between">
              <span>Товары</span>
              <span>{formatPrice(subtotal)}</span>
            </p>
            <p className="flex justify-between">
              <span>Скидка</span>
              <span>−{formatPrice(discount)}</span>
            </p>
            <p className="flex justify-between">
              <span>Доставка</span>
              <span>{formatPrice(deliveryCost)}</span>
            </p>
            <p className="flex justify-between border-t border-[var(--line)] pt-2 text-base font-semibold">
              <span>Итого</span>
              <span>{formatPrice(total)}</span>
            </p>
          </div>
          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={loading} className="btn btn-primary mt-5 w-full">
            {loading ? "Оформляем…" : paymentMethod === "INVOICE" ? "Запросить счёт" : "Оплатить"}
          </button>
        </aside>
      </form>
    </div>
  );
}

function digitsFallback(phone: string) {
  return phone.replace(/\D/g, "").slice(-10) || "guest";
}
