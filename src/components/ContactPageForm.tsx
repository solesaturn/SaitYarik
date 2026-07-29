export function ContactPageForm() {
  return (
    <form action="/api/contact" method="post" className="mt-8 grid gap-3">
      <input name="name" required placeholder="Имя" className="rounded border border-[var(--line)] bg-white px-3 py-2 text-sm" />
      <input name="phone" required placeholder="Телефон" className="rounded border border-[var(--line)] bg-white px-3 py-2 text-sm" />
      <input name="email" type="email" placeholder="E-mail" className="rounded border border-[var(--line)] bg-white px-3 py-2 text-sm" />
      <textarea name="message" required rows={4} placeholder="Сообщение" className="rounded border border-[var(--line)] bg-white px-3 py-2 text-sm" />
      <label className="flex items-start gap-2 text-xs text-[var(--muted)]">
        <input type="checkbox" required className="mt-0.5" />
        Согласие на обработку ПДн
      </label>
      <button type="submit" className="btn btn-primary w-fit">
        Отправить
      </button>
    </form>
  );
}
