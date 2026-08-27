import { prisma } from "@/lib/prisma";
import { SITE, type SiteInfo } from "@/lib/pricing";

export async function getSite(): Promise<SiteInfo> {
  try {
    const rows = await prisma.siteSetting.findMany();
    const map = Object.fromEntries(rows.map((s) => [s.key, s.value]));
    return {
      ...SITE,
      name: map.brand_name || SITE.name,
      tagline: map.tagline || SITE.tagline,
      phone: map.phone || SITE.phone,
      email: map.email || SITE.email,
      city: map.city || SITE.city,
      legalName: map.legal_name || SITE.legalName,
      shortName: map.short_name || SITE.shortName,
      inn: map.inn || SITE.inn,
      ogrnip: map.ogrnip || SITE.ogrnip,
      address: map.address || SITE.address,
      index: (map.index_site || "0") === "1",
    };
  } catch {
    return SITE;
  }
}

export async function getSetting(key: string, fallback = "") {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    return row?.value || fallback;
  } catch {
    return fallback;
  }
}
