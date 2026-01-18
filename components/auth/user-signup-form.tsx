"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle, User, Briefcase, Building2 } from "lucide-react"

interface UserSignUpFormProps extends React.HTMLAttributes<HTMLDivElement> { }

export function UserSignUpForm({ className, ...props }: UserSignUpFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [showPassword, setShowPassword] = React.useState<boolean>(false)
    const [showConfirmPassword, setShowConfirmPassword] = React.useState<boolean>(false)
    const [error, setError] = React.useState<string | null>(null)
    const [success, setSuccess] = React.useState<boolean>(false)

    // Form fields
    const [email, setEmail] = React.useState<string>("")
    const [password, setPassword] = React.useState<string>("")
    const [confirmPassword, setConfirmPassword] = React.useState<string>("")
    const [fullName, setFullName] = React.useState<string>("")
    const [position, setPosition] = React.useState<string>("")
    const [department] = React.useState<string>("UKPBJ")

    // Password strength
    const passwordStrength = React.useMemo(() => {
        if (!password) return { score: 0, label: "", color: "" }
        let score = 0
        if (password.length >= 6) score++
        if (password.length >= 8) score++
        if (/[A-Z]/.test(password)) score++
        if (/[0-9]/.test(password)) score++
        if (/[^A-Za-z0-9]/.test(password)) score++

        if (score <= 1) return { score, label: "Lemah", color: "bg-red-500" }
        if (score <= 2) return { score, label: "Cukup", color: "bg-amber-500" }
        if (score <= 3) return { score, label: "Bagus", color: "bg-blue-500" }
        return { score, label: "Kuat", color: "bg-green-500" }
    }, [password])

    const passwordsMatch = password && confirmPassword && password === confirmPassword

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        // Validation
        if (!email || !password || !confirmPassword || !fullName || !position || !department) {
            setError("Semua field wajib diisi")
            setIsLoading(false)
            return
        }

        if (password.length < 6) {
            setError("Password minimal 6 karakter")
            setIsLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setError("Password tidak cocok")
            setIsLoading(false)
            return
        }

        const supabase = createClient()

        // Sign up with Supabase Auth - include profile data in user metadata
        // This will trigger the handle_new_user function in the database
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    position: position,
                    department: department,
                    role: 'staff',
                }
            }
        })

        if (signUpError) {
            setError(signUpError.message)
            setIsLoading(false)
            return
        }

        if (authData.user) {
            // Success - show confirmation message
            setSuccess(true)
        }

        setIsLoading(false)
    }

    if (success) {
        return (
            <div className={cn("grid gap-6", className)} {...props}>
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-in zoom-in duration-300">
                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
                            Pendaftaran Berhasil!
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-[280px]">
                            Silakan cek email Anda untuk mengkonfirmasi akun sebelum masuk.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.push("/login")}
                        className="mt-2"
                    >
                        Kembali ke Halaman Login
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <form onSubmit={onSubmit}>
                <div className="grid gap-4">
                    {/* Email */}
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                            Email
                        </Label>
                        <Input
                            id="email"
                            placeholder="nama@google.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isLoading}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Password */}
                    <div className="grid gap-2">
                        <Label htmlFor="password" className="text-sm font-medium">
                            Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                placeholder="Minimal 6 karakter"
                                type={showPassword ? "text" : "password"}
                                autoCapitalize="none"
                                autoComplete="new-password"
                                autoCorrect="off"
                                disabled={isLoading}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {/* Password Strength Indicator */}
                        {password && (
                            <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <div
                                            key={level}
                                            className={cn(
                                                "h-1 flex-1 rounded-full transition-all duration-300",
                                                level <= passwordStrength.score ? passwordStrength.color : "bg-muted"
                                            )}
                                        />
                                    ))}
                                </div>
                                <p className={cn("text-xs", passwordStrength.color.replace("bg-", "text-"))}>
                                    Kekuatan Password: {passwordStrength.label}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium">
                            Konfirmasi Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                placeholder="Ulangi password"
                                type={showConfirmPassword ? "text" : "password"}
                                autoCapitalize="none"
                                autoComplete="new-password"
                                autoCorrect="off"
                                disabled={isLoading}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={cn(
                                    "pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                                    confirmPassword && (passwordsMatch ? "border-green-500 focus:border-green-500" : "border-red-500 focus:border-red-500")
                                )}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {confirmPassword && (
                            <div className={cn(
                                "flex items-center gap-1 text-xs animate-in slide-in-from-top-2 duration-200",
                                passwordsMatch ? "text-green-600" : "text-red-500"
                            )}>
                                {passwordsMatch ? (
                                    <>
                                        <CheckCircle2 className="h-3 w-3" />
                                        <span>Password cocok</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-3 w-3" />
                                        <span>Password tidak cocok</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-muted" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Data Profil
                            </span>
                        </div>
                    </div>

                    {/* Full Name */}
                    <div className="grid gap-2">
                        <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            Nama Lengkap
                        </Label>
                        <Input
                            id="fullName"
                            placeholder="Masukkan nama lengkap"
                            type="text"
                            autoCapitalize="words"
                            autoComplete="name"
                            disabled={isLoading}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Position */}
                    <div className="grid gap-2">
                        <Label htmlFor="position" className="text-sm font-medium flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            Jabatan
                        </Label>
                        <Input
                            id="position"
                            placeholder="Input sesuai nama jabatan"
                            type="text"
                            disabled={isLoading}
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Department */}
                    <div className="grid gap-2">
                        <Label htmlFor="department" className="text-sm font-medium flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            Departemen
                        </Label>
                        <Input
                            id="department"
                            type="text"
                            disabled
                            readOnly
                            value={department}
                            className="transition-all duration-200 bg-muted/50 cursor-not-allowed"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg animate-in shake duration-300">
                            <XCircle className="h-4 w-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        disabled={isLoading}
                        className="w-full mt-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        size="lg"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Mendaftarkan...
                            </>
                        ) : (
                            "Daftar Sekarang"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
