import { getSite } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const site = await getSite();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="section-title">Пользовательское соглашение</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-[var(--muted)]">
        <p>
          Используя сайт {site.name}, вы соглашаетесь с правилами заказа, заявок для бизнеса и обработки персональных
          данных.
        </p>
        <p>Запрещены спам через формы и попытки вмешательства в работу сайта.</p>
      </div>
    </div>
  );
}
