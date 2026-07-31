"use client";

import { useState } from "react";
import Link from "next/link";
import { PhoneField } from "@/components/PhoneField";
import { isValidRuPhone, toE164 } from "@/lib/phone";

type Props = {
  productId: string;
  productName: string;
  sku: string;
  quantity?: number;
};

export function OneClickBuy({ productId, productName, sku, quantity = 1 }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!isValidRuPhone(phone)) {
      setError("Проверьте номер телефона");
      return;
    }
    if (!consent) {
      setError("Нужно согласие на обработку персональных данных");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        phone: toE164(phone),
        message: `Купить в 1 клик: ${productName} (${sku}), qty ${quantity}, id ${productId}`,
        source: "one_click",
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Не удалось отправить");
      return;
    }
    setDone(true);
  }

  return (
    <>
      <button type="button" className="btn btn-copper" onClick={() => setOpen(true)}>
        Купить в 1 клик
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-[var(--paper)] p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal
            aria-labelledby="one-click-title"
          >
            {done ? (
              <p className="text-sm text-green-800" role="status">
                Заявка принята, перезвоним в течение 15 минут в рабочее время. Менеджер оформит заказ сам.
              </p>
            ) : (
              <form onSubmit={onSubmit} className="grid gap-3">
                <h2 id="one-click-title" className="font-[family-name:var(--font-display)] text-xl">
                  Купить в 1 клик
                </h2>
                <p className="text-sm text-[var(--muted)]">
                  {productName}. Оставьте имя и телефон — перезвоним и оформим.
                </p>
                <label className="grid gap-1 text-sm">
                  <span className="text-[var(--muted)]">Как к вам обращаться</span>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Имя"
                    className="rounded border border-[var(--line)] bg-white px-3 py-2 text-sm"
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="text-[var(--muted)]">Телефон</span>
                  <PhoneField value={phone} onChange={setPhone} />
                </label>
                <p className="text-xs text-[var(--muted)]">
                  Позвоним один раз, чтобы подтвердить заказ. Рассылок не будет.
                </p>
                <label className="flex items-start gap-2 text-xs text-[var(--muted)]">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>
                    Согласен на обработку персональных данных по{" "}
                    <Link href="/legal/privacy" className="underline">
                      политике
                    </Link>
                  </span>
                </label>
                {error && <p className="text-sm text-red-700">{error}</p>}
                <div className="flex flex-wrap gap-2">
                  <button type="submit" disabled={loading} className="btn btn-primary">
                    {loading ? "Отправляем…" : "Жду звонка"}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                    Отмена
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
