import { isProductionLike } from "@/lib/secrets";

type PaymentResult = {
  id: string;
  confirmationUrl: string;
  receiptUrl?: string;
  demo: boolean;
};

function credentials() {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secret = process.env.YOOKASSA_SECRET_KEY;
  const live = !!(shopId && secret && shopId !== "demo" && secret !== "demo");
  return { shopId, secret, live };
}

/**
 * ЮKassa. Live — при реальных ключах.
 * Demo — shopId=demo или локальная разработка; PAID ставится только после проверки в return/webhook.
 */
export async function createYooKassaPayment(input: {
  amount: number;
  orderNumber: string;
  description: string;
  email: string;
  returnUrl: string;
}): Promise<PaymentResult> {
  const { shopId, secret, live } = credentials();

  if (live) {
    const auth = Buffer.from(`${shopId}:${secret}`).toString("base64");
    const res = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        "Idempotence-Key": input.orderNumber,
      },
      body: JSON.stringify({
        amount: { value: input.amount.toFixed(2), currency: "RUB" },
        capture: true,
        confirmation: { type: "redirect", return_url: input.returnUrl },
        description: input.description,
        metadata: { orderNumber: input.orderNumber },
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
      receiptUrl: undefined,
      demo: false,
    };
  }

  if (isProductionLike() && process.env.ALLOW_DEMO_PAYMENTS === "0") {
    throw new Error("ЮKassa не настроена: задайте реальные YOOKASSA_* или уберите ALLOW_DEMO_PAYMENTS=0");
  }

  return {
    id: `demo_${input.orderNumber}`,
    confirmationUrl: input.returnUrl.includes("?")
      ? `${input.returnUrl}&demo=1`
      : `${input.returnUrl}?demo=1`,
    receiptUrl: undefined,
    demo: true,
  };
}

export async function fetchYooKassaPayment(paymentId: string) {
  const { shopId, secret, live } = credentials();
  if (!live) return null;
  const auth = Buffer.from(`${shopId}:${secret}`).toString("base64");
  const res = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
    headers: { Authorization: `Basic ${auth}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json() as Promise<{
    id: string;
    status: string;
    amount: { value: string; currency: string };
    metadata?: { orderNumber?: string };
  }>;
}

export function isYooKassaLive() {
  return credentials().live;
}
