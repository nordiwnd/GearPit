import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header"; // 追加

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GearPit",
  description: "Gear Configuration Manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SiteHeader /> {/* ヘッダーを追加 */}
        <main>{children}</main>
      </body>
    </html>
  );
}