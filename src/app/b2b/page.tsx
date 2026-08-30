import { B2BQuoteForm } from "@/components/B2BQuoteForm";

export const metadata = {
  title: "Для бизнеса",
  description: "Заявка на персональный расчёт Laitys",
};

export default function B2BPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <h1 className="section-title">Для бизнеса</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
        Соберите корзину и отправьте заявку. Laitys считает условия вручную и высылает Excel, PDF или счёт. Сайт сам
        оптовую цену не считает и коммерческое предложение не формирует.
      </p>
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="space-y-4 text-sm text-[var(--muted)]">
          <p>Нужны компания, ИНН, контакт, телефон и e-mail. При необходимости приложите свою спецификацию.</p>
          <p>Заявка появится в админке и уйдёт уведомлением на почту или в Telegram, если канал подключен.</p>
        </div>
        <B2BQuoteForm />
      </div>
    </div>
  );
}
