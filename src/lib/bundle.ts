import { colorSuffix } from "@/lib/compatibility";

export const BUNDLE_COLORS = [
  { id: "белый", label: "Белый", swatch: "#eeedea", hex: "#eeedea" },
  { id: "серый", label: "Серый", swatch: "#858585", hex: "#858585" },
  { id: "чёрный", label: "Чёрный", swatch: "#292929", hex: "#292929" },
] as const;

export type BundleColor = (typeof BUNDLE_COLORS)[number]["id"];
export type MechKind = "m-d1" | "m-s1" | "m-tv";

export const MECH_OPTIONS: { id: MechKind; label: string; skuBase: string }[] = [
  { id: "m-d1", label: "Розетка Schuko", skuBase: "M-D1" },
  { id: "m-s1", label: "Выключатель", skuBase: "M-S1" },
  { id: "m-tv", label: "TV + компьютер", skuBase: "M-TV" },
];

export const BUNDLE_PRESETS: Record<string, { count: number; slots: MechKind[] }> = {
  desk: { count: 2, slots: ["m-d1", "m-d1"] },
  bed: { count: 2, slots: ["m-d1", "m-s1"] },
  tv: { count: 3, slots: ["m-d1", "m-d1", "m-tv"] },
};

const KIT_FRONT: Record<string, { folder: string; file: string }> = {
  "m-d1_m-d1": { folder: "L-2D", file: "01.png" },
  "m-d1_m-s1": { folder: "L-DS", file: "01.png" },
  "m-d1_m-d1_m-tv": { folder: "L-2DTV", file: "02.png" },
  "m-d1_m-d1_m-d1": { folder: "L-3D", file: "02.png" },
  "m-d1_m-d1_m-d1_m-d1": { folder: "L-4D", file: "02.png" },
};

export function bundleColorMeta(color: string) {
  return BUNDLE_COLORS.find((c) => c.id === color) || BUNDLE_COLORS[0];
}

export function mechSku(kind: MechKind, color: string) {
  const opt = MECH_OPTIONS.find((m) => m.id === kind);
  const suffix = colorSuffix(color);
  return opt && suffix ? `${opt.skuBase}-${suffix}` : null;
}

export function frameSkuForBundle(posts: number, color: string) {
  const suffix = colorSuffix(color);
  return suffix ? `P${posts}-${suffix}` : null;
}

export function mechLabel(kind: MechKind) {
  return MECH_OPTIONS.find((m) => m.id === kind)?.label || kind;
}

export function getBundlePhoto(color: string, mechanisms: MechKind[]) {
  const spec = KIT_FRONT[mechanisms.join("_")];
  const suffix = colorSuffix(color);
  if (!spec || !suffix) return null;
  return `/images/kits/${spec.folder}-${suffix}/${spec.file}`;
}

export function bundleComponentSkus(color: string, mechanisms: MechKind[]) {
  const frame = frameSkuForBundle(mechanisms.length, color);
  const mechs = mechanisms.map((kind) => mechSku(kind, color));
  if (!frame || mechs.some((sku) => !sku)) return [];
  return [frame, ...mechs] as string[];
}
