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
  if (product.kitRole === "mechanism") {
    return catalog.filter((p) => p.kitRole === "frame" && sameColor(p.color, product.color));
  }
  if (product.kitRole === "frame") {
    return catalog.filter((p) => p.kitRole === "mechanism" && sameColor(p.color, product.color));
  }
  const base = product.sku.replace(/-(WH|GY|BK)$/i, "");
  return catalog.filter((p) => p.sku.replace(/-(WH|GY|BK)$/i, "") === base && p.id !== product.id);
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
