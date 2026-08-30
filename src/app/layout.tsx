import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/lib/cart-context";
import { FavoritesProvider } from "@/lib/favorites-context";
import { CookieBanner } from "@/components/CookieBanner";
import { CartToast } from "@/components/CartToast";
import { FavoriteToast } from "@/components/FavoriteToast";
import { getSite } from "@/lib/site";

const body = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: {
      default: `${site.name} — ${site.tagline}`,
      template: `%s · ${site.name}`,
    },
    description: site.tagline,
    robots: site.index ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title: site.name,
      description: site.tagline,
      locale: "ru_RU",
      type: "website",
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" data-scroll-behavior="smooth">
      <body className={`${body.variable} antialiased`}>
        <CartProvider>
          <FavoritesProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 overflow-x-clip">{children}</main>
              <Footer />
              <CartToast />
              <FavoriteToast />
              <CookieBanner />
            </div>
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  );
}

export const dynamic = "force-dynamic";

