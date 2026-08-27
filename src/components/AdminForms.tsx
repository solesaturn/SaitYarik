"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function StatusSelect({
  id,
  value,
  options,
  endpoint,
}: {
  id: string;
  value: string;
  options: string[];
  endpoint: string;
}) {
  const router = useRouter();
  const [v, setV] = useState(value);
  async function onChange(next: string) {
    setV(next);
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    });
    router.refresh();
  }
  return (
    <select value={v} onChange={(e) => onChange(e.target.value)} className="rounded-full border border-[var(--line)] px-2 py-1 text-sm">
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function ProductQuickForm({
  id,
  priceRetail,
  stock,
}: {
  id: string;
  priceRetail: number;
  stock: number;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("id", id);
    const res = await fetch("/api/admin/product", { method: "POST", body: fd });
    setMsg(res.ok ? "Сохранено" : "Ошибка");
    router.refresh();
  }
  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2">
      <input name="priceRetail" defaultValue={priceRetail || ""} placeholder="цена" className="w-24 rounded-full border px-2 py-1 text-sm" />
      <input name="stock" defaultValue={stock || ""} placeholder="остаток" className="w-20 rounded-full border px-2 py-1 text-sm" />
      <button className="btn btn-primary !px-3 !py-1 text-xs" type="submit">
        OK
      </button>
      {msg && <span className="text-xs text-[var(--muted)]">{msg}</span>}
    </form>
  );
}
