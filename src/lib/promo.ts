import { prisma } from "@/lib/prisma";

export async function calcPromoDiscount(code: string | null | undefined, subtotal: number) {
  if (!code || subtotal <= 0) return { discount: 0, code: null as string | null };
  const promo = await prisma.promoCode.findUnique({
    where: { code: String(code).toUpperCase() },
  });
  if (!promo || !promo.active) {
    return { error: "Промокод не найден" as const, discount: 0, code: null };
  }
  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return { error: "Промокод истёк" as const, discount: 0, code: null };
  }
  const raw = promo.percent ? (subtotal * promo.percent) / 100 : promo.amount || 0;
  const discount = Math.min(Math.max(0, raw), subtotal);
  return { discount, code: promo.code, error: undefined };
}
