import Link from "next/link";
import { Package, Layers } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl text-zinc-800">GearPit</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="flex items-center transition-colors hover:text-zinc-800 text-zinc-600">
              <Package className="mr-2 h-4 w-4" />
              Inventory
            </Link>
            <Link href="/loadouts" className="flex items-center transition-colors hover:text-zinc-800 text-zinc-600">
              <Layers className="mr-2 h-4 w-4" />
              Loadouts
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}