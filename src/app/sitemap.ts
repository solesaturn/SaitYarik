import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  let categories: { slug: string }[] = [];
  let products: { slug: string; updatedAt: Date }[] = [];
  let posts: { slug: string; createdAt: Date }[] = [];
  let brands: { slug: string }[] = [];

  try {
    [categories, products, posts, brands] = await Promise.all([
      prisma.category.findMany({ select: { slug: true } }),
      prisma.product.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
      prisma.blogPost.findMany({ select: { slug: true, createdAt: true } }),
      prisma.brand.findMany({ select: { slug: true } }),
    ]);
  } catch {
    // DB may be empty during first build
  }

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/catalog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/b2b`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/kit`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/documents`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contacts`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/delivery`, changeFrequency: "monthly", priority: 0.6 },

    ...categories.map((c) => ({
      url: `${base}/catalog/${c.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${base}/product/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...brands.map((b) => ({
      url: `${base}/brands/${b.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.createdAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
