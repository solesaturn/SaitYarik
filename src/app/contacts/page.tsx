import { ContactPageForm } from "@/components/ContactPageForm";
import { getSite } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;
  const site = await getSite();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="section-title">Контакты</h1>
      {sent && (
        <p className="mt-4 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-800">Сообщение отправлено.</p>
      )}
      <div className="mt-6 space-y-2 rounded-2xl bg-white p-5 text-sm">
        <p>Телефон: {site.phone}</p>
        <p>E-mail: {site.email}</p>
        <p>Город: {site.city}</p>
        <p className="text-[var(--muted)]">{site.shortName}</p>
      </div>
      <ContactPageForm />
    </div>
  );
}
