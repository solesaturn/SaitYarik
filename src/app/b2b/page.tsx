import { B2BQuoteForm } from "@/components/B2BQuoteForm";
import { prisma } from "@/lib/prisma";
import { productAlt } from "@/lib/product-display";

export const metadata = {
  title: "Для бизнеса",
  description: "Отправьте спецификацию — подготовим расчёт заказа Laitys",
};

export const dynamic = "force-dynamic";

export default async function B2BPage() {
  const image = await prisma.product.findFirst({
    where: { active: true, sku: "D1-BK" },
    select: { sku: true, name: true, color: true, imageUrl: true },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <h1 className="section-title">Для бизнеса</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-[var(--muted)]">
        Отправьте список товаров или спецификацию. Мы подготовим расчёт и согласуем условия заказа.
      </p>
      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-start">
        <div>
          {image && (
            <div className="overflow-hidden rounded-2xl bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.imageUrl || "/images/placeholder.png"}
                alt={productAlt(image)}
                className="aspect-[4/3] w-full object-cover object-left"
              />
            </div>
          )}
          <p className="mt-4 text-sm text-[var(--muted)]">
            Розничную покупку оформите в каталоге. Эта форма — для расчёта заказа по спецификации.
          </p>
        </div>
        <B2BQuoteForm />
      </div>
    </div>
  );
}
