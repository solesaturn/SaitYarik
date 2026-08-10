"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

type MechanismKind = "розетка" | "выключатель" | "механизм";
type Color = "белый" | "серый" | "чёрный";

const mechanisms: { id: MechanismKind; label: string; hint: string }[] = [
  { id: "розетка", label: "Розетка", hint: "Силовая точка" },
  { id: "выключатель", label: "Выключатель", hint: "Освещение" },
  { id: "механизм", label: "Другой механизм", hint: "TV / спец. модуль" },
];

const postOptions = [
  { id: 1, label: "1 пост" },
  { id: 2, label: "2 поста" },
  { id: 3, label: "3 поста" },
  { id: 4, label: "4 поста" },
];

const colors: { id: Color; label: string; swatch: string }[] = [
  { id: "белый", label: "Белый", swatch: "#f5f5f5" },
  { id: "серый", label: "Серый", swatch: "#9aa0a6" },
  { id: "чёрный", label: "Чёрный", swatch: "#1a1a1a" },
];

export function ConstructorWizard() {
  const [step, setStep] = useState(1);
  const [kind, setKind] = useState<MechanismKind | null>(null);
  const [posts, setPosts] = useState<number | null>(null);
  const [color, setColor] = useState<Color | null>(null);

  const mechanismUrl = useMemo(() => {
    if (!kind) return "/catalog";
    const q = new URLSearchParams({ type: kind });
    if (color) q.set("color", color);
    return `/catalog?${q.toString()}`;
  }, [kind, color]);

  const frameUrl = useMemo(() => {
    const q = new URLSearchParams({ type: "рамка" });
    if (posts) q.set("posts", String(posts));
    if (color) q.set("color", color);
    return `/catalog?${q.toString()}`;
  }, [posts, color]);

  const canNext1 = !!kind;
  const canNext2 = !!posts;
  const done = !!kind && !!posts && !!color;

  return (
    <div className="mt-10 space-y-6">
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => {
              if (n === 1) setStep(1);
              if (n === 2 && kind) setStep(2);
              if (n === 3 && kind && posts) setStep(3);
            }}
            className={`pill ${step === n ? "pill-active" : ""}`}
          >
            {n === 1 ? "1. Механизм" : n === 2 ? "2. Рамка" : "3. Цвет"}
            {((n === 1 && kind) || (n === 2 && posts) || (n === 3 && color)) && (
              <Check className="ml-1 h-3.5 w-3.5" strokeWidth={2.5} />
            )}
          </button>
        ))}
      </div>

      {step === 1 && (
        <section className="rounded-2xl bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight">Что ставите в точку?</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Выберите тип механизма — это «начинка» без рамки.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {mechanisms.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setKind(m.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  kind === m.id
                    ? "border-[var(--ink)] bg-[var(--sand)]"
                    : "border-transparent bg-[var(--paper)] hover:bg-[var(--sand)]"
                }`}
              >
                <p className="font-semibold">{m.label}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{m.hint}</p>
              </button>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!canNext1}
              className="btn btn-primary disabled:opacity-40"
              onClick={() => setStep(2)}
            >
              Далее <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="rounded-2xl bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight">Сколько постов в рамке?</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Рамка покупается отдельно. Для одной розетки обычно 1 пост; для блока — 2–4.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {postOptions.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPosts(p.id)}
                className={`pill ${posts === p.id ? "pill-active" : ""}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
              Назад
            </button>
            <button
              type="button"
              disabled={!canNext2}
              className="btn btn-primary disabled:opacity-40"
              onClick={() => setStep(3)}
            >
              Далее <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="rounded-2xl bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight">Цвет комплекта</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Механизм и рамка должны быть одного цвета.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {colors.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setColor(c.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                  color === c.id ? "bg-[var(--ink)] text-white" : "bg-[var(--sand)]"
                }`}
              >
                <span
                  className="h-4 w-4 rounded-full border border-black/15"
                  style={{ backgroundColor: c.swatch }}
                  aria-hidden
                />
                {c.label}
              </button>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>
              Назад
            </button>
          </div>
        </section>
      )}

      {done && (
        <section className="rounded-2xl bg-[var(--ink)] p-6 text-white sm:p-8">
          <h2 className="text-xl font-bold tracking-tight">Ваш комплект</h2>
          <ul className="mt-3 space-y-1 text-sm text-white/75">
            <li>
              Механизм: <strong className="text-white">{kind}</strong>
            </li>
            <li>
              Рамка: <strong className="text-white">{posts} пост.</strong>
            </li>
            <li>
              Цвет: <strong className="text-white">{color}</strong>
            </li>
          </ul>
          <p className="mt-4 text-sm text-white/65">
            Откройте каталог с фильтрами и добавьте механизм и рамку в корзину.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={mechanismUrl} className="btn bg-white text-[var(--ink)] hover:bg-white/90">
              Смотреть механизмы
            </Link>
            <Link href={frameUrl} className="btn border border-white/30 bg-white/10 text-white hover:bg-white/15">
              Смотреть рамки
            </Link>
          </div>
        </section>
      )}

      {!done && (
        <p className="text-sm text-[var(--muted)]">
          Пройдите все три шага — появятся ссылки на подходящие товары в каталоге.
        </p>
      )}
    </div>
  );
}
