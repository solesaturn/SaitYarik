"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
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

  async function updateFaq(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/faq", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id, question: fd.get("question"), answer: fd.get("answer") }) });
    setMsg(res.ok ? "Вопрос сохранён в черновик" : "Не удалось сохранить вопрос");
    if (res.ok) router.refresh();
  }

  async function addFaq(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const res = await fetch("/api/admin/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        question: fd.get("question"),
        answer: fd.get("answer"),
      }),
    });
    setMsg(res.ok ? "Вопрос добавлен в черновик" : "Не удалось добавить вопрос");
    if (res.ok) { form.reset(); router.refresh(); }
  }

  async function delFaq(id: string) {
    const res = await fetch("/api/admin/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    setMsg(res.ok ? "Вопрос удалён из черновика" : "Не удалось удалить вопрос");
    if (res.ok) router.refresh();
  }

  async function uploadCert(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await fetch("/api/admin/certificate", { method: "POST", body: new FormData(e.currentTarget) });
    setMsg(res.ok ? "Файл сертификата загружен" : "Ошибка загрузки");
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-10 text-sm">
      {msg && <p role="status" className="rounded-xl bg-[var(--sand)] p-3">{msg}</p>}
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
          ["about_text", "О бренде"],
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

      <section className="space-y-3 rounded-2xl bg-white p-5">
        <h2 className="font-semibold">Вопросы на главной странице</h2>
        <p>Сначала сохраните вопросы в черновик, затем проверьте их в предпросмотре и опубликуйте.</p>
        <div className="flex flex-wrap gap-3"><Link className="btn btn-copper" href="/?preview=home#home-faq-title">Предпросмотр вопросов</Link><button type="button" className="btn btn-primary" onClick={async()=>{const res=await fetch('/api/admin/faq',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'publish'})});setMsg(res.ok?'Вопросы опубликованы':'Ошибка публикации');router.refresh();}}>Опубликовать вопросы</button></div>
        {faqs.map((f) => (
          <form key={`${f.id}-${f.question}-${f.answer}`} onSubmit={(e) => updateFaq(e, f.id)} className="space-y-3 border-b border-[var(--line)] pb-4">
            <label className="grid gap-1">Вопрос<input name="question" required maxLength={300} defaultValue={f.question} className="w-full rounded-xl border px-3 py-2" /></label>
            <label className="grid gap-1">Ответ<textarea name="answer" required maxLength={4000} defaultValue={f.answer} rows={4} className="w-full rounded-xl border px-3 py-2" /></label>
            <button type="submit" className="btn btn-copper">Сохранить вопрос в черновик</button>
            <button type="button" className="ml-3 text-xs underline" onClick={() => delFaq(f.id)}>Удалить</button>
          </form>
        ))}
        <form onSubmit={addFaq} className="space-y-3 pt-3">
        <input name="question" required placeholder="Вопрос" className="w-full rounded-full border px-3 py-2" />
        <textarea name="answer" required placeholder="Ответ" rows={3} className="w-full rounded-2xl border px-3 py-2" />
        <button className="btn btn-copper" type="submit">
          Добавить вопрос
        </button>
        </form>
      </section>

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
