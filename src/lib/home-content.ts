import { z } from "zod";
import { safeImage } from "@/lib/product-content";

export const HOME_DEFAULTS = {
  heroTitle: "Розетки и выключатели Laitys",
  heroText: "Ультратонкая серия Zero для современного интерьера. Готовые изделия и модульные решения в белом, сером и чёрном цветах.",
  heroImage: "/images/products/D1-WH/01.png", heroAlt: "Композиция с белой розеткой Laitys Zero на светлой стене",
  benefits: ["Тонкий профиль", "Самозажимные клеммы и лёгкий монтаж", "Три цвета", "Блок под ваш интерьер"],
  whyTitle: "Почему Laitys", whyText: "Матовая окрашенная поверхность, лаконичная форма и гибкая комбинация модулей.",
  whyImage: "/images/common/01.png",
  guideTitle: "Как собрать блок", guideText: "Готовые одинарные розетки и выключатели устанавливаются без отдельной рамки. Для блока на 2, 3 или 4 поста выберите рамку и по одному модулю на каждый пост. Все элементы блока должны быть одного цвета.",
  businessTitle: "Для бизнеса", businessText: "Отправьте список товаров или спецификацию. Мы подготовим расчёт и согласуем условия заказа.",
  seoTitle: "Розетки и выключатели Laitys Zero", seoDescription: "Готовые изделия и модули Laitys Zero. Соберите блок на 2, 3 или 4 поста в белом, сером или чёрном цвете.",
};
export const homeContentSchema = z.object({
  heroTitle: z.string().min(1).max(200), heroText: z.string().max(2000), heroImage: z.string().refine(safeImage), heroAlt: z.string().max(300),
  benefits: z.array(z.string().min(1).max(200)).length(4),
  whyTitle: z.string().max(200), whyText: z.string().max(2000), whyImage: z.string().refine(safeImage),
  guideTitle: z.string().max(200), guideText: z.string().max(2000), businessTitle: z.string().max(200), businessText: z.string().max(2000),
  seoTitle: z.string().max(200), seoDescription: z.string().max(500),
});
export type HomeContent = z.infer<typeof homeContentSchema>;
