import { Metadata } from "next"
import Link from "next/link"
import { UserAuthForm } from "@/components/auth/user-auth-form"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { PageTransition } from "@/components/ui/page-transition"

export const metadata: Metadata = {
    title: "Login",
    description: "Login to your account",
}

export default function LoginPage() {
    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <Link
                href="/"
                className="absolute left-4 top-4 md:left-8 md:top-8"
            >
                <Button variant="ghost" className="pl-0 text-muted-foreground hover:text-primary">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Kembali
                </Button>
            </Link>
            <PageTransition className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Selamat Datang
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Masukkan email dan password untuk masuk ke akun Anda.
                    </p>
                </div>
                <UserAuthForm />
                <p className="px-8 text-center text-sm text-muted-foreground">
                    <Link
                        href="/#contact"
                        className="hover:text-brand underline underline-offset-4"
                    >
                        Lupa password? Hubungi Admin
                    </Link>
                </p>
            </PageTransition>
        </div>
    )
}
