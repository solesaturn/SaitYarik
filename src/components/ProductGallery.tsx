"use client";

import { ProductImage } from "@/components/ProductImage";

import { useState } from "react";

export function ProductGallery({
  images,
  alt,
  captions = [],
}: {
  images: string[];
  alt: string;
  captions?: string[];
}) {
  const photos = images.filter(Boolean);
  const [active, setActive] = useState(0);
  const current = photos[Math.min(active, Math.max(photos.length - 1, 0))] || "";

  if (!current) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--card)] sm:aspect-square">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-24 w-24 rounded-full bg-white/80 sm:h-40 sm:w-40" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[var(--card)]">
        <ProductImage src={current} alt={`${alt}, ${captions[active] || `фото ${active+1}`}`} className="h-full w-full object-contain p-6 sm:p-8" />
      </div>
      {captions[active] && <p className="mt-2 text-sm text-[var(--muted)]">{captions[active]}</p>}
      {photos.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--card)] ${
                i === active ? "ring-2 ring-[var(--ink)]" : "opacity-70 hover:opacity-100"
              }`}
              aria-label={`Фото ${i + 1}`}
            >
              <ProductImage src={src} alt="" className="h-full w-full object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
