import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GearPit",
  description: "Gear Configuration Manager",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* ヘッダー領域として右上に配置 */}
            <div className="absolute top-4 right-4 z-50">
              <ModeToggle />
            </div>
            
            {children}
            <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}