"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function B2BRegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "register",
        customerType: "B2B",
        email: form.get("email"),
        password: form.get("password"),
        name: form.get("name"),
        phone: form.get("phone"),
        companyName: form.get("companyName"),
        inn: form.get("inn"),
        kpp: form.get("kpp"),
        legalAddress: form.get("legalAddress"),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Ошибка");
      return;
    }
    router.push("/account?registered=1");
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-3 border border-[var(--line)] bg-white p-4">
      <input name="companyName" required placeholder="Название организации" className="rounded border border-[var(--line)] px-3 py-2 text-sm" />
      <input name="inn" required placeholder="ИНН" className="rounded border border-[var(--line)] px-3 py-2 text-sm" />
      <input name="kpp" placeholder="КПП" className="rounded border border-[var(--line)] px-3 py-2 text-sm" />
      <input name="legalAddress" required placeholder="Юридический адрес" className="rounded border border-[var(--line)] px-3 py-2 text-sm" />
      <input name="name" required placeholder="Контактное лицо" className="rounded border border-[var(--line)] px-3 py-2 text-sm" />
      <input name="phone" required placeholder="Телефон" className="rounded border border-[var(--line)] px-3 py-2 text-sm" />
      <input name="email" type="email" required placeholder="E-mail" className="rounded border border-[var(--line)] px-3 py-2 text-sm" />
      <input name="password" type="password" required minLength={6} placeholder="Пароль" className="rounded border border-[var(--line)] px-3 py-2 text-sm" />
      <label className="flex items-start gap-2 text-xs text-[var(--muted)]">
        <input type="checkbox" required className="mt-0.5" />
        Согласие на обработку ПДн и получение оптовых условий после модерации
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={loading} className="btn btn-copper">
        {loading ? "Отправка…" : "Зарегистрироваться"}
      </button>
    </form>
  );
}
