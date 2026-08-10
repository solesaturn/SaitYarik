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
      className={`rounded-full p-2 transition ${
        active ? "text-[#b42318]" : "text-[var(--ink)] hover:bg-black/5"
      } ${className}`}
      aria-label={active ? "Убрать из избранного" : "В избранное"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(product);
      }}
    >
      <Heart className="h-4 w-4" strokeWidth={1.5} fill={active ? "currentColor" : "none"} />
    </button>
  );
}
