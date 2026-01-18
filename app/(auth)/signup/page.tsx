import { Metadata } from "next"
import Link from "next/link"
import { UserSignUpForm } from "@/components/auth/user-signup-form"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { PageTransition } from "@/components/ui/page-transition"

export const metadata: Metadata = {
    title: "Daftar Akun",
    description: "Daftar akun baru untuk mengakses sistem penilaian",
}

export default function SignUpPage() {
    return (
        <div className="container flex min-h-screen w-screen flex-col items-center justify-center py-8">
            <Link
                href="/"
                className="absolute left-4 top-4 md:left-8 md:top-8"
            >
                <Button variant="ghost" className="pl-0 text-muted-foreground hover:text-primary">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Kembali
                </Button>
            </Link>
            <PageTransition className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Buat Akun Baru
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Lengkapi data di bawah ini untuk mendaftar
                    </p>
                </div>
                <UserSignUpForm />
                <p className="px-8 text-center text-sm text-muted-foreground">
                    Sudah punya akun?{" "}
                    <Link
                        href="/login"
                        className="underline underline-offset-4 hover:text-primary transition-colors"
                    >
                        Masuk di sini
                    </Link>
                </p>
            </PageTransition>
        </div>
    )
}
