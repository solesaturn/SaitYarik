import { getSite } from "@/lib/site";

export const metadata = { title: "Гарантия и возврат" };
export const dynamic = "force-dynamic";

export default async function ReturnsPage() {
  const site = await getSite();
  const warranty = await import("@/lib/site").then((m) => m.getSetting("warranty_note", ""));
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="section-title">Гарантия и возврат</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-[var(--muted)]">
        <p>Гарантия: {warranty || "10 лет; для USB A+C и TV+PC — 1 год"}.</p>
        <p>
          Возврат товара надлежащего качества — в сроки закона о защите прав потребителей, если сохранены вид и
          комплектация.
        </p>
        <p>
          Продавец: {site.legalName}, ИНН {site.inn}.
        </p>
      </div>
    </div>
  );
}
