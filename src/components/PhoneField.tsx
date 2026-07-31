"use client";

import { formatPhoneMask, isValidRuPhone } from "@/lib/phone";

type Props = {
  name?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  id?: string;
};

export function PhoneField({
  name = "phone",
  value,
  onChange,
  required = true,
  className = "rounded border border-[var(--line)] bg-white px-3 py-2 text-sm",
  id,
}: Props) {
  const invalid = value.length > 0 && !isValidRuPhone(value);

  return (
    <div>
      <input
        id={id}
        name={name}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        required={required}
        value={value}
        onChange={(e) => onChange(formatPhoneMask(e.target.value))}
        placeholder="+7 (___) ___-__-__"
        pattern="\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}"
        title="Формат: +7 (900) 123-45-67"
        aria-invalid={invalid}
        className={`${className} w-full ${invalid ? "border-red-500" : ""}`}
      />
      {invalid && <p className="mt-1 text-xs text-red-700">Укажите телефон полностью: +7 (900) 123-45-67</p>}
    </div>
  );
}
