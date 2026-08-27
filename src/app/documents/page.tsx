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
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
        Действующие сертификаты соответствия. Изготовитель в документах — Guangdong Futina Electrical Co., Ltd.
        Заявитель — {site.shortName}. Макеты деклараций на сайт не публикуются.
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
              <a href={d.fileUrl} className="mt-3 inline-block text-sm underline">
                Скачать PDF
              </a>
            ) : (
              <p className="mt-3 text-sm text-[var(--muted)]">Файл загрузит владелец в админке, когда скан будет под рукой.</p>
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
