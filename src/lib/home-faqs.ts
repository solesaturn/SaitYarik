import { prisma } from "@/lib/prisma";
import { HOME_FAQS } from "@/lib/product-display";

// Upgrade only the original seed copy; preserve all owner-written questions.
const legacy = [
  ["Рамка входит в комплект?", "Состав указан в карточке товара."],
  ["Что такое проходной выключатель?", "Он используется для управления светом из разных мест. Схему и совместимые устройства поможет выбрать электрик."],
  ["Где узнать стоимость доставки?", "При оформлении, после выбора города."],
];

export async function getHomeFaqs(preview = false) {
  if (preview) {
    const draft = await prisma.siteSetting.findUnique({where:{key:'draft:faqs'}});
    if (draft) return JSON.parse(draft.value) as {id:string;question:string;answer:string;sortOrder:number}[];
  }
  const rows = await prisma.faqItem.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
  return rows.map((row) => {
    const index = legacy.findIndex(([question, answer]) => row.question === question && row.answer === answer);
    return index < 0 ? row : { ...row, ...HOME_FAQS[index] };
  });
}
