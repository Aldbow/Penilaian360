"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OverallChart } from "@/components/dashboard/overall-chart"
import { IndividualChart } from "@/components/dashboard/individual-chart"
import { TrendLineChart } from "@/components/dashboard/trend-line-chart"
import { CompletionDonutChart } from "@/components/dashboard/completion-donut-chart"
import { ScoreDistributionChart } from "@/components/dashboard/score-distribution-chart"
import { TopBottomPerformers } from "@/components/dashboard/top-bottom-performers"
import { AspectTrendChart } from "@/components/dashboard/aspect-trend-chart"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, User, Activity, FileCheck, Loader2, FileText, AlertCircle, TrendingUp, PieChart, BarChart3 } from "lucide-react"
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
    // New State for Evaluator Progress
    const [evaluatorStats, setEvaluatorStats] = useState<{ id: string, name: string, completed: number, target: number }[]>([])

    // NEW CHART STATES
    const [trendData, setTrendData] = useState<{ month: string; assessments: number; avgScore: number }[]>([])
    const [completionData, setCompletionData] = useState<{ name: string; value: number; color: string }[]>([])
    const [distributionData, setDistributionData] = useState<{ range: string; count: number; percentage: number }[]>([])
    const [topBottomData, setTopBottomData] = useState<{ top: { name: string; score: number }[], bottom: { name: string; score: number }[] }>({ top: [], bottom: [] })
    const [aspectTrendData, setAspectTrendData] = useState<any[]>([])


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
            // Use local date to avoid timezone offset issues
            const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
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

            // 5. Calculate Per-Employee Progress
            if (staffData) {
                const targetPerPerson = Math.max(0, totalStaff - 1) // Exclude self
                const progressData = staffData.map(staff => {
                    const count = evaluatorCounts[staff.id] || 0
                    return {
                        id: staff.id,
                        name: staff.full_name,
                        completed: count,
                        target: targetPerPerson
                    }
                })
                // Sort: Incomplete first, then by name
                progressData.sort((a, b) => {
                    const aPercent = a.target > 0 ? a.completed / a.target : 0
                    const bPercent = b.target > 0 ? b.completed / b.target : 0
                    if (aPercent === bPercent) return a.name.localeCompare(b.name)
                    return aPercent - bPercent
                })
                setEvaluatorStats(progressData)
            }

            // 6. NEW: Completion Donut Chart Data
            const expectedAssessments2 = totalStaff > 1 ? totalStaff * (totalStaff - 1) : 0
            const notStarted = Math.max(0, expectedAssessments2 - totalCompleted)
            setCompletionData([
                { name: 'Selesai', value: totalCompleted, color: '#10b981' },
                { name: 'Belum Mulai', value: notStarted, color: '#ef4444' }
            ])

            // 7. NEW: Score Distribution Data
            if (scores && scores.length > 0) {
                const ranges = { '0-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 }
                scores.forEach((s: any) => {
                    const score = s.rating * 20
                    if (score <= 40) ranges['0-40']++
                    else if (score <= 60) ranges['41-60']++
                    else if (score <= 80) ranges['61-80']++
                    else ranges['81-100']++
                })
                const totalScores = scores.length
                const distData = Object.entries(ranges).map(([range, count]) => ({
                    range,
                    count,
                    percentage: totalScores > 0 ? Math.round((count / totalScores) * 100) : 0
                }))
                setDistributionData(distData)
            } else {
                setDistributionData([
                    { range: '0-40', count: 0, percentage: 0 },
                    { range: '41-60', count: 0, percentage: 0 },
                    { range: '61-80', count: 0, percentage: 0 },
                    { range: '81-100', count: 0, percentage: 0 }
                ])
            }

            // 8. NEW: Top/Bottom Performers Data
            if (staffData && staffData.length > 0) {
                // Calculate average score for each evaluatee
                const evaluateeScores: Record<string, { total: number, count: number }> = {}
                if (scores) {
                    scores.forEach((s: any) => {
                        const evaluateeId = s.assessments?.evaluatee_id
                        if (evaluateeId) {
                            if (!evaluateeScores[evaluateeId]) {
                                evaluateeScores[evaluateeId] = { total: 0, count: 0 }
                            }
                            evaluateeScores[evaluateeId].total += (s.rating * 20)
                            evaluateeScores[evaluateeId].count += 1
                        }
                    })
                }

                const performerData = staffData
                    .map(staff => ({
                        name: staff.full_name,
                        score: evaluateeScores[staff.id]
                            ? Math.round(evaluateeScores[staff.id].total / evaluateeScores[staff.id].count)
                            : 0
                    }))
                    .filter(p => p.score > 0)
                    .sort((a, b) => b.score - a.score)

                setTopBottomData({
                    top: performerData.slice(0, 3),
                    bottom: performerData.slice(-3).reverse()
                })
            }

            // 9. NEW: Trend Data (Last 6 months)
            const trendMonths: { month: string; assessments: number; avgScore: number }[] = []
            const today = new Date()
            for (let i = 5; i >= 0; i--) {
                const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
                const monthValue = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
                const monthLabel = d.toLocaleDateString('id-ID', { month: 'short' })

                // Fetch data for this month
                const { count: monthCount } = await supabase
                    .from('assessments')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'completed')
                    .eq('assessment_month', monthValue)

                const { data: monthScores } = await supabase
                    .from('assessment_scores')
                    .select('rating, assessments!inner(status, assessment_month)')
                    .eq('assessments.status', 'completed')
                    .eq('assessments.assessment_month', monthValue)

                let monthAvg = 0
                if (monthScores && monthScores.length > 0) {
                    const totalRating = monthScores.reduce((acc, curr) => acc + (curr.rating * 20), 0)
                    monthAvg = Math.round(totalRating / monthScores.length)
                }

                trendMonths.push({
                    month: monthLabel,
                    assessments: monthCount || 0,
                    avgScore: monthAvg
                })
            }
            setTrendData(trendMonths)

            // 10. NEW: Aspect Trend Data (simplified - using current month's data)
            // For now, we'll show just the current breakdown
            setAspectTrendData([])

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
                    <TabsTrigger value="status" className="data-[state=active]:sidebar-gradient data-[state=active]:text-white">
                        Status Penilaian
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

                    {/* NEW: Trend Line Chart - Monthly Assessment Trends */}
                    <Card className="border-muted">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <TrendingUp className="h-4 w-4 text-blue-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Tren Penilaian 6 Bulan Terakhir</CardTitle>
                                    <CardDescription>
                                        Jumlah penilaian selesai dan rata-rata skor per bulan
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {trendData.length > 0 ? (
                                <TrendLineChart data={trendData} />
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    Memuat data tren...
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* NEW: Two-column grid for Completion and Distribution */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Completion Donut Chart */}
                        <Card className="border-muted">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                        <PieChart className="h-4 w-4 text-emerald-500" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Status Penyelesaian</CardTitle>
                                        <CardDescription>
                                            Rasio penilaian yang sudah selesai
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {completionData.length > 0 ? (
                                    <CompletionDonutChart
                                        data={completionData}
                                        total={stats.totalStaff > 1 ? stats.totalStaff * (stats.totalStaff - 1) : 0}
                                    />
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        Belum ada data
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Score Distribution Chart */}
                        <Card className="border-muted">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                        <BarChart3 className="h-4 w-4 text-amber-500" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Distribusi Nilai</CardTitle>
                                        <CardDescription>
                                            Sebaran nilai penilaian berdasarkan rentang
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {distributionData.length > 0 ? (
                                    <ScoreDistributionChart data={distributionData} />
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        Belum ada data distribusi
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* NEW: Top/Bottom Performers */}
                    <Card className="border-muted">
                        <CardHeader>
                            <CardTitle className="text-xl">Ranking Performa Pegawai</CardTitle>
                            <CardDescription>
                                Perbandingan pegawai dengan performa tertinggi dan yang perlu pengembangan berdasarkan rata-rata nilai yang diterima
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TopBottomPerformers
                                topPerformers={topBottomData.top}
                                bottomPerformers={topBottomData.bottom}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="status" className="space-y-6">
                    {/* Existing Status Table */}
                    <Card className="border-muted">
                        <CardHeader>
                            <CardTitle className="text-xl">Status Penilaian Pegawai</CardTitle>
                            <CardDescription>
                                Memantau kelengkapan penilaian yang dilakukan oleh setiap pegawai (Target: {stats.totalStaff > 0 ? stats.totalStaff - 1 : 0} rekan)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border border-muted">
                                <div className="grid grid-cols-12 gap-4 border-b border-muted bg-muted/50 p-4 text-sm font-medium">
                                    <div className="col-span-4">Nama Pegawai</div>
                                    <div className="col-span-6 text-center">Progress</div>
                                    <div className="col-span-2 text-center">Status</div>
                                </div>
                                <div className="divide-y divide-muted">
                                    {evaluatorStats.map((staff) => {
                                        const percentage = staff.target > 0 ? Math.round((staff.completed / staff.target) * 100) : 100
                                        const isComplete = staff.completed >= staff.target
                                        const isInProgres = staff.completed > 0 && !isComplete

                                        return (
                                            <div key={staff.id} className="grid grid-cols-12 gap-4 p-4 text-sm items-center hover:bg-muted/30 transition-colors">
                                                <div className="col-span-4 font-medium">{staff.name}</div>
                                                <div className="col-span-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${isComplete ? "bg-green-500" : isInProgres ? "bg-amber-500" : "bg-red-500"
                                                                    }`}
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-muted-foreground w-12 text-right">
                                                            {staff.completed} / {staff.target}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="col-span-2 text-center">
                                                    {isComplete ? (
                                                        <span className="inline-flex items-center rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-medium text-green-600">
                                                            Selesai
                                                        </span>
                                                    ) : isInProgres ? (
                                                        <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-600">
                                                            Proses
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-600">
                                                            Belum
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
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
