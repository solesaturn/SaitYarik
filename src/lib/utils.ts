import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

export function packQuantity(qty: number, packQty: number) {
  if (packQty <= 1) return Math.max(1, qty);
  return Math.max(packQty, Math.ceil(qty / packQty) * packQty);
}

export function generateOrderNumber() {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `SY-${stamp}-${rnd}`;
}
