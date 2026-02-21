import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function IndexPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#18181B] text-zinc-200 p-8">
            <h1 className="text-4xl font-bold mb-8 text-white tracking-tight">GearPit Navigation</h1>

            <div className="flex flex-col space-y-4 w-full max-w-sm">
                <Button asChild variant="outline" className="h-14 bg-[#27272A] border-zinc-800 hover:bg-zinc-800 hover:text-white justify-start px-6 text-lg">
                    <Link href="/gears">Gears</Link>
                </Button>

                <Button asChild variant="outline" className="h-14 bg-[#27272A] border-zinc-800 hover:bg-zinc-800 hover:text-white justify-start px-6 text-lg">
                    <Link href="/loadouts">Loadouts</Link>
                </Button>

                <Button asChild variant="outline" className="h-14 bg-[#27272A] border-zinc-800 hover:bg-zinc-800 hover:text-white justify-start px-6 text-lg">
                    <Link href="/trips">Trips</Link>
                </Button>
            </div>
        </div>
    )
}
