import { ContactPageForm } from "@/components/ContactPageForm";
import { SITE } from "@/lib/pricing";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="section-title">Контакты</h1>
      {sent && (
        <p className="mt-4 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Заявка принята, перезвоним в течение 15 минут в рабочее время.
        </p>
      )}
      <div className="mt-6 space-y-2 rounded-2xl bg-white p-5 text-sm">
        <p>Телефон: {SITE.phone}</p>
        <p>E-mail: {SITE.email}</p>
        <p>Город: {SITE.city}</p>
        <p>Склад / самовывоз: складской комплекс «Электро», ворота 4</p>
      </div>
      <ContactPageForm />
    </div>
  );
}
