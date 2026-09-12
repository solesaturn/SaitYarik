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
  kitRole: string;
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
  images?: string[];
  warranty: string;
  certs: { name: string; url: string; number: string }[];
  attrs: Record<string, string>;
  category: string;
};

function publicFileExists(url: string) {
  const rel = url.replace(/^\//, "");
  return fs.existsSync(path.join(process.cwd(), "public", rel));
}

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
  await prisma.certificate.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.faqItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.contactLead.deleteMany();
  await prisma.syncLog.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.siteSetting.deleteMany();

  const adminEmail = (process.env.ADMIN_EMAIL || "kamalovaar@gmail.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMeLaitys";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Администратор Laitys",
      passwordHash,
      role: "ADMIN",
      phone: "+7 989 234-14-44",
    },
  });

  const brand = await prisma.brand.create({
    data: {
      name: "Laitys",
      slug: "laitys",
    },
  });

  const catRozetki = await prisma.category.create({
    data: {
      name: "Розетки",
      slug: "rozetki",
      description: "Розетки, выключатели и рамки для современного интерьера. Белый, серый и чёрный.",
      seoTitle: "Розетки Laitys",
      seoDescription: "Розетки Schuko и USB Laitys. Белый, серый и чёрный.",
      sortOrder: 1,
    },
  });
  const catVykl = await prisma.category.create({
    data: {
      name: "Выключатели",
      slug: "vyklyuchateli",
      description: "Одно- и двухклавишные, проходные выключатели",
      sortOrder: 2,
    },
  });
  const catRamki = await prisma.category.create({
    data: {
      name: "Рамки",
      slug: "ramki",
      description: "Рамки на 2, 3 и 4 поста",
      sortOrder: 3,
    },
  });
  const catMech = await prisma.category.create({
    data: {
      name: "Механизмы",
      slug: "mehanizmy",
      description: "Для сборки блока",
      sortOrder: 4,
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
    const docs = (item.certs || []).filter((d) => publicFileExists(d.url));
    const images = (item.images?.length ? item.images : item.imageUrl ? [item.imageUrl] : []).filter(publicFileExists);
    const product = await prisma.product.create({
      data: {
        slug: item.slug,
        sku: item.sku,
        name: item.name,
        description: item.description,
        brandId: brand.id,
        series: "Laitys",
        color: item.color,
        posts: item.posts ?? undefined,
        productType: item.productType,
        kitRole: item.kitRole,
        warranty: item.warranty || null,
        certNumber: item.certs?.[0]?.number || null,
        grounded: item.grounded ?? undefined,
        ipRating: item.ipRating,
        nominalCurrent: item.nominalCurrent,
        mountType: item.mountType,
        priceRetail: 0,
        priceWholesale: 0,
        stock: 0,
        packQty: item.packQty,
        isHit: false,
        isNew: false,
        isSale: false,
        marked: false,
        imageUrl: images[0] || null,
        imagesJson: JSON.stringify(images),
        attrsJson: JSON.stringify(item.attrs),
        documentsJson: JSON.stringify(docs),
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

  await prisma.certificate.createMany({
    data: [
      {
        title: "Сертификат соответствия ТР ТС 004/2011 — выключатели",
        number: "ЕАЭС KG417/051.CN.02.03002",
        validFrom: "06.07.2026",
        validUntil: "05.07.2031",
        holder: "ИП Камалова Алла Рашидовна",
        maker: "Guangdong Futina Electrical Co., Ltd",
        skuList: "S1-WH/GY/BK, M-S1-WH/GY/BK, S1P-WH/GY/BK, S2-WH/GY/BK, S2P-WH/GY/BK",
        fileUrl: publicFileExists("/docs/cert-03002.pdf") ? "/docs/cert-03002.pdf" : null,
        published: true,
      },
      {
        title: "Сертификат соответствия ТР ТС 004/2011 — розетки",
        number: "ЕАЭС KG417/051.CN.02.03003",
        validFrom: "07.07.2026",
        validUntil: "06.07.2031",
        holder: "ИП Камалова Алла Рашидовна",
        maker: "Guangdong Futina Electrical Co., Ltd",
        skuList: "D1-WH/GY/BK, M-D1-WH/GY/BK, M-TV-WH/GY/BK",
        fileUrl: publicFileExists("/docs/cert-03003.pdf") ? "/docs/cert-03003.pdf" : null,
        published: true,
      },
      {
        title: "Сертификат соответствия ТР ТС 004/2011 и ТР ТС 020/2011 — USB-розетки",
        number: "ЕАЭС KG417/051.CN.02.03058",
        validFrom: "14.07.2026",
        validUntil: "13.07.2031",
        holder: "ИП Камалова Алла Рашидовна",
        maker: "Guangdong Futina Electrical Co., Ltd",
        skuList: "USB-WH, USB-GY, USB-BK",
        fileUrl: publicFileExists("/docs/cert-03058.pdf") ? "/docs/cert-03058.pdf" : null,
        published: true,
      },
    ],
  });

  await prisma.faqItem.createMany({
    data: [
      {
        question: "Рамка входит в комплект?",
        answer: "Состав указан в карточке товара.",
        sortOrder: 1,
      },
      {
        question: "Что такое проходной выключатель?",
        answer:
          "Он используется для управления светом из разных мест. Схему и совместимые устройства поможет выбрать электрик.",
        sortOrder: 2,
      },
      {
        question: "Где узнать стоимость доставки?",
        answer: "При оформлении, после выбора города.",
        sortOrder: 3,
      },
    ],
  });

  await prisma.siteSetting.createMany({
    data: [
      { key: "brand_name", value: "Laitys" },
      { key: "tagline", value: "Розетки и выключатели. Для современного интерьера. В трёх цветах." },
      { key: "phone", value: "+7 989 234-14-44" },
      { key: "email", value: "kamalovaar@gmail.com" },
      { key: "city", value: "Краснодар" },
      { key: "legal_name", value: "Индивидуальный предприниматель Камалова Алла Рашидовна" },
      { key: "short_name", value: "ИП Камалова Алла Рашидовна" },
      { key: "inn", value: "760403944136" },
      { key: "ogrnip", value: "323237500310184" },
      { key: "okpo", value: "2024672876" },
      { key: "address", value: "350000, Краснодарский край, г. Краснодар, р-н Западный, ул. Буденного, д. 129, кв. 102" },
      { key: "supplier", value: "Guangdong Futina Electrical Co., Ltd" },
      { key: "delivery_provider", value: "ozon" },
      { key: "delivery_note", value: "Укажите город. Стоимость и срок доставки появятся до оплаты." },
      { key: "payment_note", value: "Частный покупатель оплачивает заказ на сайте. Для бизнеса — расчёт после заявки." },
      { key: "warranty_note", value: "10 лет на механизмы розеток и выключателей. Для USB A+C и TV+компьютер — 1 год. Для рамок срок указан в карточке модели." },
      { key: "index_site", value: "0" },
      { key: "hero_title", value: "Розетки и выключатели Laitys" },
      { key: "about_text", value: "Laitys — розетки, выключатели и рамки для современного интерьера. Мы начали продажи на маркетплейсах, а теперь развиваем собственный интернет-магазин." },
    ],
  });

  console.log(`Seed OK: ${catalog.length} Laitys SKU, admin ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
