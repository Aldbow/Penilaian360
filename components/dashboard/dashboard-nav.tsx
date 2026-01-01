"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { LogOut } from "lucide-react"

export function DashboardNav() {
    const pathname = usePathname()
    const router = useRouter()
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        const checkRole = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()
                if (data?.role === 'admin') {
                    setIsAdmin(true)
                }
            }
        }
        checkRole()
    }, [])

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    return (
        <nav className="border-b bg-background">
            <div className="container flex h-16 items-center px-4">
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="hidden font-bold sm:inline-block">Penilaian360</span>
                    </Link>
                    <div className="flex items-center space-x-6 text-sm font-medium">
                        {!isAdmin && (
                            <Link
                                href="/dashboard/staff"
                                className={cn(
                                    "transition-colors hover:text-foreground/80",
                                    pathname?.includes("/dashboard/staff") ? "text-foreground" : "text-foreground/60"
                                )}
                            >
                                Penilaian (Staff)
                            </Link>
                        )}
                        {isAdmin && (
                            <Link
                                href="/dashboard/admin"
                                className={cn(
                                    "transition-colors hover:text-foreground/80",
                                    pathname?.includes("/dashboard/admin") ? "text-foreground" : "text-foreground/60"
                                )}
                            >
                                Admin Dashboard
                            </Link>
                        )}
                    </div>
                </div>
                <div className="ml-auto flex items-center space-x-4">
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-red-500">
                        <LogOut className="mr-2 h-4 w-4" />
                        Keluar
                    </Button>
                </div>
            </div>
        </nav>
    )
}
