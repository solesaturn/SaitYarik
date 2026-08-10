import Link from "next/link";
import { ConstructorWizard } from "@/components/ConstructorWizard";

export const metadata = {
  title: "Конструктор комплекта",
  description: "Соберите рамку и механизм Futina под свой интерьер",
};

export default function ConstructorPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <nav className="text-xs text-[var(--muted)]">
        <Link href="/">Главная</Link>
        {" > "}
        <span>Конструктор</span>
      </nav>
      <h1 className="section-title mt-3">Соберите свой комплект</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
        В серии Futina рамка и механизм покупаются отдельно. Выберите тип, число постов и цвет — откроем каталог уже с
        нужными фильтрами.
      </p>

      <ConstructorWizard />

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/lifestyle/kitchen.svg" alt="" className="aspect-[4/3] w-full rounded-2xl object-cover" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/lifestyle/interior.svg" alt="" className="aspect-[4/3] w-full rounded-2xl object-cover" />
      </div>

      <p className="mt-8 text-sm text-[var(--muted)]">
        Нужна помощь?{" "}
        <Link href="/contacts" className="font-semibold text-[var(--ink)] underline">
          Оставьте заявку
        </Link>{" "}
        — перезвоним и соберём спецификацию.
      </p>
    </div>
  );
}
