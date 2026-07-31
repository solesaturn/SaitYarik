export type PriceMode = "b2c" | "b2b";

/** Розничная цена для всех; оптовая («Ваша цена») — только после одобрения юрлица. */
export function getProductPrice(
  product: { priceRetail: number; priceWholesale: number },
  b2bApproved = false,
  /** @deprecated переключатель режима убран из UI */
  _mode?: PriceMode
) {
  if (b2bApproved) return product.priceWholesale;
  return product.priceRetail;
}

export const SITE = {
  name: "SaitYarik",
  tagline: "Розетки, выключатели и электрофурнитура Futina",
  phone: "+7 (495) 120-45-67",
  email: "info@saityarik.ru",
  city: "Москва",
};
