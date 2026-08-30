"use client";

import Link from "next/link";
import { Check, ShoppingCart, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export function CartToast() {
  const { toast, dismissToast } = useCart();
  if (!toast) return null;

  return (
    <div
      key={toast.id}
      role="status"
      aria-live="polite"
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-4 right-4 z-[60] w-auto max-w-[22rem] animate-[toast-in_0.35s_ease] border border-[var(--line)] bg-white shadow-[0_12px_40px_rgba(20,32,51,0.18)] sm:left-auto sm:right-4 sm:w-[min(100%-2rem,22rem)]"
    >
      <div className="flex items-start gap-3 p-4">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--ok)] text-white">
          <Check className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--ink)]">Добавлено в корзину</p>
          <p className="mt-0.5 line-clamp-2 text-sm text-[var(--muted)]">
            {toast.name}
            {toast.quantity > 1 ? ` · ${toast.quantity} шт.` : ""}
          </p>
          <Link
            href="/cart"
            onClick={dismissToast}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--ink)] underline decoration-[var(--copper)] underline-offset-4"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Перейти в корзину
          </Link>
        </div>
        <button
          type="button"
          onClick={dismissToast}
          className="rounded p-1 text-[var(--muted)] hover:bg-[var(--sand)] hover:text-[var(--ink)]"
          aria-label="Закрыть"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="h-1 origin-left animate-[toast-bar_3.2s_linear] bg-[var(--copper)]" />
    </div>
  );
}
