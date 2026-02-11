"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Layers, Map, Mountain, Settings, LayoutDashboard } from "lucide-react"; // LayoutDashboardを追加
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    // Dashboardを追加
    { name: "Inventory", href: "/", icon: Package },
    { name: "Loadouts", href: "/loadouts", icon: Layers },
    { name: "Trips", href: "/trips", icon: Map },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
            <Mountain className="h-6 w-6" />
            <span>GearPit</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1 transition-colors hover:text-foreground",
                  pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="hover:bg-accent">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </Button>
          </Link>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}