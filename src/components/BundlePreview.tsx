"use client";

import { useState } from "react";
import { bundleColorMeta, getBundlePhoto, mechLabel, mechSku, type MechKind } from "@/lib/bundle";
import { ProductImage } from "@/components/ProductImage";

export function BundlePreview({ color, mechanisms, products = [] }: {
  color: string; mechanisms: MechKind[]; products?: { sku: string; imageUrl: string | null }[];
}) {
  const photo = getBundlePhoto(color, mechanisms);
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const showPhoto = !!photo && failedPhoto !== photo;
  const description = `${mechanisms.length} поста, ${bundleColorMeta(color).label.toLowerCase()}; слева направо: ${mechanisms.map(mechLabel).join(", ")}`;
  return (
    <figure className="mt-6">
      <div className="grid min-h-48 w-full items-center overflow-hidden rounded-2xl bg-white p-5 sm:min-h-60 sm:p-7">
        {showPhoto ? <ProductImage src={photo!} alt={`Собранный блок: ${description}`}
          className="h-44 w-full sm:h-52" onError={() => setFailedPhoto(photo)} /> : (
          <div role="img" aria-label={`Предпросмотр: ${description}`} className="grid gap-1 rounded-lg border border-black/10 p-2 shadow-sm"
            style={{ gridTemplateColumns: `repeat(${mechanisms.length}, minmax(0, 1fr))`, backgroundColor: bundleColorMeta(color).hex }}>
            {mechanisms.map((mechanism, index) => {
              const product = products.find((p) => p.sku.toUpperCase() === mechSku(mechanism, color));
              return <div key={index} className="flex aspect-square items-center justify-center overflow-hidden">
                {product?.imageUrl ? <ProductImage src={product.imageUrl} alt="" className="h-full w-full p-1" /> : <span className="rounded bg-white p-1 text-center text-xs text-black">{mechLabel(mechanism)}</span>}
              </div>;
            })}
          </div>
        )}
      </div>
      <figcaption className="mt-3 text-xs leading-relaxed text-[var(--muted)]" aria-live="polite" aria-atomic="true">
        {showPhoto ? "Фотография выбранной сборки" : "Предпросмотр из фотографий механизмов. Внешний вид готового блока может отличаться."}
      </figcaption>
    </figure>
  );
}
