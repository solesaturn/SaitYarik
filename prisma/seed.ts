import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

type CatalogItem = {
  sku: string;
  slug: string;
  name: string;
  description: string;
  brand: string;
  series: string;
  color: string | null;
  posts: number | null;
  productType: string;
  grounded: boolean | null;
  ipRating: string | null;
  nominalCurrent: string | null;
  mountType: string | null;
  priceRetail: number;
  priceWholesale: number;
  stock: number;
  packQty: number;
  isHit: boolean;
  isNew: boolean;
  isSale: boolean;
  marked: boolean;
  imageUrl: string | null;
  attrs: Record<string, string>;
  category: string;
};

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.b2BRequest.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.faqItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.contactLead.deleteMany();
  await prisma.syncLog.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.siteSetting.deleteMany();

  const passwordHash = await bcrypt.hash("admin123", 10);
  const retailHash = await bcrypt.hash("demo123", 10);

  await prisma.user.create({
    data: {
      email: "admin@saityarik.ru",
      name: "Администратор",
      passwordHash,
      role: "ADMIN",
      phone: "+7 (495) 000-00-01",
    },
  });

  await prisma.user.create({
    data: {
      email: "demo@saityarik.ru",
      name: "Иван Розничный",
      passwordHash: retailHash,
      role: "RETAIL",
      customerType: "B2C",
      phone: "+7 (900) 111-22-33",
    },
  });

  await prisma.user.create({
    data: {
      email: "opt@saityarik.ru",
      name: "Пётр Оптовый",
      passwordHash: retailHash,
      role: "B2B",
      customerType: "B2B",
      b2bApproved: true,
      companyName: "ООО ЭлектроМонтаж",
      inn: "7701234567",
      kpp: "770101001",
      legalAddress: "г. Москва, ул. Строителей, д. 10",
      phone: "+7 (900) 444-55-66",
    },
  });

  const brand = await prisma.brand.create({
    data: {
      name: "Futina",
      slug: "futina",
      logoUrl: "/images/products/futina-logo.png",
    },
  });

  // optional logo from invoice
  const logoSrc = path.join(process.cwd(), "data", "xlsx_extract", "xl", "media", "image1.png");
  const logoDest = path.join(process.cwd(), "public", "images", "products", "futina-logo.png");
  if (fs.existsSync(logoSrc)) {
    fs.copyFileSync(logoSrc, logoDest);
  }

  const catRozetki = await prisma.category.create({
    data: {
      name: "Розетки",
      slug: "rozetki",
      description: "Силовые розетки Schuko Futina с шторками и USB",
      seoTitle: "Розетки Futina — купить в SaitYarik",
      seoDescription: "Розетки Schuko и USB Futina. Розница и опт.",
    },
  });
  const catVykl = await prisma.category.create({
    data: {
      name: "Выключатели",
      slug: "vyklyuchateli",
      description: "Одно- и двухклавишные, проходные выключатели 10А",
    },
  });
  const catRamki = await prisma.category.create({
    data: {
      name: "Рамки",
      slug: "ramki",
      description: "Рамки на 2–4 поста серии Futina",
    },
  });
  const catMech = await prisma.category.create({
    data: {
      name: "Механизмы",
      slug: "mehanizmy",
      description: "Модульные механизмы без рамки: розетки, выключатели, TV",
    },
  });

  const catMap: Record<string, string> = {
    rozetki: catRozetki.id,
    vyklyuchateli: catVykl.id,
    ramki: catRamki.id,
    mehanizmy: catMech.id,
  };

  const catalogPath = path.join(process.cwd(), "data", "catalog.json");
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8")) as CatalogItem[];

  for (const item of catalog) {
    const product = await prisma.product.create({
      data: {
        guid1c: `FUTINA-${item.sku}`,
        slug: item.slug,
        sku: item.sku,
        name: item.name,
        description: item.description,
        brandId: brand.id,
        series: item.series,
        color: item.color,
        posts: item.posts ?? undefined,
        productType: item.productType,
        grounded: item.grounded ?? undefined,
        ipRating: item.ipRating,
        nominalCurrent: item.nominalCurrent,
        mountType: item.mountType,
        priceRetail: item.priceRetail,
        priceWholesale: item.priceWholesale,
        stock: item.stock,
        packQty: item.packQty,
        isHit: item.isHit,
        isNew: item.isNew,
        isSale: item.isSale,
        marked: item.marked,
        imageUrl: item.imageUrl,
        imagesJson: JSON.stringify(item.imageUrl ? [item.imageUrl] : []),
        attrsJson: JSON.stringify(item.attrs),
        documentsJson: JSON.stringify([
          { name: "Инвойс Futina (FOB Shunde)", url: "#" },
          { name: "Паспорт изделия", url: "#" },
        ]),
        seoTitle: `${item.name} — ${item.sku}`,
        seoDescription: item.description.slice(0, 160),
        active: true,
      },
    });

    await prisma.productCategory.create({
      data: {
        productId: product.id,
        categoryId: catMap[item.category] || catRozetki.id,
      },
    });
  }

  await prisma.promoCode.create({
    data: { code: "ELECTRO10", percent: 10, active: true },
  });

  await prisma.faqItem.createMany({
    data: [
      {
        question: "Это товары из реального инвойса Futina?",
        answer:
          "Да. Каталог загружен из коммерческого предложения Guangdong Futina Electrical Co., Ltd (FOB Shunde). Цены на сайте — розница/опт с наценкой от закупочной USD.",
        sortOrder: 1,
      },
      {
        question: "Как получить оптовые цены?",
        answer:
          "Зарегистрируйтесь как юрлицо в разделе «Оптовикам». После модерации откроются оптовые цены близкие к закупочным.",
        sortOrder: 2,
      },
      {
        question: "Какие цвета есть в наличии?",
        answer: "Белый (WH), серый (GY) и чёрный (BK) — по артикулам серии Futina.",
        sortOrder: 3,
      },
      {
        question: "Рамки и механизмы совместимы?",
        answer:
          "Да, модульные механизмы M-* и рамки P2/P3/P4 одной серии Futina Modular стыкуются между собой.",
        sortOrder: 4,
      },
    ],
  });

  await prisma.review.createMany({
    data: [
      {
        author: "Алексей М.",
        text: "Взяли белые розетки и рамки Futina под объект — качество нормальное, артикулы совпали с инвойсом.",
        rating: 5,
      },
      {
        author: "ООО «СветСтрой»",
        text: "Удобно, что сразу видны оптовые цены и остатки по поставке.",
        rating: 5,
      },
      {
        author: "Марина К.",
        text: "Чёрная серия смотрится аккуратно, USB-розетка пригодилась в кабинете.",
        rating: 4,
      },
    ],
  });

  await prisma.blogPost.createMany({
    data: [
      {
        slug: "futina-seriya-cvetov",
        title: "Серия Futina: белый, серый и чёрный",
        excerpt: "Как подобрать розетки, выключатели и рамки одной цветовой линейки.",
        content:
          "Артикулы Futina кодируются суффиксом цвета: WH — белый, GY — серый, BK — чёрный. Механизмы M-* и рамки P2–P4 собираются в единый блок.",
      },
      {
        slug: "schuko-i-usb",
        title: "Schuko с шторками и USB A/C",
        excerpt: "Чем отличаются D1 и USB-розетки Futina.",
        content:
          "D1 — силовая Schuko с защитными шторками и быстрозажимными клеммами. USB — комбинация силовой розетки и портов Type-A + Type-C в корпусе 85×85.",
      },
    ],
  });

  await prisma.siteSetting.createMany({
    data: [
      { key: "phone", value: "+7 (495) 120-45-67" },
      { key: "email", value: "info@saityarik.ru" },
      { key: "city", value: "Москва" },
      { key: "address", value: "г. Москва, складской комплекс «Электро», ворота 4" },
      { key: "inn", value: "7700000000" },
      { key: "ogrn", value: "1027700000000" },
      { key: "free_delivery_from", value: "5000" },
      { key: "delivery_provider", value: "cdek" },
      { key: "supplier", value: "Guangdong Futina Electrical Co.,Ltd" },
    ],
  });

  console.log(`Seed OK: ${catalog.length} Futina SKU from invoice`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
