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

  const done = !!kind && !!posts && !!color;

  function pickKind(id: MechanismKind) {
    setKind(id);
    setStep(2);
  }

  function pickPosts(id: number) {
    setPosts(id);
    setStep(3);
  }

  function pickColor(id: Color) {
    setColor(id);
  }

  return (
    <div className="mt-10 space-y-6">
      <div className="flex flex-wrap gap-2">
        {[
          { n: 1, label: "1. Механизм", ok: !!kind },
          { n: 2, label: "2. Рамка", ok: !!posts },
          { n: 3, label: "3. Цвет", ok: !!color },
        ].map((s) => (
          <button
            key={s.n}
            type="button"
            onClick={() => {
              if (s.n === 1) setStep(1);
              else if (s.n === 2 && kind) setStep(2);
              else if (s.n === 3 && kind && posts) setStep(3);
            }}
            className={`pill inline-flex items-center gap-1 ${step === s.n ? "pill-active" : ""}`}
          >
            {s.label}
            {s.ok ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : null}
          </button>
        ))}
      </div>

      {step === 1 && (
        <section className="rounded-2xl bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight">Что ставите в точку?</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Нажмите вариант — сразу перейдёте к рамке.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {mechanisms.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => pickKind(m.id)}
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
        </section>
      )}

      {step === 2 && (
        <section className="rounded-2xl bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight">Сколько постов в рамке?</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Рамка покупается отдельно от механизма.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {postOptions.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => pickPosts(p.id)}
                className={`pill ${posts === p.id ? "pill-active" : ""}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-ghost mt-6" onClick={() => setStep(1)}>
            Назад
          </button>
        </section>
      )}

      {step === 3 && (
        <section className="rounded-2xl bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight">Цвет комплекта</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Механизм и рамка одного цвета.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {colors.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => pickColor(c.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                  color === c.id ? "bg-[var(--ink)] text-white" : "bg-[var(--sand)] hover:opacity-80"
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
          <button type="button" className="btn btn-ghost mt-6" onClick={() => setStep(2)}>
            Назад
          </button>
        </section>
      )}

      {done && (
        <section className="rounded-2xl bg-[var(--ink)] p-6 text-white sm:p-8">
          <h2 className="text-xl font-bold tracking-tight">Готово — ваш комплект</h2>
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
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={mechanismUrl} className="btn inline-flex bg-white text-[var(--ink)] hover:bg-white/90">
              Смотреть механизмы <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <Link
              href={frameUrl}
              className="btn inline-flex border border-white/30 bg-white/10 text-white hover:bg-white/15"
            >
              Смотреть рамки <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
