"use client";

import { Heart } from "lucide-react";
import { useFavorites, type FavoriteItem } from "@/lib/favorites-context";

export function FavoriteButton({
  product,
  className = "",
}: {
  product: FavoriteItem;
  className?: string;
}) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(product.id);

  return (
    <button
      type="button"
      className={`rounded border p-2 transition ${
        active
          ? "border-[#b42318]/30 bg-[#b42318]/10 text-[#b42318]"
          : "border-[var(--line)] text-[var(--ink)] hover:bg-[var(--sand)]"
      } ${className}`}
      aria-label={active ? "Убрать из избранного" : "В избранное"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(product);
      }}
    >
      <Heart className="h-4 w-4" fill={active ? "currentColor" : "none"} />
    </button>
  );
}
