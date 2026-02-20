import type { Metadata, Viewport } from "next";
import "./globals.css";
import TelegramProvider from "@/components/TelegramProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Chim Bron | Futbol maydonlarini bron qilish",
  description:
    "3 ta futbol maydonini onlayn bron qiling. Bo'sh vaqtlarni ko'ring va darhol so'rov yuboring.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" defer />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
      </head>
      <body className="antialiased">
        <TelegramProvider>{children}</TelegramProvider>
      </body>
    </html>
  );
}
