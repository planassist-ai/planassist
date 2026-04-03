import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CookieConsentBanner } from "./components/CookieConsentBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Granted — Your Planning Permission Companion",
  description:
    "Everything you need to navigate the Irish planning process — from permission checker to planning permission granted.",
  openGraph: {
    title: "Granted — Your Planning Permission Companion",
    description:
      "Everything you need to navigate the Irish planning process — from permission checker to planning permission granted.",
    siteName: "Granted",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
