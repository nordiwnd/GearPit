import Link from "next/link"
import { Package, List, Backpack, Settings } from "lucide-react"

export function TopNav() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-[#18181B]">
            <div className="flex h-12 items-center px-4 md:px-6">
                <Link href="/" className="flex items-center space-x-2 mr-6 text-zinc-100 hover:text-white transition-colors">
                    <span className="font-bold tracking-tight text-lg">GearPit</span>
                </Link>
                <nav className="flex items-center space-x-4 md:space-x-6 text-sm font-medium">
                    <Link href="/trips" className="flex items-center text-zinc-400 hover:text-zinc-100 transition-colors">
                        <Backpack className="w-4 h-4 mr-2" />
                        Trips
                    </Link>
                    <Link href="/loadouts" className="flex items-center text-zinc-400 hover:text-zinc-100 transition-colors">
                        <List className="w-4 h-4 mr-2" />
                        Loadouts
                    </Link>
                    <Link href="/gears" className="flex items-center text-zinc-400 hover:text-zinc-100 transition-colors">
                        <Package className="w-4 h-4 mr-2" />
                        Gears
                    </Link>
                    <Link href="/settings" className="flex items-center text-zinc-400 hover:text-zinc-100 transition-colors">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                    </Link>
                </nav>
            </div>
        </header>
    )
}
