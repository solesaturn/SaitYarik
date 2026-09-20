"use client";

import { useState } from "react";
import { bundleColorMeta, getBundlePhoto } from "@/lib/bundle";
import { ProductImage } from "@/components/ProductImage";

// Front elevations based on the supplied Laitys product photographs.
// Each mechanism has a full-height faceplate; neighbouring plates meet at a seam.
function AssemblyScheme({
  color,
  mechanisms,
  description,
}: {
  color: string;
  mechanisms: string[];
  description: string;
}) {
  const width = mechanisms.length * 120 + 4;
  const finish =
    color === "белый"
      ? {
          face: "#f2f2ee",
          edge: "#aaa9a3",
          bevel: "#ffffff",
          recess: "#babbb6",
          well: "#dfe0da",
          rim: "#93958f",
          hole: "#30322f",
        }
      : color === "серый"
        ? {
            face: "#625f5b",
            edge: "#393836",
            bevel: "#817e78",
            recess: "#302f2d",
            well: "#494844",
            rim: "#918d85",
            hole: "#161615",
          }
        : {
            face: "#292a2b",
            edge: "#171819",
            bevel: "#484a4b",
            recess: "#101112",
            well: "#202223",
            rim: "#606366",
            hole: "#080909",
          };
  return (
    <svg
      className="assembly-scheme"
      viewBox={`0 0 ${width} 148`}
      role="img"
      aria-label={`Схема: ${description}`}
    >
      <rect
        x="1"
        y="1"
        width={width - 2}
        height="146"
        rx="1"
        fill={finish.edge}
      />
      {mechanisms.map((mechanism, index) => (
        <g key={index} transform={`translate(${2 + index * 120}, 2)`}>
          <rect
            x="0.6"
            y="0.6"
            width="118.8"
            height="142.8"
            rx="0.7"
            fill={finish.face}
          />
          <path
            d="M1 143V1h118"
            stroke={finish.bevel}
            strokeWidth="0.7"
            fill="none"
          />
          {mechanism === "m-d1" ? (
            <>
              <circle
                cx="60"
                cy="72"
                r="34"
                fill={finish.recess}
                stroke={finish.rim}
                strokeWidth="1"
              />
              <circle cx="60" cy="73" r="30" fill={finish.well} />
              <path
                d="M30 55h4v12h-7M30 89h4V77h-7M90 55h-4v12h7M90 89h-4V77h7"
                fill={finish.recess}
                stroke={finish.rim}
                strokeWidth="0.65"
              />
              <circle
                cx="44"
                cy="73"
                r="5.2"
                fill={finish.hole}
                stroke={finish.rim}
                strokeWidth="0.7"
              />
              <circle
                cx="76"
                cy="73"
                r="5.2"
                fill={finish.hole}
                stroke={finish.rim}
                strokeWidth="0.7"
              />
              <g fill="#bfc3c2" stroke="#686e70" strokeWidth="0.8">
                <path d="M56 39h8v4h-2v5h-4v-5h-2zM56 105h8v-4h-2v-5h-4v5h-2z" />
                <circle cx="60" cy="73" r="4.4" />
              </g>
              <path d="M57.5 73h5M60 70.5v5" stroke="#5e686b" strokeWidth="1" />
            </>
          ) : mechanism === "m-s1" ? (
            <path d="M2 142h116" stroke={finish.edge} strokeWidth="0.8" />
          ) : (
            <>
              {/* On the supplied front views LAN is on the left, TV on the right. */}
              <rect
                x="30"
                y="56"
                width="25"
                height="30"
                rx="0.6"
                fill="#202223"
                stroke={finish.rim}
                strokeWidth="1"
              />
              <path
                d="M34 65h17v13h-4v4h-9v-4h-4z"
                fill="#090a0b"
                stroke="#666a6c"
                strokeWidth="0.8"
              />
              <path d="M35 64h15v3H35z" fill="#b8b9b2" />
              <path
                d="M36 65v4m2-4v4m2-4v4m2-4v4m2-4v4m2-4v4m2-4v4m2-4v4"
                stroke="#72766e"
                strokeWidth="0.7"
              />
              <circle
                cx="78"
                cy="71"
                r="12"
                fill="#a6a6a0"
                stroke={finish.rim}
                strokeWidth="1"
              />
              <circle
                cx="78"
                cy="71"
                r="8.5"
                fill={finish.recess}
                stroke="#d0d0c8"
                strokeWidth="1.7"
              />
              <circle
                cx="78"
                cy="71"
                r="5.7"
                fill="#959690"
                stroke="#5d615f"
                strokeWidth="0.7"
              />
              <circle
                cx="78"
                cy="71"
                r="2"
                fill="#e0e1d8"
                stroke="#6c706b"
                strokeWidth="0.8"
              />
            </>
          )}
        </g>
      ))}
    </svg>
  );
}

export function BundlePreview({ color, mechanisms, labels, images }: { color: string; mechanisms: string[]; labels: string[]; images: (string | null)[] }) {
  const photo = getBundlePhoto(color, mechanisms);
  const [view, setView] = useState<"scheme" | "photo">("scheme");
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const showPhoto = view === "photo" && !!photo && !failed;
  const ready = showPhoto && loaded;
  const description = mechanisms.length + " поста, " + bundleColorMeta(color).label.toLowerCase() + "; слева направо: " + labels.join(", ");
  const known = mechanisms.every(m=>['m-d1','m-s1','m-tv'].includes(m));
  return (
    <figure className="bundle-preview">
      {photo && <div className="bundle-preview-views" role="group" aria-label="Вид комплекта">
        <button type="button" aria-pressed={view === "scheme"} onClick={() => setView("scheme")}>Схема</button>
        <button type="button" aria-pressed={view === "photo"} onClick={() => setView("photo")}>Фото</button>
      </div>}
      <div className="bundle-preview-stage" aria-busy={showPhoto && !loaded}>
        {!ready && (known ? <AssemblyScheme color={color} mechanisms={mechanisms} description={description} /> : <div role="img" aria-label={`Схема: ${description}`} className="flex w-full gap-1 p-4">{mechanisms.map((m,i)=><div key={i} className="flex min-w-0 flex-1 flex-col justify-center border border-black/20 p-1" style={{background:bundleColorMeta(color).hex}}>{images[i] ? <ProductImage src={images[i]!} alt={labels[i]} className="aspect-square w-full"/> : <span className="bg-white p-1 text-center text-xs text-black">{labels[i]}</span>}</div>)}</div>)}
        {showPhoto && <ProductImage src={photo} alt={("Собранный блок: " + description)}
          className={("bundle-preview-photo " + (loaded ? "is-loaded" : ""))}
          onLoad={() => setLoaded(true)} onError={() => { setFailed(true); setLoaded(false); }} />}
      </div>
      <figcaption aria-live="polite" aria-atomic="true">
        {ready ? "Фотография выбранной сборки" : "Схема выбранной сборки"}
        <small>{view === "photo" && failed ? "Фото временно недоступно. Показана схема."
          : showPhoto && !loaded ? "Загружаем фотографию…"
          : ready ? "Расположение механизмов — слева направо."
          : "Схематичное изображение по дизайну Laitys."}</small>
      </figcaption>
    </figure>
  );
}
