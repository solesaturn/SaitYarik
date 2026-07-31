"use client";

import { useState } from "react";
import Link from "next/link";
import { PhoneField } from "@/components/PhoneField";
import { isValidRuPhone, toE164 } from "@/lib/phone";

type Variant = "callback" | "quote" | "contact" | "bulk";

const copy: Record<
  Variant,
  { title: string; submit: string; success: string; showEmail?: boolean; showMessage?: boolean }
> = {
  callback: {
    title: "Обратный звонок",
    submit: "Жду звонка",
    success: "Заявка принята, перезвоним в течение 15 минут в рабочее время",
  },
  quote: {
    title: "Рассчитаем цену",
    submit: "Отправить заявку",
    success: "Заявка принята, перезвоним в течение 15 минут в рабочее время",
    showEmail: true,
  },
  contact: {
    title: "Напишите нам",
    submit: "Отправить",
    success: "Заявка принята, перезвоним в течение 15 минут в рабочее время",
    showMessage: true,
  },
  bulk: {
    title: "Берёте много? Рассчитаем цену",
    submit: "Рассчитать",
    success: "Заявка принята, перезвоним в течение 15 минут в рабочее время",
  },
};

type Props = {
  variant?: Variant;
  source?: string;
  productSku?: string;
  productName?: string;
  className?: string;
  dark?: boolean;
};

export function LeadForm({
  variant = "callback",
  source,
  productSku,
  productName,
  className = "",
  dark = false,
}: Props) {
  const cfg = copy[variant];
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
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
    const parts = [message.trim()];
    if (productName || productSku) {
      parts.push(`Товар: ${productName || ""} ${productSku ? `(${productSku})` : ""}`.trim());
    }
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        phone: toE164(phone),
        email: email.trim() || undefined,
        message: parts.filter(Boolean).join("\n") || undefined,
        source: source || variant,
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

  if (done) {
    return (
      <div
        className={`rounded-2xl border border-green-200 bg-green-50 p-5 text-sm text-green-900 ${className}`}
        role="status"
      >
        {cfg.success}
      </div>
    );
  }

  const field = dark
    ? "rounded border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50"
    : "rounded border border-[var(--line)] bg-white px-3 py-2 text-sm";

  return (
    <form onSubmit={onSubmit} className={`grid gap-3 ${className}`}>
      {cfg.title && <p className={`font-semibold ${dark ? "text-white" : ""}`}>{cfg.title}</p>}
      <label className="grid gap-1 text-sm">
        <span className={dark ? "text-white/70" : "text-[var(--muted)]"}>Как к вам обращаться</span>
        <input
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Имя"
          className={field}
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className={dark ? "text-white/70" : "text-[var(--muted)]"}>Телефон</span>
        <PhoneField value={phone} onChange={setPhone} className={field} />
      </label>
      {cfg.showEmail && (
        <label className="grid gap-1 text-sm">
          <span className={dark ? "text-white/70" : "text-[var(--muted)]"}>E-mail (необязательно)</span>
          <input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="mail@example.com"
            className={field}
          />
        </label>
      )}
      {cfg.showMessage && (
        <label className="grid gap-1 text-sm">
          <span className={dark ? "text-white/70" : "text-[var(--muted)]"}>Вопрос</span>
          <textarea
            name="message"
            required
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Коротко опишите вопрос"
            className={field}
          />
        </label>
      )}
      <p className={`text-xs ${dark ? "text-white/55" : "text-[var(--muted)]"}`}>
        Позвоним один раз, чтобы подтвердить заказ. Рассылок не будет.
      </p>
      <label className={`flex items-start gap-2 text-xs ${dark ? "text-white/70" : "text-[var(--muted)]"}`}>
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
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className={`btn ${dark ? "btn-copper" : "btn-primary"} w-fit`}>
        {loading ? "Отправляем…" : cfg.submit}
      </button>
    </form>
  );
}
