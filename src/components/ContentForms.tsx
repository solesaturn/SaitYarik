"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ContentForms({
  map,
  faqs,
  certs,
}: {
  map: Record<string, string>;
  faqs: { id: string; question: string; answer: string }[];
  certs: { id: string; title: string; number: string; fileUrl: string | null }[];
}) {
  const router = useRouter();
  const [msg, setMsg] = useState("");

  async function saveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setMsg(res.ok ? "Контакты сохранены" : "Ошибка");
    router.refresh();
  }

  async function addFaq(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/admin/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        question: fd.get("question"),
        answer: fd.get("answer"),
      }),
    });
    (e.currentTarget as HTMLFormElement).reset();
    router.refresh();
  }

  async function delFaq(id: string) {
    await fetch("/api/admin/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    router.refresh();
  }

  async function uploadCert(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await fetch("/api/admin/certificate", { method: "POST", body: new FormData(e.currentTarget) });
    setMsg(res.ok ? "Файл сертификата загружен" : "Ошибка загрузки");
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-10 text-sm">
      <form onSubmit={saveSettings} className="space-y-3 rounded-2xl bg-white p-5">
        <p className="font-semibold">Контакты и тексты</p>
        {[
          ["phone", "Телефон"],
          ["email", "E-mail"],
          ["city", "Город"],
          ["address", "Адрес"],
          ["tagline", "Слоган"],
          ["delivery_note", "Доставка"],
          ["payment_note", "Оплата"],
          ["warranty_note", "Гарантия"],
          ["about_text", "О нас"],
        ].map(([k, label]) => (
          <label key={k} className="grid gap-1">
            {label}
            {k.endsWith("_text") || k.endsWith("_note") ? (
              <textarea name={k} defaultValue={map[k] || ""} rows={3} className="rounded-2xl border px-3 py-2" />
            ) : (
              <input name={k} defaultValue={map[k] || ""} className="rounded-full border px-3 py-2" />
            )}
          </label>
        ))}
        <label className="flex items-center gap-2">
          <input type="hidden" name="index_site" value="0" />
          <input type="checkbox" name="index_site" value="1" defaultChecked={map.index_site === "1"} />
          Открыть сайт для индексации
        </label>
        <p className="text-xs text-[var(--muted)]">
          Пока тестовые данные и нулевые цены — индексацию лучше не включать.
        </p>
        <button className="btn btn-primary" type="submit">
          Сохранить
        </button>
        {msg && <span className="ml-2">{msg}</span>}
      </form>

      <form onSubmit={addFaq} className="space-y-3 rounded-2xl bg-white p-5">
        <p className="font-semibold">FAQ</p>
        {faqs.map((f) => (
          <div key={f.id} className="border-b border-[var(--line)] pb-3">
            <p className="font-medium">{f.question}</p>
            <p className="mt-1 text-[var(--muted)]">{f.answer}</p>
            <button type="button" className="mt-1 text-xs underline" onClick={() => delFaq(f.id)}>
              Удалить
            </button>
          </div>
        ))}
        <input name="question" required placeholder="Вопрос" className="w-full rounded-full border px-3 py-2" />
        <textarea name="answer" required placeholder="Ответ" rows={3} className="w-full rounded-2xl border px-3 py-2" />
        <button className="btn btn-copper" type="submit">
          Добавить вопрос
        </button>
      </form>

      <div className="space-y-3 rounded-2xl bg-white p-5">
        <p className="font-semibold">Сертификаты (только действующие файлы)</p>
        {certs.map((c) => (
          <form key={c.id} onSubmit={uploadCert} className="border-b border-[var(--line)] pb-3">
            <p>{c.title}</p>
            <p className="text-[var(--muted)]">{c.number}</p>
            <input type="hidden" name="id" value={c.id} />
            <input type="file" name="file" accept="application/pdf" required className="mt-2" />
            <button className="btn btn-ghost mt-2 !py-1 text-xs" type="submit">
              Загрузить PDF
            </button>
            {c.fileUrl && (
              <a href={c.fileUrl} className="ml-3 text-xs underline">
                текущий файл
              </a>
            )}
          </form>
        ))}
      </div>
    </div>
  );
}
