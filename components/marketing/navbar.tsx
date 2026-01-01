"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function Navbar() {
    const pathname = usePathname()

    const routes = [
        {
            href: "/#faq",
            label: "FAQ",
        },
        {
            href: "/#information",
            label: "Information",
        },
        {
            href: "/#contact",
            label: "Contact",
        },
    ]

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-transparent backdrop-blur-xl supports-[backdrop-filter]:bg-background/5">
            <div className="container flex h-16 items-center justify-between">
                <div className="mr-4 flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="hidden font-bold sm:inline-block">Penilaian360</span>
                    </Link>
                    <div className="hidden md:flex gap-6">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                                )}
                            >
                                {route.label}
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <Link href="/login">
                        <Button variant="secondary" size="sm">
                            Login
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    )
}
