"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OverallChart } from "@/components/dashboard/overall-chart"
import { IndividualChart } from "@/components/dashboard/individual-chart"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, User, Activity, FileCheck, Loader2, FileText } from "lucide-react"
import { AspectBarChart } from "@/components/dashboard/aspect-bar-chart"


export default function AdminDashboardPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [stats, setStats] = useState({
        totalStaff: 0,
        totalAssessments: 0,
        averageScore: 0,
        participationRate: 0,
        topEvaluator: { name: '-', count: 0 }
    })
    const [chartData, setChartData] = useState<{ name: string; total: number }[]>([])


    // Individual Report State
    const [staffList, setStaffList] = useState<{ id: string, full_name: string }[]>([])
    const [selectedStaffId, setSelectedStaffId] = useState<string>("")
    const [individualChartData, setIndividualChartData] = useState<any[]>([])
    const [individualStats, setIndividualStats] = useState<{ strong: string[], weak: string[] }>({ strong: [], weak: [] })
    const [feedbackList, setFeedbackList] = useState<{ id: string, aspect: string, comment: string, created_at: string, rating: number }[]>([])
    const [isLoadingIndividual, setIsLoadingIndividual] = useState(false)

    // Month Selection State
    const [monthOptions, setMonthOptions] = useState<{ value: string, label: string }[]>([])
    const [selectedMonth, setSelectedMonth] = useState<string>("")

    useEffect(() => {
        // Generate last 12 months
        const options = []
        const today = new Date()
        for (let i = 0; i < 12; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
            const value = d.toISOString().split('T')[0] // YYYY-MM-DD
            const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
            options.push({ value, label })
        }
        setMonthOptions(options)
        setSelectedMonth(options[0].value)
    }, [])


    useEffect(() => {
        if (!selectedMonth) return

        async function fetchAdminData() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push("/login")
                return
            }

            // Check Auth
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (error || profile?.role !== 'admin') {
                router.push("/dashboard/staff")
                return
            }

            setIsAuthorized(true)

            // 1. Total Staff (role='staff')
            const { count: staffCount, data: staffData } = await supabase
                .from('profiles')
                .select('id, full_name', { count: 'exact' })
                .eq('role', 'staff')

            if (staffData) {
                setStaffList(staffData)
            }

            const totalStaff = staffCount || 0

            // 2. Total Assessments (status='completed')
            const { count: assessmentCount } = await supabase
                .from('assessments')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'completed')
                .eq('assessment_month', selectedMonth) // Filter by Month

            const totalCompleted = assessmentCount || 0

            // 3. Average Score & Chart Data & Distribution
            // Fetch all scores with assessment info, strictly filtering for COMPLETED assessments and MONTH
            const { data: scores } = await supabase
                .from('assessment_scores')
                .select(`
                    rating,
                    aspect,
                    assessments!inner (
                        evaluatee_id,
                        status,
                        assessment_month
                    )
                `)
                .eq('assessments.status', 'completed')
                .eq('assessments.assessment_month', selectedMonth)

            let avgScore = 0
            const aspectScores: Record<string, { total: number, count: number }> = {}


            if (scores && scores.length > 0) {
                const totalRating = scores.reduce((acc, curr) => acc + (curr.rating * 20), 0)
                avgScore = totalRating / scores.length

                scores.forEach((s: any) => {
                    // Aspect stats (Overall Chart)
                    if (!aspectScores[s.aspect]) {
                        aspectScores[s.aspect] = { total: 0, count: 0 }
                    }
                    aspectScores[s.aspect].total += (s.rating * 20)
                    aspectScores[s.aspect].count += 1

                    if (!aspectScores[s.aspect]) {
                        aspectScores[s.aspect] = { total: 0, count: 0 }
                    }
                    aspectScores[s.aspect].total += (s.rating * 20)
                    aspectScores[s.aspect].count += 1
                })
            }

            // Format Overall Chart Data
            const formattedChartData = [
                "berorientasi-pelayanan", "akuntabel", "kompeten", "harmonis", "loyal", "adaptif", "kolaboratif"
            ].map(key => {
                const stats = aspectScores[key]
                const label = key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                    .replace("Berorientasi Pelayanan", "Pelayanan")

                return {
                    name: label,
                    total: stats ? Math.round(stats.total / stats.count) : 0
                }
            })
            setChartData(formattedChartData)

            setChartData(formattedChartData)


            // 4. Progress / Participation
            const expectedAssessments = totalStaff > 1 ? totalStaff * (totalStaff - 1) : 0
            const progressPercentage = expectedAssessments > 0 ? Math.round((totalCompleted / expectedAssessments) * 100) : 0

            // Top Evaluator logic
            const { data: completedAssessments } = await supabase
                .from('assessments')
                .select('evaluator_id')
                .eq('status', 'completed')
                .eq('assessment_month', selectedMonth)

            const evaluatorCounts: Record<string, number> = {}
            completedAssessments?.forEach(a => {
                evaluatorCounts[a.evaluator_id] = (evaluatorCounts[a.evaluator_id] || 0) + 1
            })

            let topEvaluatorId = ''
            let maxCount = 0
            for (const [id, count] of Object.entries(evaluatorCounts)) {
                if (count > maxCount) {
                    maxCount = count
                    topEvaluatorId = id
                }
            }

            let topEvaluatorName = '-'
            if (topEvaluatorId) {
                const { data: topUserData } = await supabase.from('profiles').select('full_name').eq('id', topEvaluatorId).single()
                if (topUserData) topEvaluatorName = topUserData.full_name
            }

            setStats({
                totalStaff: totalStaff,
                totalAssessments: totalCompleted,
                averageScore: parseFloat(avgScore.toFixed(1)),
                participationRate: progressPercentage,
                topEvaluator: { name: topEvaluatorName, count: maxCount }
            })

            setIsLoading(false)
        }

        fetchAdminData()
    }, [router, selectedMonth])

    useEffect(() => {
        if (!selectedStaffId || !selectedMonth) return

        async function fetchIndividualData() {
            setIsLoadingIndividual(true)
            const supabase = createClient()

            // Fetch scores where this person is the EVALUATEE
            const { data: assessments } = await supabase
                .from('assessments')
                .select('id')
                .eq('evaluatee_id', selectedStaffId)
                .eq('status', 'completed')
                .eq('assessment_month', selectedMonth)

            const assessmentIds = assessments?.map(a => a.id) || []

            if (assessmentIds.length === 0) {
                setIndividualChartData([])
                setIndividualStats({ strong: [], weak: [] })
                setFeedbackList([])
                setIsLoadingIndividual(false)
                return
            }

            const { data: scores } = await supabase
                .from('assessment_scores')
                .select('id, aspect, rating, comment, created_at')
                .in('assessment_id', assessmentIds)
                .order('created_at', { ascending: false })

            const aspectScores: Record<string, { total: number, count: number }> = {}
            const commentsList: { id: string, aspect: string, comment: string, created_at: string, rating: number }[] = []

            if (scores) {
                scores.forEach(s => {
                    // Chart Data Accumulation
                    if (!aspectScores[s.aspect]) {
                        aspectScores[s.aspect] = { total: 0, count: 0 }
                    }
                    aspectScores[s.aspect].total += (s.rating * 20)
                    aspectScores[s.aspect].count += 1

                    // Comment Accumulation
                    if (s.comment && s.comment.trim() !== '') {
                        commentsList.push({
                            id: s.id,
                            aspect: s.aspect,
                            comment: s.comment,
                            created_at: s.created_at,
                            rating: s.rating
                        })
                    }
                })
            }

            const chartData = [
                "berorientasi-pelayanan", "akuntabel", "kompeten", "harmonis", "loyal", "adaptif", "kolaboratif"
            ].map(key => {
                const stats = aspectScores[key]
                const label = key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                    .replace("Berorientasi Pelayanan", "Pelayanan")

                const score = stats ? Math.round(stats.total / stats.count) : 0
                return {
                    subject: label,
                    A: score,
                    fullMark: 100
                }
            })

            // Determine strong/weak
            const sorted = [...chartData].sort((a, b) => b.A - a.A)
            const strong = sorted.filter(s => s.A >= 85).slice(0, 2).map(s => s.subject)
            const weak = sorted.filter(s => s.A < 75).slice(0, 2).map(s => s.subject)

            setIndividualChartData(chartData)
            setIndividualStats({ strong, weak })
            setFeedbackList(commentsList)
            setIsLoadingIndividual(false)
        }

        fetchIndividualData()
    }, [selectedStaffId, selectedMonth])


    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!isAuthorized) {
        return null
    }

    return (
        <div className="flex-1 space-y-6">
            {/* Header with gradient accent */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Monitor dan kelola penilaian kinerja pegawai</p>
                </div>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[200px] border-muted bg-background">
                        <SelectValue placeholder="Pilih Bulan" />
                    </SelectTrigger>
                    <SelectContent>
                        {monthOptions.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                                {month.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                {/* Modern tab list with Linear styling */}
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="overview" className="data-[state=active]:sidebar-gradient data-[state=active]:text-white">
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="individual" className="data-[state=active]:sidebar-gradient data-[state=active]:text-white">
                        Individual Report
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Stat Cards with gradient hover effects */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="gradient-border card-hover border-muted">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Pegawai
                                </CardTitle>
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Users className="h-4 w-4 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold tracking-tight">{stats.totalStaff}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Pegawai terdaftar
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="gradient-border card-hover border-muted">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Progress Penilaian
                                </CardTitle>
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Activity className="h-4 w-4 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold tracking-tight">{stats.participationRate}%</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stats.totalAssessments} penilaian selesai
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="gradient-border card-hover border-muted">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle>
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <FileCheck className="h-4 w-4 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold tracking-tight">{stats.averageScore}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Dari seluruh aspek BerAKHLAK
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="gradient-border card-hover border-muted">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Penilai Teraktif</CardTitle>
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <User className="h-4 w-4 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold tracking-tight truncate" title={stats.topEvaluator.name}>
                                    {stats.topEvaluator.name}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Menilai {stats.topEvaluator.count} pegawai
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chart Section with enhanced styling */}
                    <Card className="border-muted">
                        <CardHeader>
                            <CardTitle className="text-xl">Rata-rata Nilai BerAKHLAK</CardTitle>
                            <CardDescription>
                                Perbandingan nilai rata-rata seluruh pegawai di setiap aspek
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <OverallChart data={chartData} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="individual" className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                            <SelectTrigger className="w-[320px] border-muted">
                                <SelectValue placeholder="Pilih Pegawai" />
                            </SelectTrigger>
                            <SelectContent>
                                {staffList.map((staff) => (
                                    <SelectItem key={staff.id} value={staff.id}>
                                        {staff.full_name || "Tanpa Nama"}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedStaffId ? (
                        <div className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                                <Card className="col-span-4 border-muted">
                                    <CardHeader>
                                        <CardTitle className="text-xl">Profil Kompetensi (Radar)</CardTitle>
                                        <CardDescription>
                                            Visualisasi detail nilai BerAKHLAK untuk pegawai terpilih
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pl-2">
                                        {isLoadingIndividual ? (
                                            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
                                        ) : individualChartData.length > 0 ? (
                                            <IndividualChart data={individualChartData} />
                                        ) : (
                                            <div className="text-center py-12 text-muted-foreground">Belum ada penilaian untuk pegawai ini.</div>
                                        )}
                                    </CardContent>
                                </Card>
                                <Card className="col-span-3 border-muted">
                                    <CardHeader>
                                        <CardTitle className="text-xl">Detail Nilai Per Aspek</CardTitle>
                                        <CardDescription>
                                            Rincian nilai rata-rata untuk setiap aspek BerAKHLAK
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {isLoadingIndividual ? (
                                            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
                                        ) : (
                                            <AspectBarChart data={individualChartData} />
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Enhanced Feedback Section */}
                            <Card className="border-muted">
                                <CardHeader>
                                    <CardTitle className="text-xl">Masukan & Saran (Anonim)</CardTitle>
                                    <CardDescription>
                                        Kumpulan komentar dan saran yang diberikan oleh rekan kerja. Identitas penilai dirahasiakan.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {isLoadingIndividual ? (
                                        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
                                    ) : feedbackList.length > 0 ? (
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {feedbackList.map((item) => (
                                                <div key={item.id} className="p-4 rounded-lg bg-muted/40 border border-muted hover:border-primary/30 transition-colors">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md sidebar-gradient text-white uppercase tracking-wide">
                                                            {item.aspect.replace(/-/g, ' ')}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm leading-relaxed text-foreground/90 italic">
                                                        "{item.comment}"
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-6">Tidak ada komentar atau masukan tambahan.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">Silahkan pilih pegawai terlebih dahulu.</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div >
    )
}
