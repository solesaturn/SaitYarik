/** Нормализация и маска телефона РФ (+7). */

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function formatPhoneMask(value: string): string {
  let d = digitsOnly(value);
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (d && !d.startsWith("7")) d = "7" + d;
  d = d.slice(0, 11);

  const p = d.slice(1);
  if (!d) return "";
  if (p.length === 0) return "+7";
  if (p.length <= 3) return `+7 (${p}`;
  if (p.length <= 6) return `+7 (${p.slice(0, 3)}) ${p.slice(3)}`;
  if (p.length <= 8) return `+7 (${p.slice(0, 3)}) ${p.slice(3, 6)}-${p.slice(6)}`;
  return `+7 (${p.slice(0, 3)}) ${p.slice(3, 6)}-${p.slice(6, 8)}-${p.slice(8, 10)}`;
}

export function isValidRuPhone(value: string): boolean {
  const d = digitsOnly(value);
  const normalized = d.startsWith("8") ? "7" + d.slice(1) : d;
  return /^7\d{10}$/.test(normalized);
}

export function toE164(value: string): string {
  let d = digitsOnly(value);
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (!d.startsWith("7")) d = "7" + d;
  return `+${d.slice(0, 11)}`;
}
