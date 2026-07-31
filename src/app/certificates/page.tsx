import Link from "next/link";

export const metadata = {
  title: "Сертификаты и документы",
  description: "Сертификаты соответствия и декларации ТР ТС на продукцию Futina",
};

const docs = [
  {
    name: "Сертификат соответствия ТР ТС — розетки и выключатели Futina",
    note: "Скан будет загружен после предоставления заказчиком. По запросу вышлем на e-mail.",
  },
  {
    name: "Декларация о соответствии ТР ТС — рамки и механизмы",
    note: "Документ подтверждает качество продукции. Актуальная версия — у менеджера.",
  },
];

export default function CertificatesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="section-title">Сертификаты и документы</h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
        Продукция Futina поставляется с подтверждением соответствия требованиям ТР ТС. Ниже — перечень документов;
        сканы можно запросить у менеджера или скачать, когда файлы будут размещены на сайте.
      </p>

      <ul className="mt-8 space-y-4">
        {docs.map((d) => (
          <li key={d.name} className="border border-[var(--line)] bg-white p-5">
            <p className="font-semibold">{d.name}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">{d.note}</p>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm text-[var(--muted)]">
        Нужен конкретный документ к артикулу?{" "}
        <Link href="/contacts" className="font-semibold text-[var(--ink)] underline">
          Оставьте заявку
        </Link>{" "}
        — пришлём в рабочее время.
      </p>
    </div>
  );
}
