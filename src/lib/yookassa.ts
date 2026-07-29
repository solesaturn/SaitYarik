/**
 * ЮKassa integration layer.
 * In production: use shopId + secretKey Basic auth against api.yookassa.ru
 * Demo mode returns a local confirmation URL and mock receipt.
 */
export async function createYooKassaPayment(input: {
  amount: number;
  orderNumber: string;
  description: string;
  email: string;
  returnUrl: string;
}) {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secret = process.env.YOOKASSA_SECRET_KEY;
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Real credentials → live API (stubbed safely if demo)
  if (shopId && secret && shopId !== "demo" && secret !== "demo") {
    const auth = Buffer.from(`${shopId}:${secret}`).toString("base64");
    const res = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        "Idempotence-Key": `${input.orderNumber}-${Date.now()}`,
      },
      body: JSON.stringify({
        amount: { value: input.amount.toFixed(2), currency: "RUB" },
        capture: true,
        confirmation: { type: "redirect", return_url: input.returnUrl },
        description: input.description,
        receipt: {
          customer: { email: input.email },
          items: [
            {
              description: input.description.slice(0, 128),
              quantity: "1.00",
              amount: { value: input.amount.toFixed(2), currency: "RUB" },
              vat_code: 1,
              payment_mode: "full_payment",
              payment_subject: "commodity",
            },
          ],
        },
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`YooKassa error: ${text}`);
    }
    const data = await res.json();
    return {
      id: data.id as string,
      confirmationUrl: data.confirmation.confirmation_url as string,
      receiptUrl: undefined as string | undefined,
    };
  }

  const id = `demo_${input.orderNumber}`;
  return {
    id,
    confirmationUrl: `${base}/api/payments/yookassa/return?order=${input.orderNumber}&demo=1`,
    receiptUrl: `${base}/api/payments/receipt?order=${input.orderNumber}`,
  };
}
