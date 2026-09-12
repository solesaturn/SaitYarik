export type ProductDisplayInput = {
  sku: string;
  name?: string | null;
  color?: string | null;
  kitRole?: string | null;
  productType?: string | null;
  posts?: number | null;
  description?: string | null;
  mountType?: string | null;
  warranty?: string | null;
};

export type ProductDisplay = {
  title: string;
  color: string | null;
  completeness: string | null;
  extras: string[];
  description: string;
  badges: string[];
};

const COLOR_LABEL: Record<string, string> = {
  белый: "Белый",
  белая: "Белый",
  серый: "Серый",
  серая: "Серый",
  чёрный: "Чёрный",
  черный: "Чёрный",
  чёрная: "Чёрный",
  черная: "Чёрный",
};

const COLOR_ADJ: Record<string, string> = {
  Белый: "Белая",
  Серый: "Серая",
  Чёрный: "Чёрная",
};

export function skuBase(sku: string) {
  return sku.replace(/-(WH|GY|BK)$/i, "").toUpperCase();
}

export function colorLabel(color?: string | null) {
  if (!color) return null;
  return COLOR_LABEL[color.trim().toLowerCase()] || color;
}

function completenessFromRole(kitRole?: string | null, fallback?: string | null): string | null {
  if (kitRole === "assembled") return "В сборе";
  if (kitRole === "mechanism") return "Без рамки";
  if (kitRole === "frame") return null;
  return fallback ?? null;
}

type Spec = {
  title: string;
  extras: string[];
  completeness: string | null;
  description: string;
};

const SPECS: Record<string, Spec> = {
  D1: {
    title: "Розетка со шторками",
    extras: [],
    completeness: "В сборе",
    description:
      "Розетка для одной точки подключения. Защитные шторки закрывают отверстия контактов, когда вилка не вставлена.",
  },
  USB: {
    title: "Розетка USB A+C",
    extras: [],
    completeness: "В сборе",
    description:
      "Розетка с разъёмами USB A и USB C для одной точки. Мощность и протоколы зарядки указаны в характеристиках этой модели.",
  },
  S1: {
    title: "Выключатель",
    extras: ["Одна клавиша"],
    completeness: "В сборе",
    description: "Одноклавишный выключатель для одной группы света. Готовое изделие на одно место.",
  },
  S2: {
    title: "Выключатель",
    extras: ["Две клавиши"],
    completeness: "В сборе",
    description: "Двухклавишный выключатель для двух групп света. Готовое изделие на одно место.",
  },
  S1P: {
    title: "Проходной выключатель",
    extras: ["Одна клавиша"],
    completeness: "В сборе",
    description:
      "Проходной выключатель используется для управления светом из разных мест. Схему и совместимые устройства поможет выбрать электрик.",
  },
  S2P: {
    title: "Проходной выключатель",
    extras: ["Две клавиши"],
    completeness: "В сборе",
    description:
      "Двухклавишный проходной выключатель для управления светом из разных мест. Схему подключения поможет выбрать электрик.",
  },
  P2: {
    title: "Рамка",
    extras: ["2 места"],
    completeness: null,
    description: "Рамка на два места. Для сборки блока нужны механизмы того же цвета.",
  },
  P3: {
    title: "Рамка",
    extras: ["3 места"],
    completeness: null,
    description: "Рамка на три места. Для сборки блока нужны механизмы того же цвета.",
  },
  P4: {
    title: "Рамка",
    extras: ["4 места"],
    completeness: null,
    description: "Рамка на четыре места. Для сборки блока нужны механизмы того же цвета.",
  },
  "M-D1": {
    title: "Розетка",
    extras: [],
    completeness: "Без рамки",
    description: "Механизм розетки без рамки. Для нескольких мест нужна рамка того же цвета.",
  },
  "M-S1": {
    title: "Выключатель",
    extras: ["Одна клавиша"],
    completeness: "Без рамки",
    description: "Механизм выключателя без рамки. Для нескольких мест нужна рамка того же цвета.",
  },
  "M-TV": {
    title: "TV + компьютер",
    extras: [],
    completeness: "Без рамки",
    description: "Информационный механизм без рамки. Стандарт разъёмов указан в характеристиках модели.",
  },
};

export function displayProduct(product: ProductDisplayInput): ProductDisplay {
  const spec = SPECS[skuBase(product.sku)];
  const color = colorLabel(product.color);
  const completeness = spec?.completeness ?? completenessFromRole(product.kitRole);
  const extras = spec?.extras ? [...spec.extras] : [];
  if (!spec && product.posts && product.kitRole === "frame") {
    extras.push(`${product.posts} ${product.posts === 1 ? "место" : product.posts < 5 ? "места" : "мест"}`);
  }
  const title = spec?.title || shortNameFromRaw(product.name || product.sku);
  const description =
    spec?.description ||
    cleanDescription(product.description) ||
    title;
  const badges = [color, completeness, ...extras].filter(Boolean) as string[];
  return { title, color, completeness, extras, description, badges };
}

function shortNameFromRaw(name: string) {
  return name
    .replace(/,?\s*(белый|белая|серый|серая|чёрный|черный|чёрная|черная)$/i, "")
    .replace(/,?\s*в сборе/i, "")
    .replace(/,?\s*\(без панели\)/i, "")
    .replace(/,?\s*\(механизм\)/i, "")
    .trim();
}

function cleanDescription(text?: string | null) {
  if (!text) return "";
  return text
    .replace(/одна вилка немецкого образца/gi, "розетка немецкого образца")
    .replace(/с одной немецкой вилкой/gi, "с розеткой Schuko")
    .replace(/\s+/g, " ")
    .trim();
}

export function productImages(product: { imageUrl?: string | null; imagesJson?: string | null }) {
  try {
    const parsed = JSON.parse(product.imagesJson || "[]") as unknown;
    if (Array.isArray(parsed)) {
      const urls = parsed.filter((x): x is string => typeof x === "string" && x.length > 0);
      if (urls.length) return urls;
    }
  } catch {
    /* ignore */
  }
  return product.imageUrl ? [product.imageUrl] : [];
}

export function productAlt(product: ProductDisplayInput, view = "вид спереди") {
  const { title, color } = displayProduct(product);
  const adj = color ? COLOR_ADJ[color] || color : "";
  const named = adj ? `${adj} ${title.toLowerCase()}` : title;
  return `${named} Laitys ${product.sku}, ${view}`;
}

export function completenessLabel(kitRole?: string | null) {
  return completenessFromRole(kitRole);
}

export function kitRoleFilterLabel(kitRole: string) {
  if (kitRole === "assembled") return "В сборе";
  if (kitRole === "mechanism") return "Без рамки";
  if (kitRole === "frame") return "Рамка";
  return kitRole;
}

export const HOME_FAQS = [
  {
    question: "Рамка входит в комплект?",
    answer: "Состав указан в карточке товара.",
  },
  {
    question: "Что такое проходной выключатель?",
    answer:
      "Он используется для управления светом из разных мест. Схему и совместимые устройства поможет выбрать электрик.",
  },
  {
    question: "Где узнать стоимость доставки?",
    answer: "При оформлении, после выбора города.",
  },
];
