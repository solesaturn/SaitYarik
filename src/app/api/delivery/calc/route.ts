import { NextRequest, NextResponse } from "next/server";

/**
 * Modular delivery provider adapter (CDEK or Ozon).
 * Cart/checkout stay provider-agnostic.
 */
type Provider = "cdek" | "ozon";

function getProvider(): Provider {
  const p = (process.env.DELIVERY_PROVIDER || "cdek").toLowerCase();
  return p === "ozon" ? "ozon" : "cdek";
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const provider = getProvider();
  const weight = Number(body.weightKg || 1);
  const city = String(body.city || "Москва");
  const method = String(body.method || "COURIER");

  if (method === "SELFPICKUP") {
    return NextResponse.json({ provider, cost: 0, days: 0, label: "Самовывоз" });
  }

  // Demo tariff calculation — replace with real CDEK/Ozon API
  const base = provider === "cdek" ? 290 : 310;
  const cost = method === "COURIER" ? base + Math.round(weight * 40) : base;
  const days = method === "COURIER" ? 2 : 3;

  return NextResponse.json({
    provider,
    cost,
    days,
    city,
    trackPlaceholder: true,
    label: provider === "cdek" ? "СДЭК" : "Ozon Delivery",
  });
}
