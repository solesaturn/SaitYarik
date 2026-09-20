import { PrismaClient } from '@prisma/client';
import manifest from '../data/product-photos.json';
const db = new PrismaClient();
async function main() {
  await db.category.updateMany({where:{slug:'mehanizmy',name:'Механизмы'},data:{name:'Модули для рамок',description:'Модули для рамок на 2, 3 и 4 поста. Без рамки не используются.'}});
  for (const [sku, entry] of Object.entries(manifest)) {
    const product = await db.product.findUnique({where:{sku}});
    if (product?.name === entry.originalName) await db.product.update({where:{sku},data:{name:entry.name,
      ...(product.seoTitle === `${entry.originalName} — ${sku}` ? {seoTitle:`${entry.name} — ${sku}`} : {})}});
    if (product?.description === entry.originalDescription) await db.product.update({where:{sku},data:{description:entry.description}});
    // Only replace the supplied originals; preserve any owner-uploaded gallery.
    if (!product || !product.imageUrl || !entry.originals.includes(product.imageUrl)) continue;
    let images: unknown;
    try {images=JSON.parse(product.imagesJson);} catch {continue;}
    if (!Array.isArray(images) || images.some(url=>typeof url!=='string'||!entry.originals.includes(url))) continue;
    await db.product.update({where:{sku},data:{imageUrl:entry.photos[0].url,imagesJson:JSON.stringify(entry.photos)}});
  }
}
main().finally(()=>db.$disconnect());
