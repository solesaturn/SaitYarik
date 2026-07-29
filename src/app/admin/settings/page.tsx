import { redirect } from "next/navigation";
import { getSession, isStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session || !isStaff(session.role)) redirect("/account");

  const settings = await prisma.siteSetting.findMany();
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="section-title">Настройки</h1>
      <div className="mt-8 space-y-4 text-sm">
        <Row k="Телефон" v={map.phone} />
        <Row k="E-mail" v={map.email} />
        <Row k="Город" v={map.city} />
        <Row k="Адрес склада" v={map.address} />
        <Row k="ИНН" v={map.inn} />
        <Row k="ОГРН" v={map.ogrn} />
        <Row k="Бесплатная доставка от" v={`${map.free_delivery_from} ₽`} />
        <Row k="Провайдер доставки" v={map.delivery_provider} />
      </div>
      <div className="mt-8 border border-[var(--line)] bg-white p-4 text-sm text-[var(--muted)]">
        <p className="font-semibold text-[var(--ink)]">SEO и служебное</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Автоматический sitemap.xml и robots.txt</li>
          <li>Шаблоны meta на страницах категорий/товаров + ручные SEO-поля в БД</li>
          <li>ЧПУ без ?id=</li>
          <li>Яндекс.Метрика: задайте NEXT_PUBLIC_YANDEX_METRIKA_ID</li>
          <li>2FA и rate-limit для админки — подключаются на проде</li>
        </ul>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v?: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[var(--line)] py-2">
      <span className="text-[var(--muted)]">{k}</span>
      <span className="font-medium">{v || "—"}</span>
    </div>
  );
}
