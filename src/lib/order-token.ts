import { createHmac, timingSafeEqual } from "crypto";
import { getSessionSecret } from "@/lib/secrets";

/** Opaque access token для thanks/receipt без угадывания номера заказа. */
export function orderAccessToken(orderNumber: string): string {
  return createHmac("sha256", getSessionSecret())
    .update(`order:${orderNumber}`)
    .digest("base64url")
    .slice(0, 32);
}

export function verifyOrderAccessToken(orderNumber: string, token: string | null | undefined): boolean {
  if (!token) return false;
  const expected = orderAccessToken(orderNumber);
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(token);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
