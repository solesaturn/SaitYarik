import { redirect } from "next/navigation";
import { getSession, isStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/AdminNav";
import { StatusSelect } from "@/components/AdminForms";

export const dynamic = "force-dynamic";

export default async function AdminB2BPage() {
  const session = await getSession();
  if (!session || !isStaff(session.role)) redirect("/account");
  const rows = await prisma.b2BRequest.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <AdminNav />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="section-title">Заявки B2B</h1>
        <a href="/api/admin/b2b" className="btn btn-copper">
          Выгрузить Excel (CSV)
        </a>
      </div>
      <div className="mt-8 space-y-4">
        {rows.map((r) => {
          const items = JSON.parse(r.itemsJson || "[]") as { sku?: string; name?: string; quantity?: number }[];
          return (
            <article key={r.id} className="rounded-2xl bg-white p-5 text-sm">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="font-semibold">{r.companyName}</p>
                  <p className="text-[var(--muted)]">
                    ИНН {r.inn} · {r.contactName} · {r.phone} · {r.email}
                  </p>
                  {r.message && <p className="mt-2">{r.message}</p>}
                </div>
                <StatusSelect
                  id={r.id}
                  value={r.status}
                  endpoint="/api/admin/b2b"
                  options={["NEW", "IN_PROGRESS", "QUOTED", "CLOSED"]}
                />
              </div>
              {items.length > 0 && (
                <ul className="mt-3 space-y-1 text-[var(--muted)]">
                  {items.map((i, idx) => (
                    <li key={idx}>
                      {i.sku} · {i.name} × {i.quantity}
                    </li>
                  ))}
                </ul>
              )}
              {r.fileUrl && (
                <a href={r.fileUrl} className="mt-3 inline-block underline">
                  Файл: {r.fileName || "скачать"}
                </a>
              )}
            </article>
          );
        })}
        {rows.length === 0 && <p className="text-sm text-[var(--muted)]">Заявок нет.</p>}
      </div>
    </div>
  );
}
