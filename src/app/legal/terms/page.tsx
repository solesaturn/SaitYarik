export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="section-title">Пользовательское соглашение</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-[var(--muted)]">
        <p>Используя сайт SaitYarik, вы соглашаетесь с правилами размещения заказов, регистрации и использования личного кабинета.</p>
        <p>Запрещены попытки несанкционированного доступа, спам через формы и вмешательство в работу API обмена с 1С.</p>
        <p>Администрация вправе ограничить доступ при нарушении условий или подозрении в мошенничестве.</p>
      </div>
    </div>
  );
}
