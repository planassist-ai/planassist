import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CookieConsentBanner } from "./components/CookieConsentBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Planr — AI Planning Permission for Ireland",
  description:
    "Understand your planning permission requirements in Ireland with AI-powered guidance.",
  openGraph: {
    title: "Planr — AI Planning Permission for Ireland",
    description:
      "Understand your planning permission requirements in Ireland with AI-powered guidance.",
    siteName: "Planr",
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
