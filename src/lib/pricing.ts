export type PriceMode = "b2c" | "b2b";

export function getProductPrice(
  product: { priceRetail: number; priceWholesale: number },
  mode: PriceMode,
  b2bApproved = false
) {
  if (mode === "b2b" && b2bApproved) return product.priceWholesale;
  return product.priceRetail;
}

export const SITE = {
  name: "SaitYarik",
  tagline: "Розетки, выключатели и электрофурнитура",
  phone: "+7 (495) 120-45-67",
  email: "info@saityarik.ru",
  city: "Москва",
};
