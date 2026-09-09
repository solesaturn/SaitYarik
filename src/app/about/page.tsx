import { getSite } from "@/lib/site";
import Link from "next/link";

export const metadata = {
  title: "О бренде",
  description: "Laitys — розетки, выключатели и рамки для современного интерьера",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const site = await getSite();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="section-title">О бренде</h1>
      <div className="mt-6 space-y-4 rounded-2xl bg-white p-6 text-sm leading-relaxed text-[var(--muted)]">
        <p>
          Laitys — розетки, выключатели и рамки для современного интерьера. Мы начали продажи на маркетплейсах, а теперь
          развиваем собственный интернет-магазин.
        </p>
        <p>
          Изготовитель в сертификатах — Guangdong Futina Electrical Co., Ltd. Продавец на сайте — {site.legalName}.
        </p>
      </div>
      <h2 className="mt-10 text-xl font-semibold">Реквизиты</h2>
      <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
        <li>{site.legalName}</li>
        <li>ИНН {site.inn}</li>
        <li>ОГРНИП {site.ogrnip}</li>
        <li>{site.address}</li>
        <li>Телефон: {site.phone}</li>
        <li>E-mail: {site.email}</li>
      </ul>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/catalog" className="btn btn-primary">
          В каталог
        </Link>
        <Link href="/documents" className="btn btn-ghost">
          Документы
        </Link>
        <Link href="/contacts" className="btn btn-ghost">
          Контакты
        </Link>
      </div>
    </div>
  );
}
