import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/navbar"; // 追加

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GearPit',
  description: 'Manage your outdoor gear inventory and pack weight.',
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
            {/* Navbarを追加 */}
            <Navbar />
            
            <main>
              {children}
            </main>
            
            <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}