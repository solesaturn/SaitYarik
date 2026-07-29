import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, isStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ApproveB2BButton } from "@/components/ApproveB2BButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || !isStaff(session.role)) redirect("/account");

  const [orders, products, b2b, leads, logs, users] = await Promise.all([
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.product.count(),
    prisma.b2BRequest.findMany({ where: { status: "NEW" }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.contactLead.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.syncLog.findMany({ orderBy: { createdAt: "desc" }, take: 15 }),
    prisma.user.findMany({ where: { customerType: "B2B", b2bApproved: false }, take: 20 }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="section-title">Админ-панель</h1>
        <p className="text-sm text-[var(--muted)]">{session.email} · {session.role}</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { t: "Товары в каталоге", v: String(products) },
          { t: "Заказы", v: String(orders.length) },
          { t: "B2B заявки", v: String(b2b.length) },
          { t: "Лиды", v: String(leads.length) },
        ].map((x) => (
          <div key={x.t} className="border border-[var(--line)] bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{x.t}</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl">{x.v}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Заказы</h2>
        <div className="mt-4 overflow-x-auto border border-[var(--line)] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--sand)] text-xs uppercase tracking-wide">
              <tr>
                <th className="p-3">Номер</th>
                <th className="p-3">Клиент</th>
                <th className="p-3">Сумма</th>
                <th className="p-3">Статус</th>
                <th className="p-3">Оплата</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-[var(--line)]">
                  <td className="p-3 font-medium">{o.number}</td>
                  <td className="p-3">
                    {o.email}
                    <div className="text-xs text-[var(--muted)]">{o.customerType}</div>
                  </td>
                  <td className="p-3">{formatPrice(o.total)}</td>
                  <td className="p-3">{o.status}</td>
                  <td className="p-3">{o.paymentMethod || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold">Модерация B2B</h2>
          <div className="mt-4 space-y-3">
            {users.map((u) => (
              <div key={u.id} className="border border-[var(--line)] bg-white p-4 text-sm">
                <p className="font-semibold">{u.companyName || u.email}</p>
                <p className="text-[var(--muted)]">ИНН {u.inn || "—"} · {u.email}</p>
                <ApproveB2BButton userId={u.id} />
              </div>
            ))}
            {users.length === 0 && <p className="text-sm text-[var(--muted)]">Нет заявок на одобрение.</p>}
            {b2b.map((r) => (
              <div key={r.id} className="border border-[var(--line)] bg-white p-4 text-sm">
                <p className="font-semibold">{r.companyName}</p>
                <p className="text-[var(--muted)]">{r.type} · {r.email} · {r.phone}</p>
                <p className="mt-1">{r.message}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Журнал обмена 1С / оплатыта</h2>
          <div className="mt-4 space-y-2">
            {logs.map((l) => (
              <div key={l.id} className="border border-[var(--line)] bg-white p-3 text-xs">
                <p className="font-semibold">
                  {l.type} · {l.direction} · {l.status}
                </p>
                <p className="text-[var(--muted)]">{l.message}</p>
                <p className="text-[var(--muted)]">{new Date(l.createdAt).toLocaleString("ru-RU")}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm">
            Endpoint обмена:{" "}
            <code className="rounded bg-[var(--sand)] px-1">/api/1c/exchange</code>
          </p>
          <Link href="/admin/settings" className="mt-2 inline-block text-sm underline">
            Настройки SEO / доставка / уведомления
          </Link>
        </div>
      </section>
    </div>
  );
}
