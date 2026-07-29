"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";

type Me = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  customerType: string;
  b2bApproved: boolean;
  companyName: string | null;
  orders: {
    id: string;
    number: string;
    status: string;
    total: number;
    createdAt: string;
    trackNumber: string | null;
  }[];
};

export default function AccountClient() {
  const [me, setMe] = useState<Me | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const router = useRouter();
  const sp = useSearchParams();

  async function load() {
    const res = await fetch("/api/account");
    if (res.ok) setMe(await res.json());
    else setMe(null);
  }

  useEffect(() => {
    load();
  }, []);

  async function auth(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: mode,
        email: form.get("email"),
        password: form.get("password"),
        name: form.get("name"),
        phone: form.get("phone"),
        customerType: "B2C",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Ошибка");
      return;
    }
    if (data.role === "ADMIN" || data.role === "MANAGER") {
      router.push("/admin");
      return;
    }
    await load();
  }

  async function logout() {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setMe(null);
  }

  if (!me) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="section-title">{mode === "login" ? "Вход" : "Регистрация"}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Демо: demo@saityarik.ru / demo123 · admin@saityarik.ru / admin123 · opt@saityarik.ru / demo123
        </p>
        <form onSubmit={auth} className="mt-6 grid gap-3 border border-[var(--line)] bg-white p-5">
          {mode === "register" && (
            <>
              <input name="name" placeholder="Имя" className="rounded border border-[var(--line)] px-3 py-2 text-sm" />
              <input name="phone" placeholder="Телефон" className="rounded border border-[var(--line)] px-3 py-2 text-sm" />
            </>
          )}
          <input name="email" type="email" required placeholder="E-mail" className="rounded border border-[var(--line)] px-3 py-2 text-sm" />
          <input name="password" type="password" required placeholder="Пароль" className="rounded border border-[var(--line)] px-3 py-2 text-sm" />
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button className="btn btn-primary" type="submit">
            {mode === "login" ? "Войти" : "Создать аккаунт"}
          </button>
        </form>
        <button type="button" className="mt-4 text-sm underline" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
        </button>
        <p className="mt-4 text-sm">
          Юрлицо?{" "}
          <Link href="/b2b" className="underline">
            Регистрация B2B
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="section-title">Личный кабинет</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {me.name || me.email} · {me.customerType}
            {me.customerType === "B2B" && (me.b2bApproved ? " · опт одобрен" : " · ожидает модерации")}
          </p>
          {sp.get("registered") && (
            <p className="mt-2 text-sm text-green-800">Регистрация принята. Для B2B дождитесь подтверждения менеджера.</p>
          )}
        </div>
        <div className="flex gap-2">
          {(me.role === "ADMIN" || me.role === "MANAGER" || me.role === "CONTENT") && (
            <Link href="/admin" className="btn btn-copper">
              Админка
            </Link>
          )}
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Выйти
          </button>
        </div>
      </div>

      {me.customerType === "B2B" && (
        <div className="mt-6 border border-[var(--line)] bg-white p-4 text-sm">
          <p className="font-semibold">{me.companyName || "Организация"}</p>
          <p className="mt-1 text-[var(--muted)]">Счета, УПД и персональные цены — после синхронизации с 1С и одобрения.</p>
          <Link href="/b2b" className="mt-2 inline-block underline">
            Быстрый заказ по спецификации
          </Link>
        </div>
      )}

      <h2 className="mt-10 text-xl font-semibold">История заказов</h2>
      <div className="mt-4 space-y-3">
        {me.orders.length === 0 && <p className="text-sm text-[var(--muted)]">Заказов пока нет.</p>}
        {me.orders.map((o) => (
          <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 border border-[var(--line)] bg-white p-4">
            <div>
              <p className="font-semibold">{o.number}</p>
              <p className="text-xs text-[var(--muted)]">
                {new Date(o.createdAt).toLocaleString("ru-RU")} · {o.status}
                {o.trackNumber ? ` · трек ${o.trackNumber}` : ""}
              </p>
            </div>
            <p className="font-semibold">{formatPrice(o.total)}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link href="/favorites" className="underline">
          Избранное
        </Link>
        <Link href="/compare" className="underline">
          Сравнение
        </Link>
        <Link href="/returns" className="underline">
          Возврат
        </Link>
      </div>
    </div>
  );
}
