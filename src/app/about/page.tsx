import { getSite } from "@/lib/site";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { productAlt } from "@/lib/product-display";

export const metadata = {
  title: "О бренде",
  description: "Laitys — розетки, выключатели и рамки для современного интерьера",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const site = await getSite();
  const collection = await prisma.product.findMany({
    where: { active: true, sku: { in: ["D1-WH", "D1-GY", "D1-BK"] } },
    select: { id: true, sku: true, name: true, color: true, imageUrl: true },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="section-title">О бренде</h1>
      <p className="mt-6 text-lg leading-relaxed text-[var(--muted)]">
        Laitys — розетки, выключатели и рамки для современного интерьера. Мы начали продажи на маркетплейсах, а теперь
        развиваем собственный интернет-магазин.
      </p>
      {collection.length > 0 && (
        <div className="mt-8 grid grid-cols-3 gap-3">
          {collection.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-2xl bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.imageUrl || "/images/placeholder.png"} alt={productAlt(p)} className="aspect-square w-full object-cover object-left" />
            </div>
          ))}
        </div>
      )}
      <Link href="/catalog" className="btn btn-primary mt-8 w-full sm:w-auto">
        В каталог
      </Link>
      <h2 className="mt-12 text-xl font-semibold">Реквизиты</h2>
      <ul className="mt-4 space-y-2 text-[0.9375rem] text-[var(--muted)]">
        <li>{site.legalName}</li>
        <li>ИНН {site.inn}</li>
        <li>ОГРНИП {site.ogrnip}</li>
        <li>{site.address}</li>
      </ul>
      <p className="mt-6 text-[0.9375rem] text-[var(--muted)]">
        Изготовитель в сертификатах — Guangdong Futina Electrical Co., Ltd. Продавец на сайте — {site.legalName}.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/contacts" className="btn btn-ghost">
          Контакты
        </Link>
        <Link href="/documents" className="btn btn-ghost">
          Документы
        </Link>
        <Link href="/delivery" className="btn btn-ghost">
          Доставка и оплата
        </Link>
      </div>
    </div>
  );
}
