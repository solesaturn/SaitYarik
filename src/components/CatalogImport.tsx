"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CatalogImport() {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const res = await fetch("/api/admin/catalog-file", { method: "POST", body: text });
    const data = await res.json();
    setMsg(res.ok ? `Обновлено: ${data.updated}` : data.error || "Ошибка");
    router.refresh();
  }
  return (
    <label className="btn btn-ghost cursor-pointer">
      Загрузить Excel (CSV)
      <input type="file" accept=".csv,.txt" className="hidden" onChange={onChange} />
      {msg && <span className="ml-2 text-xs">{msg}</span>}
    </label>
  );
}
