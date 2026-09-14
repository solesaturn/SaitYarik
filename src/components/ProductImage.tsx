"use client";

import { useState } from "react";

type Bounds = { x: number; y: number; width: number; height: number; imageWidth: number; imageHeight: number };
const measured = new Map<string, Bounds>();

// Measure transparent margins only. The original photograph is never changed.
function measure(image: HTMLImageElement): Bounds {
  const scale = Math.min(1, 512 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(image.naturalWidth * scale);
  canvas.height = Math.ceil(image.naturalHeight * scale);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let left = canvas.width, top = canvas.height, right = -1, bottom = -1;
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      if (pixels[(y * canvas.width + x) * 4 + 3] > 16) {
        left = Math.min(left, x); right = Math.max(right, x);
        top = Math.min(top, y); bottom = Math.max(bottom, y);
      }
    }
  }
  if (right < left) throw new Error("Empty image");
  // Two pixels of breathing room retain antialiased edges.
  left = Math.max(0, left - 2); top = Math.max(0, top - 2);
  right = Math.min(canvas.width - 1, right + 2); bottom = Math.min(canvas.height - 1, bottom + 2);
  return { x: left / canvas.width * image.naturalWidth, y: top / canvas.height * image.naturalHeight,
    width: (right - left + 1) / canvas.width * image.naturalWidth,
    height: (bottom - top + 1) / canvas.height * image.naturalHeight,
    imageWidth: image.naturalWidth, imageHeight: image.naturalHeight };
}

export function ProductImage({ src, alt, className = "", onError, onLoad }: {
  src: string; alt: string; className?: string; onError?: () => void; onLoad?: () => void;
}) {
  const [result, setResult] = useState<{ src: string; bounds: Bounds } | null>(null);
  const bounds = result?.src === src ? result.bounds : measured.get(src);
  function finish(image: HTMLImageElement) {
    try {
      const bounds = measure(image);
      if (measured.size > 250) measured.clear();
      measured.set(src, bounds); setResult({ src, bounds });
    } catch { /* Canvas may be unavailable or blocked for an external image. */ }
    onLoad?.();
  }
  if (bounds) {
    return <svg role={alt ? "img" : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true}
      className={className} viewBox={`${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`}>
      <image href={src} width={bounds.imageWidth} height={bounds.imageHeight} onError={onError} onLoad={onLoad} />
    </svg>;
  }
  // Cross-origin and opaque photographs retain their normal contain layout.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={`object-contain ${className}`} onError={onError}
    ref={(image) => {
      // Server-rendered images can finish loading before React attaches onLoad.
      if (image?.complete && image.naturalWidth) queueMicrotask(() => finish(image));
    }}
    onLoad={(event) => finish(event.currentTarget)} />;
}
