import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/lib/cart-context";
import { FavoritesProvider } from "@/lib/favorites-context";
import { CookieBanner } from "@/components/CookieBanner";
import { CartToast } from "@/components/CartToast";
import { FavoriteToast } from "@/components/FavoriteToast";
import { SITE } from "@/lib/pricing";

const body = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description:
    "Интернет-магазин розеток, выключателей и электрофурнитуры Futina. Склад в Москве, доставка по РФ.",
  openGraph: {
    title: SITE.name,
    description: SITE.tagline,
    locale: "ru_RU",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className={`${body.variable} antialiased`}>
        <CartProvider>
          <FavoritesProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <CartToast />
              <FavoriteToast />
              <CookieBanner />
            </div>
          </FavoritesProvider>
        </CartProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];`,
          }}
        />
      </body>
    </html>
  );
}
