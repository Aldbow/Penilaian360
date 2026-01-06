"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useState } from "react"

export function Navbar() {
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const routes = [
        {
            href: "/#information",
            label: "Information",
        },
        {
            href: "/#faq",
            label: "FAQ",
        },
        {
            href: "/#contact",
            label: "Contact",
        },
    ]

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-transparent backdrop-blur-xl supports-[backdrop-filter]:bg-background/5">
            <div className="container flex h-16 items-center justify-between">
                <div className="mr-4 flex items-center">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="font-bold">Penilaian360</span>
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
                <div className="flex items-center gap-4">
                    <Link href="/login" className="hidden sm:block">
                        <Button variant="secondary" size="sm">
                            Login
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl">
                    <div className="container py-4 flex flex-col gap-4">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60 py-2"
                                )}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {route.label}
                            </Link>
                        ))}
                        <Link href="/login" className="sm:hidden">
                            <Button variant="secondary" size="sm" className="w-full">
                                Login
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    )
}
