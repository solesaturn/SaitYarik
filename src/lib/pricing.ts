export type PriceMode = "b2c" | "b2b";

export function hasConfirmedPrice(product: { priceRetail: number }) {
  return Number(product.priceRetail) > 0;
}

/** На витрине только подтверждённая розничная цена из админки. Опт сайт не считает. */
export function getProductPrice(
  product: { priceRetail: number; priceWholesale: number },
  _b2bApproved = false,
  _mode?: PriceMode
) {
  return product.priceRetail;
}

export type SiteInfo = {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  city: string;
  legalName: string;
  shortName: string;
  inn: string;
  ogrnip: string;
  address: string;
  index: boolean;
};

export const SITE: SiteInfo = {
  name: "Laitys",
  tagline: "Электроустановочные изделия. Ничего лишнего на стене.",
  phone: "+7 989 234-14-44",
  email: "kamalovaar@gmail.com",
  city: "Краснодар",
  legalName: "Индивидуальный предприниматель Камалова Алла Рашидовна",
  shortName: "ИП Камалова Алла Рашидовна",
  inn: "760403944136",
  ogrnip: "323237500310184",
  address: "350000, Краснодарский край, г. Краснодар, р-н Западный, ул. Буденного, д. 129, кв. 102",
  index: false,
};
