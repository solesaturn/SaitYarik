"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { PhoneField } from "@/components/PhoneField";
import { isValidRuPhone, toE164 } from "@/lib/phone";

export function B2BQuoteForm() {
  const { items, clear } = useCart();
  const [phone, setPhone] = useState("");
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!isValidRuPhone(phone)) {
      setError("Проверьте телефон");
      return;
    }
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("phone", toE164(phone));
    fd.set(
      "items",
      JSON.stringify(
        items.map((i) => ({
          productId: i.productId,
          sku: i.sku,
          name: i.name,
          quantity: i.quantity,
        }))
      )
    );
    const res = await fetch("/api/b2b-quote", { method: "POST", body: fd });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Не удалось отправить");
      setStatus("err");
      return;
    }
    setStatus("ok");
    clear();
    form.reset();
    setPhone("");
    setFileName("");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl bg-white p-5 text-sm">
      <p className="font-semibold">Заявка на расчёт</p>
      <input name="companyName" required placeholder="Компания" className="w-full rounded-full border border-[var(--line)] px-3 py-2" />
      <input name="inn" required placeholder="ИНН" className="w-full rounded-full border border-[var(--line)] px-3 py-2" />
      <input name="contactName" required placeholder="Контактное лицо" className="w-full rounded-full border border-[var(--line)] px-3 py-2" />
      <PhoneField value={phone} onChange={setPhone} />
      <input name="email" type="email" required placeholder="E-mail" className="w-full rounded-full border border-[var(--line)] px-3 py-2" />
      <textarea name="message" rows={3} placeholder="Комментарий" className="w-full rounded-2xl border border-[var(--line)] px-3 py-2" />
      <label className="grid gap-1.5 text-[var(--muted)]">
        Спецификация (необязательно)
        <span className="flex cursor-pointer items-center gap-3 rounded-full border border-[var(--line)] bg-[var(--sand)] px-2 py-1.5 hover:border-[var(--ink)] hover:bg-white">
          <input
            name="file"
            type="file"
            accept=".xlsx,.xls,.pdf,.csv,.doc,.docx"
            className="sr-only"
            onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
          />
          <span className="shrink-0 rounded-full bg-[var(--ink)] px-3.5 py-1.5 text-xs font-medium text-white">
            Выбрать файл
          </span>
          <span className={`min-w-0 truncate ${fileName ? "text-[var(--ink)]" : ""}`}>
            {fileName || "Excel, PDF или Word"}
          </span>
        </span>
      </label>
      {items.length > 0 && (
        <p className="text-xs text-[var(--muted)]">В заявку попадёт текущая корзина: {items.length} поз.</p>
      )}
      {error && <p className="text-red-700">{error}</p>}
      {status === "ok" && <p className="text-[var(--ok)]">Заявка отправлена. Мы свяжемся и пришлём расчёт.</p>}
      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? "Отправляем…" : "Отправить заявку"}
      </button>
    </form>
  );
}
