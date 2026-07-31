import { NextRequest, NextResponse } from "next/server";
import { calcPromoDiscount } from "@/lib/promo";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rl = rateLimit(`promo:${clientIp(req)}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Слишком много запросов" }, { status: 429 });
  }

  const { code, subtotal } = await req.json();
  const result = await calcPromoDiscount(code, Number(subtotal) || 0);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.error.includes("истёк") ? 400 : 404 });
  }
  return NextResponse.json({ discount: result.discount, code: result.code });
}
