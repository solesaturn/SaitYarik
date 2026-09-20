import { z } from "zod";

export const safeImage = (value: string) => /^\/(?!\/)/.test(value) || /^https:\/\//.test(value) || /^data:image\/(webp|png|jpeg|avif);base64,/.test(value);
export const photoSchema = z.object({ url: z.string().max(4_000_000).refine(safeImage, "Нужна ссылка на изображение"), caption: z.string().max(300) });
export const productEditorSchema = z.object({
  name: z.string().trim().min(1).max(200), sku: z.string().trim().min(1).max(80),
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "Адрес: латинские буквы, цифры и дефис").max(160),
  description: z.string().max(10000), color: z.enum(["белый", "серый", "чёрный"]),
  series: z.string().max(100), kitRole: z.enum(["assembled", "mechanism", "frame"]),
  productType: z.string().min(1).max(100), warranty: z.string().max(200),
  posts: z.number().int().min(1).max(4), priceRetail: z.number().finite().min(0),
  stock: z.number().int().min(0), active: z.boolean(), constructorEnabled: z.boolean(),
  attrs: z.record(z.string(), z.string().max(1000)), photos: z.array(photoSchema).max(15),
  categoryIds: z.array(z.string()).max(20), seoTitle: z.string().max(200), seoDescription: z.string().max(500),
}).superRefine((p, ctx) => {
  if (p.kitRole === "frame" ? p.posts < 2 : p.posts !== 1) ctx.addIssue({code: "custom", path: ["posts"], message: "У рамки 2–4 поста, у изделия или модуля — один"});
  if (p.constructorEnabled && p.kitRole !== "mechanism") ctx.addIssue({code: "custom", path: ["constructorEnabled"], message: "В конструктор можно добавить только модуль"});
  if (Object.keys(p.attrs).some(k => k.startsWith("_"))) ctx.addIssue({code: "custom", path: ["attrs"], message: "Название характеристики не должно начинаться с _"});
});
export type ProductEditor = z.infer<typeof productEditorSchema>;
export type ProductPhoto = z.infer<typeof photoSchema>;

export function readAttrs(json?: string | null): Record<string, string> {
  try { const value = JSON.parse(json || "{}"); return value && typeof value === "object" && !Array.isArray(value) ? value : {}; } catch { return {}; }
}
export function publicAttrs(json?: string | null) {
  return Object.fromEntries(Object.entries(readAttrs(json)).filter(([key]) => !key.startsWith("_")));
}
export function constructorEnabled(p: { kitRole?: string | null; attrsJson?: string | null; sku: string }) {
  if (p.kitRole !== "mechanism") return false;
  const flag = readAttrs(p.attrsJson)._constructorEnabled;
  // Preserve existing modules until the owner explicitly changes this setting.
  return flag === undefined ? /^M-(D1|S1|TV)-(WH|GY|BK)$/i.test(p.sku) : flag === "true";
}
export function photosOf(p: { imagesJson?: string | null; imageUrl?: string | null }): ProductPhoto[] {
  try {
    const parsed: unknown = JSON.parse(p.imagesJson || "[]");
    if (Array.isArray(parsed) && parsed.length) return parsed.flatMap((entry, i) => {
      const photo = typeof entry === "string" ? { url: entry, caption: i === 0 ? "Вид спереди" : "Детали изделия" } : entry;
      const result = photoSchema.safeParse(photo); return result.success ? [result.data] : [];
    });
  } catch { /* Fall back to the catalog cover. */ }
  return p.imageUrl ? [{url: p.imageUrl, caption: "Вид спереди"}] : [];
}
export function formatBadge(p: {kitRole?: string | null; posts?: number | null}) {
  if (p.kitRole === "assembled") return "Готовое изделие · рамка не нужна";
  if (p.kitRole === "mechanism") return "Модуль для рамки · рамка обязательна";
  if (p.kitRole === "frame") return `Рамка на ${p.posts || "2 / 3 / 4"} поста`;
  return "";
}
export function productBenefits(p: {kitRole?: string | null; attrsJson?: string | null}) {
  const attrs = publicAttrs(p.attrsJson);
  const benefits: string[] = [];
  if (p.kitRole !== "frame") {
    if (/самозажим|быстрое подключение/i.test(attrs["Подключение"] || attrs["Клеммы"] || "")) benefits.push("Самозажимные клеммы", "Лёгкий монтаж");
    if (/^(да|есть)$/i.test(attrs["Шторки"] || "")) benefits.push("Защитные шторки");
  }
  return benefits;
}
