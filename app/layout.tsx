import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CookieBanner } from "@/components/ui/cookie-banner";
import { Chatbot } from "@/components/chatbot";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DIRAMCO",
  description: "Gestione del portafoglio e investimenti con l'IA",
  icons: {
    icon: '/icon.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 z-50 transform origin-left animate-[loading_1s_ease-in-out]" />
        <Providers>
          {children}
        </Providers>
        <CookieBanner />
        <Chatbot />
      </body>
    </html>
  );
}
