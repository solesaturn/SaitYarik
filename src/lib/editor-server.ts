import "server-only";
import { prisma } from "@/lib/prisma";
import { HOME_DEFAULTS, homeContentSchema } from "@/lib/home-content";
import { constructorEnabled, photosOf, publicAttrs, productEditorSchema, type ProductEditor } from "@/lib/product-content";
import type { Product } from "@prisma/client";

export async function readDraft(id: string) {
  const row = await prisma.siteSetting.findUnique({where: {key: `draft:product:${id}`}});
  if (!row) return null;
  try { return productEditorSchema.parse(JSON.parse(row.value)); } catch { return null; }
}
export function editorFromProduct(p: Product & {categories: {categoryId: string}[]}): ProductEditor {
  return {
    name: p.name, sku: p.sku, slug: p.slug, description: p.description || "", color: p.color as ProductEditor["color"],
    series: p.series || "Zero", kitRole: p.kitRole as ProductEditor["kitRole"], productType: p.productType || "розетка",
    warranty: p.warranty || "", posts: p.posts || 1, priceRetail: p.priceRetail, stock: p.stock, active: p.active,
    constructorEnabled: constructorEnabled(p), attrs: publicAttrs(p.attrsJson), photos: photosOf(p),
    categoryIds: p.categories.map(c => c.categoryId), seoTitle: p.seoTitle || "", seoDescription: p.seoDescription || "",
  };
}
export function productFields(p: ProductEditor) {
  const {attrs, photos, constructorEnabled: enabled, categoryIds: _categories, ...data} = p;
  void _categories;
  const currentAttrs = {...attrs, Цвет:p.color, Постов:String(p.posts), Гарантия:p.warranty,
    Комплектация:p.kitRole === 'assembled' ? 'Готовое изделие' : p.kitRole === 'mechanism' ? 'Модуль для рамки' : 'Рамка',
    _constructorEnabled: String(enabled)};
  return {...data, attrsJson: JSON.stringify(currentAttrs), imagesJson: JSON.stringify(photos), imageUrl: photos[0]?.url || null};
}
export async function homeContent(preview = false) {
  const row = await prisma.siteSetting.findUnique({where: {key: preview ? "draft:home" : "home_content"}});
  if (row) { try { return homeContentSchema.parse({...HOME_DEFAULTS, ...JSON.parse(row.value)}); } catch { /* Use safe defaults. */ } }
  if (preview) return homeContent(false);
  return HOME_DEFAULTS;
}
