"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { EmployeeCard } from "@/components/dashboard/employee-card"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface Profile {
    id: string
    full_name: string
    position: string
    department: string
    avatar_url: string | null
    role: string
}

interface EmployeeWithStatus extends Profile {
    status: "pending" | "completed"
}

export default function StaffDashboardPage() {
    const router = useRouter()
    const [employees, setEmployees] = useState<EmployeeWithStatus[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            const supabase = createClient()

            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push("/login")
                return
            }

            // 0. CHECK ROLE - If Admin, redirect to Admin Dashboard
            const { data: currentUserProfile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single()

            if (currentUserProfile?.role === 'admin') {
                router.push('/dashboard/admin')
                return
            }

            // Fetch profiles:
            // 1. Exclude current user (.neq('id', user.id))
            // 2. Only show staff (.eq('role', 'staff')) -> Strictly exclude admins
            const { data: profiles, error: profilesError } = await supabase
                .from("profiles")
                .select("*")
                .neq("id", user.id)
                .eq("role", "staff")

            if (profilesError) {
                console.error("Error fetching profiles:", profilesError)
                setIsLoading(false)
                return
            }

            // Fetch my assessments (who I have evaluated)
            const { data: assessments, error: assessmentsError } = await supabase
                .from("assessments")
                .select("evaluatee_id, status")
                .eq("evaluator_id", user.id)

            if (assessmentsError) {
                console.error("Error fetching assessments:", assessmentsError)
            }

            // Map profiles to include status
            const assessmentMap = new Map(assessments?.map((a: any) => [a.evaluatee_id, a.status]))

            const data = (profiles || []).map((profile: any) => ({
                ...profile,
                status: (assessmentMap.get(profile.id) as "pending" | "completed") || "pending"
            }))

            setEmployees(data)
            setIsLoading(false)
        }

        fetchData()
    }, [router])

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-3xl md:text-4xl">Daftar Pegawai</h1>
                    <p className="text-muted-foreground">
                        Silahkan lakukan penilaian kepada seluruh rekan kerja di bawah ini.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {employees.map((employee) => (
                    <EmployeeCard
                        key={employee.id}
                        employee={{
                            id: employee.id,
                            name: employee.full_name || "Tanpa Nama",
                            position: employee.position || "-",
                            department: employee.department || "-",
                            status: employee.status
                        }}
                    />
                ))}
            </div>

            {employees.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    Tidak ada pegawai dengan role Staff yang ditemukan.
                </div>
            )}
        </div>
    )
}
