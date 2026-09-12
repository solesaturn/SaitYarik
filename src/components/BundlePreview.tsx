"use client";

import { useEffect, useRef, useState } from "react";
import { bundleColorMeta, getBundlePhoto, mechLabel, type MechKind } from "@/lib/bundle";

function AssemblyScheme({
  color,
  mechanisms,
  description,
}: {
  color: string;
  mechanisms: MechKind[];
  description: string;
}) {
  const width = mechanisms.length * 112 + 32;
  const dark = color === "чёрный";
  const ink = dark ? "#ededed" : "#292929";
  const edge = dark ? "#686868" : "#737373";
  const fill = bundleColorMeta(color).hex;

  return (
    <svg className="block h-auto w-[calc(100%-2rem)] max-h-[190px]" viewBox={`0 0 ${width} 144`} role="img" aria-label={`Схема: ${description}`}>
      <rect x="1" y="1" width={width - 2} height="142" rx="8" fill={fill} stroke={edge} strokeWidth="2" />
      {mechanisms.map((mechanism, index) => (
        <g key={index} transform={`translate(${24 + index * 112}, 24)`} stroke={ink} strokeWidth="2" fill="none">
          <rect width="96" height="96" rx="4" stroke={edge} />
          {mechanism === "m-d1" ? (
            <>
              <circle cx="48" cy="48" r="34" />
              <circle cx="34" cy="48" r="5" fill={ink} stroke="none" />
              <circle cx="62" cy="48" r="5" fill={ink} stroke="none" />
              <path d="M43 15v9h10v-9M43 81v-9h10v9" />
            </>
          ) : mechanism === "m-s1" ? (
            <>
              <rect x="10" y="9" width="76" height="78" rx="2" />
              <path d="M39 74h18" />
            </>
          ) : (
            <>
              <circle cx="28" cy="51" r="12" />
              <circle cx="28" cy="51" r="3" />
              <path d="M54 39h26v24H54zM61 39v-5h12v5M60 57h14" />
              <text x="28" y="27" textAnchor="middle" fill={ink} stroke="none" fontSize="10">
                TV
              </text>
              <text x="67" y="27" textAnchor="middle" fill={ink} stroke="none" fontSize="10">
                LAN
              </text>
            </>
          )}
        </g>
      ))}
    </svg>
  );
}

export function BundlePreview({ color, mechanisms }: { color: string; mechanisms: MechKind[] }) {
  const photo = getBundlePhoto(color, mechanisms);
  const [loadedPhoto, setLoadedPhoto] = useState<string | null>(null);
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const image = imageRef.current;
    if (photo && image?.complete) {
      if (image.naturalWidth > 0) setLoadedPhoto(photo);
      else setFailedPhoto(photo);
    }
  }, [photo]);

  const canLoad = !!photo && failedPhoto !== photo;
  const ready = canLoad && loadedPhoto === photo;
  const description = `${mechanisms.length} поста, ${bundleColorMeta(color).label.toLowerCase()}; слева направо: ${mechanisms.map(mechLabel).join(", ")}`;

  return (
    <figure className="mt-6">
      <div className="relative grid aspect-[4/3] min-h-[150px] w-full place-items-center overflow-hidden rounded-2xl bg-[var(--paper)]" aria-busy={canLoad && !ready}>
        {!ready && <AssemblyScheme color={color} mechanisms={mechanisms} description={description} />}
        {canLoad && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={photo}
            ref={imageRef}
            src={photo!}
            alt={`Собранный блок: ${description}`}
            className={`absolute inset-0 h-full w-full object-contain p-3 ${ready ? "visible" : "invisible"}`}
            onLoad={() => setLoadedPhoto(photo)}
            onError={() => setFailedPhoto(photo)}
          />
        )}
      </div>
      <figcaption className="mt-3 text-xs text-[var(--muted)]" aria-live="polite" aria-atomic="true">
        {ready ? "Фотография выбранной сборки" : canLoad ? "Загружаем фотографию…" : "Схема выбранной сборки"}
      </figcaption>
    </figure>
  );
}
