import { prisma } from "@/lib/prisma";
import { getSite } from "@/lib/site";
import Link from "next/link";

export const metadata = {
  title: "Документы",
  description: "Сертификаты соответствия на продукцию Laitys",
};

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const [site, docs] = await Promise.all([
    getSite(),
    prisma.certificate.findMany({ where: { published: true }, orderBy: { number: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="section-title">Документы</h1>
      <p className="mt-3 leading-relaxed text-[var(--muted)]">
        Действующие сертификаты соответствия. Изготовитель в документах — Guangdong Futina Electrical Co., Ltd.
        Заявитель — {site.shortName}.
      </p>
      <ul className="mt-8 space-y-4">
        {docs.map((d) => (
          <li key={d.id} className="rounded-2xl bg-white p-5">
            <p className="font-semibold">{d.title}</p>
            <p className="mt-1 text-sm">{d.number}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {d.validFrom && d.validUntil ? `${d.validFrom} — ${d.validUntil}` : null}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">Артикулы: {d.skuList}</p>
            {d.fileUrl ? (
              <a href={d.fileUrl} className="btn btn-primary mt-4">
                Открыть сертификат
              </a>
            ) : (
              <Link href="/contacts" className="mt-3 inline-block text-sm underline">
                Запросить документ
              </Link>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-[var(--muted)]">
        Нужен документ к артикулу?{" "}
        <Link href="/contacts" className="underline">
          Напишите нам
        </Link>
        .
      </p>
    </div>
  );
}
