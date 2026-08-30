"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function CookieBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem("sy_cookies")) setShow(true);
  }, []);
  if (!show) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--line)] bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--muted)]">
          Мы используем cookie, чтобы сайт работал стабильно. Подробности — в{" "}
          <Link href="/legal/privacy" className="underline">
            политикой конфиденциальности
          </Link>
          .
        </p>
        <button
          type="button"
          className="btn btn-primary w-full shrink-0 sm:w-auto"
          onClick={() => {
            localStorage.setItem("sy_cookies", "1");
            setShow(false);
          }}
        >
          Принять
        </button>
      </div>
    </div>
  );
}
