import { prisma } from "@/lib/prisma";

/**
 * Minimal CommerceML parser for import.xml / offers.xml.
 * Identifies products by GUID (Ид), never by name alone.
 * On parse errors the caller logs and does NOT wipe stock/prices.
 */
export async function parseCommerceML(xml: string, filename: string) {
  if (!xml || xml.length < 20) throw new Error("Empty CommerceML payload");

  const isOffers = filename.toLowerCase().includes("offers") || xml.includes("<Предложение>");

  if (isOffers) {
    const offers = [...xml.matchAll(/<Предложение>([\s\S]*?)<\/Предложение>/g)];
    let updated = 0;
    for (const m of offers) {
      const block = m[1];
      const guid = pick(block, "Ид");
      const price = Number(pick(block, "ЦенаЗаЕдиницу") || pick(block, "Цена") || NaN);
      const stock = Number(pick(block, "Количество") || NaN);
      if (!guid) continue;
      const data: { priceRetail?: number; stock?: number } = {};
      if (!Number.isNaN(price)) data.priceRetail = price;
      if (!Number.isNaN(stock)) data.stock = Math.max(0, Math.floor(stock));
      if (Object.keys(data).length === 0) continue;
      const existing = await prisma.product.findFirst({
        where: { OR: [{ guid1c: guid }, { sku: guid }] },
      });
      if (existing) {
        await prisma.product.update({ where: { id: existing.id }, data });
        updated++;
      }
    }
    return { message: `offers.xml: обновлено позиций ${updated}` };
  }

  const goods = [...xml.matchAll(/<Товар>([\s\S]*?)<\/Товар>/g)];
  let created = 0;
  let updated = 0;
  for (const m of goods) {
    const block = m[1];
    const guid = pick(block, "Ид");
    const name = pick(block, "Наименование") || "Товар без названия";
    const sku = pick(block, "Артикул") || guid || `SKU-${Date.now()}`;
    if (!guid) continue;
    const slug = slugify(`${name}-${sku}`);
    const existing = await prisma.product.findFirst({ where: { guid1c: guid } });
    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: { name, sku },
      });
      updated++;
    } else {
      await prisma.product.create({
        data: {
          guid1c: guid,
          name,
          sku,
          slug: `${slug}-${created}`,
          priceRetail: 0,
          priceWholesale: 0,
          stock: 0,
          description: "Импортировано из 1С (CommerceML)",
        },
      });
      created++;
    }
  }
  return { message: `import.xml: создано ${created}, обновлено ${updated}` };
}

function pick(block: string, tag: string) {
  const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return m?.[1]?.trim();
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}
