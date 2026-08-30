export type KitProduct = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  color: string | null;
  posts: number | null;
  kitRole: string | null;
  productType: string | null;
  imageUrl: string | null;
  priceRetail: number;
  stock: number;
  packQty: number;
};

const COLOR_SUFFIX: Record<string, string> = {
  белый: "WH",
  серый: "GY",
  чёрный: "BK",
  черный: "BK",
};

export function colorSuffix(color: string) {
  return COLOR_SUFFIX[color] || "";
}

export function sameColor(a?: string | null, b?: string | null) {
  if (!a || !b) return false;
  const n = (s: string) => s.toLowerCase().replace("ё", "е");
  return n(a) === n(b);
}

export function compatibleWith(product: KitProduct, catalog: KitProduct[]) {
  const same = catalog.filter((p) => p.id !== product.id && sameColor(p.color, product.color));
  const frames = same
    .filter((p) => p.kitRole === "frame")
    .sort((a, b) => (a.posts || 0) - (b.posts || 0));
  const mechanisms = same.filter((p) => p.kitRole === "mechanism");

  if (product.kitRole === "frame") return mechanisms;
  if (product.kitRole === "mechanism") return [...frames, ...mechanisms];
  return [...frames, ...mechanisms];
}

export function kitSectionCopy(product: Pick<KitProduct, "kitRole">) {
  if (product.kitRole === "frame") {
    return {
      title: "Механизмы в эту рамку",
      text: "Только того же цвета. Число механизмов равно числу постов рамки.",
    };
  }
  if (product.kitRole === "mechanism") {
    return {
      title: "Что взять в комплект",
      text: "Рамка того же цвета и другие механизмы на свободные посты.",
    };
  }
  return {
    title: "Что взять в комплект",
    text: "Готовое изделие закрывает один пост. На два и больше нужны рамка и механизмы того же цвета.",
  };
}

export function frameSku(posts: number, color: string) {
  const suffix = colorSuffix(color);
  return suffix ? `P${posts}-${suffix}` : null;
}

export function canBuildKit(input: {
  mechanism?: KitProduct | null;
  frame?: KitProduct | null;
  color: string;
  posts: number;
}) {
  const { mechanism, frame, color, posts } = input;
  if (!mechanism || mechanism.kitRole !== "mechanism") return false;
  if (!sameColor(mechanism.color, color)) return false;
  if (posts === 1) return !frame;
  if (!frame || frame.kitRole !== "frame") return false;
  if (frame.posts !== posts) return false;
  return sameColor(frame.color, color);
}
