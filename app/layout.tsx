import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CookieBanner } from "@/components/ui/cookie-banner";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DIRAMCO",
  description: "Gestione del portafoglio e investimenti con l'IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 z-50 transform origin-left animate-[loading_1s_ease-in-out]" />
        <Providers>
          {children}
        </Providers>
        <CookieBanner />
      </body>
    </html>
  );
}
