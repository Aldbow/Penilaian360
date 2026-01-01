"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OverallChart } from "@/components/dashboard/overall-chart"
import { IndividualChart } from "@/components/dashboard/individual-chart"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, User, Activity, FileCheck, Loader2 } from "lucide-react"
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

    useEffect(() => {
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

            const totalCompleted = assessmentCount || 0

            // 3. Average Score & Chart Data & Distribution
            // Fetch all scores with assessment info, strictly filtering for COMPLETED assessments
            const { data: scores } = await supabase
                .from('assessment_scores')
                .select(`
                    rating,
                    aspect,
                    assessments!inner (
                        evaluatee_id,
                        status
                    )
                `)
                .eq('assessments.status', 'completed')

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
    }, [router])

    useEffect(() => {
        if (!selectedStaffId) return

        async function fetchIndividualData() {
            setIsLoadingIndividual(true)
            const supabase = createClient()

            // Fetch scores where this person is the EVALUATEE
            const { data: assessments } = await supabase
                .from('assessments')
                .select('id')
                .eq('evaluatee_id', selectedStaffId)
                .eq('status', 'completed')

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
    }, [selectedStaffId])


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
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>

            </div>
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="individual">Individual Report</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Pegawai
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalStaff}</div>
                                <p className="text-xs text-muted-foreground">
                                    Pegawai terdaftar
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Progress Penilaian
                                </CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.participationRate}%</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.totalAssessments} dari total estimasi penilaian
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle>
                                <FileCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.averageScore}</div>
                                <p className="text-xs text-muted-foreground">
                                    Dari seluruh aspek BerAKHLAK
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Penilai Teraktif</CardTitle>
                                <User className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold truncate" title={stats.topEvaluator.name}>{stats.topEvaluator.name}</div>
                                <p className="text-xs text-muted-foreground">
                                    Menilai {stats.topEvaluator.count} pegawai
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
                        <Card className="col-span-7">
                            <CardHeader>
                                <CardTitle>Rata-rata Nilai BerAKHLAK</CardTitle>
                                <CardDescription>
                                    Perbandingan nilai rata-rata seluruh pegawai di setiap aspek.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <OverallChart data={chartData} />
                            </CardContent>
                        </Card>
                    </div>



                </TabsContent>
                <TabsContent value="individual" className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                            <SelectTrigger className="w-[280px]">
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
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                                <Card className="col-span-4">
                                    <CardHeader>
                                        <CardTitle>Profil Kompetensi (Radar)</CardTitle>
                                        <CardDescription>
                                            Visualisasi detail nilai BerAKHLAK untuk pegawai terpilih.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pl-2">
                                        {isLoadingIndividual ? (
                                            <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
                                        ) : individualChartData.length > 0 ? (
                                            <IndividualChart data={individualChartData} />
                                        ) : (
                                            <div className="text-center py-12 text-muted-foreground">Belum ada penilaian untuk pegawai ini.</div>
                                        )}
                                    </CardContent>
                                </Card>
                                <Card className="col-span-3">
                                    <CardHeader>
                                        <CardTitle>Detail Nilai Per Aspek</CardTitle>
                                        <CardDescription>
                                            Rincian nilai rata-rata untuk setiap aspek BerAKHLAK.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {isLoadingIndividual ? (
                                            <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
                                        ) : (
                                            <AspectBarChart data={individualChartData} />
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                            {/* New Feedback Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Masukan & Saran (Anonim)</CardTitle>
                                    <CardDescription>
                                        Kumpulan komentar dan saran yang diberikan oleh rekan kerja. Identitas penilai dirahasiakan.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {isLoadingIndividual ? (
                                        <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
                                    ) : feedbackList.length > 0 ? (
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {feedbackList.map((item) => (
                                                <div key={item.id} className="p-4 rounded-lg bg-muted/30 border border-muted-foreground/10">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase">
                                                            {item.aspect.replace(/-/g, ' ')}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-foreground/90 italic">
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
                        <div className="text-center py-12 text-muted-foreground">
                            Silahkan pilih pegawai terlebih dahulu.
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div >
    )
}
