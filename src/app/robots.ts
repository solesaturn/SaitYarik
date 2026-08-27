import type { MetadataRoute } from "next";
import { getSite } from "@/lib/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSite();
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  if (!site.index) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/account", "/checkout", "/cart"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
