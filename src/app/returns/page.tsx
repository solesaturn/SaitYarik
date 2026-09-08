import { getSite } from "@/lib/site";
import Link from "next/link";

export const metadata = { title: "Гарантия" };
export const dynamic = "force-dynamic";

export default async function ReturnsPage() {
  const site = await getSite();
  const warranty = await import("@/lib/site").then((m) => m.getSetting("warranty_note", ""));
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="section-title">Гарантия</h1>
      <div className="mt-6 space-y-4 leading-relaxed text-[var(--muted)]">
        <p>
          {warranty ||
            "10 лет на механизмы розеток и выключателей. Для USB A+C и TV+компьютер — 1 год. Для рамок срок указан в карточке модели."}
        </p>
        <p>
          Возврат товара надлежащего качества — в сроки закона о защите прав потребителей, если сохранены вид и
          комплектация.
        </p>
        <p>
          Продавец: {site.legalName}, ИНН {site.inn}.
        </p>
      </div>
      <Link href="/documents" className="btn btn-copper mt-8">
        Сертификаты
      </Link>
    </div>
  );
}
