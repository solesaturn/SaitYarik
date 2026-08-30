"use client";

import Link from "next/link";
import { Heart, X } from "lucide-react";
import { useFavorites } from "@/lib/favorites-context";

export function FavoriteToast() {
  const { toast, dismissToast } = useFavorites();
  if (!toast) return null;

  return (
    <div
      key={toast.id}
      role="status"
      aria-live="polite"
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-4 right-4 z-[60] w-auto max-w-[22rem] animate-[toast-in_0.35s_ease] border border-[var(--line)] bg-white shadow-[0_12px_40px_rgba(20,32,51,0.18)] sm:left-auto sm:right-4 sm:w-[min(100%-2rem,22rem)]"
    >
      <div className="flex items-start gap-3 p-4">
        <span
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            toast.added ? "bg-[#b42318] text-white" : "bg-[var(--sand)] text-[var(--ink)]"
          }`}
        >
          <Heart className="h-5 w-5" fill={toast.added ? "currentColor" : "none"} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--ink)]">
            {toast.added ? "В избранном" : "Убрано из избранного"}
          </p>
          <p className="mt-0.5 line-clamp-2 text-sm text-[var(--muted)]">{toast.name}</p>
          {toast.added && (
            <Link
              href="/favorites"
              onClick={dismissToast}
              className="mt-3 inline-flex text-sm font-semibold underline decoration-[var(--copper)] underline-offset-4"
            >
              Открыть избранное
            </Link>
          )}
        </div>
        <button
          type="button"
          onClick={dismissToast}
          className="rounded p-1 text-[var(--muted)] hover:bg-[var(--sand)]"
          aria-label="Закрыть"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
