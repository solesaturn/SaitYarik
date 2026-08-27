import Link from "next/link";

const links = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/orders", label: "Заказы" },
  { href: "/admin/b2b", label: "Заявки B2B" },
  { href: "/admin/content", label: "Тексты и FAQ" },
  { href: "/admin/help", label: "Инструкция" },
];

export function AdminNav() {
  return (
    <nav className="mb-8 flex flex-wrap gap-2">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="pill">
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
