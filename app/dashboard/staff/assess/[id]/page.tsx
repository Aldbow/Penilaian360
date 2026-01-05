"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StarRating } from "@/components/ui/star-rating"
import { ChevronLeft, Loader2 } from "lucide-react"
import Link from "next/link"

import { Separator } from "@/components/ui/separator"
import { ChevronDown } from "lucide-react"

// I'll stick to a simple alert for now to avoid dependency issues if toast isn't set up yet.
// Or I can add a simple state for success.

const aspects = [
    {
        id: "berorientasi-pelayanan",
        title: "Berorientasi Pelayanan",
        description: "1. Memahami dan memenuhi kebutuhan masyarakat.\n\n2. Ramah, cekatan, solutif, dan dapat diandalkan.\n\n3. Melakukan perbaikan tiada henti.",
        indicators: {
            5: "Pegawai secara konsisten memberikan pelayanan yang luar biasa, proaktif mengidentifikasi dan memenuhi kebutuhan masyarakat, serta selalu mencari cara inovatif untuk meningkatkan kualitas layanan.",
            4: "Pegawai memberikan pelayanan dengan baik, responsif terhadap kebutuhan masyarakat, dan aktif melakukan perbaikan berdasarkan masukan yang diterima.",
            3: "Pegawai memberikan pelayanan sesuai standar, memahami kebutuhan dasar masyarakat, dan melakukan perbaikan ketika diminta.",
            2: "Pegawai memberikan pelayanan minimal, kurang responsif terhadap kebutuhan masyarakat, dan jarang melakukan inisiatif perbaikan.",
            1: "Pegawai tidak memberikan pelayanan yang memadai, tidak memahami kebutuhan masyarakat, dan tidak menunjukkan upaya perbaikan.",
        },
    },
    {
        id: "akuntabel",
        title: "Akuntabel",
        description: "1. Melaksanakan tugas dengan jujur dan bertanggung jawab cermat disiplin dan berintegritas tinggi.\n\n2. Menggunakan kekayaan dan BMN secara bertanggung jawab efektif dan efisien.\n\n3. Tidak menyalahgunakan kewenangan jabatan.",
        indicators: {
            5: "Pegawai menunjukkan integritas dan akuntabilitas tertinggi, selalu bertanggung jawab penuh atas tugas dan keputusan, mengelola sumber daya dengan sangat efisien, dan menjadi teladan dalam penggunaan wewenang.",
            4: "Pegawai melaksanakan tugas dengan jujur dan bertanggung jawab, mengelola sumber daya dengan baik, dan menggunakan kewenangan sesuai aturan yang berlaku.",
            3: "Pegawai melaksanakan tugas sesuai prosedur, cukup bertanggung jawab dalam pengelolaan sumber daya, dan tidak menyalahgunakan wewenang.",
            2: "Pegawai kadang kurang cermat dalam melaksanakan tugas, pengelolaan sumber daya kurang optimal, dan perlu pengawasan dalam penggunaan wewenang.",
            1: "Pegawai tidak menunjukkan tanggung jawab yang memadai, lalai dalam pengelolaan sumber daya, atau ada indikasi penyalahgunaan wewenang.",
        },
    },
    {
        id: "kompeten",
        title: "Kompeten",
        description: "1. Meningkatkan kompetensi diri untuk menjawab tantangan yang selalu berubah.\n\n2. Membantu orang lain belajar.\n\n3. Melaksanakan tugas dengan kualitas terbaik.",
        indicators: {
            5: "Pegawai secara proaktif mengembangkan kompetensi diri, menjadi mentor yang efektif bagi rekan kerja, dan konsisten menghasilkan pekerjaan berkualitas tinggi yang melebihi ekspektasi.",
            4: "Pegawai aktif meningkatkan kompetensi, bersedia membantu rekan kerja belajar, dan melaksanakan tugas dengan kualitas yang baik.",
            3: "Pegawai mengikuti pelatihan yang diwajibkan, sesekali membantu rekan kerja, dan melaksanakan tugas sesuai standar yang ditetapkan.",
            2: "Pegawai kurang inisiatif dalam pengembangan diri, jarang membantu rekan kerja, dan kualitas pekerjaan kadang di bawah standar.",
            1: "Pegawai tidak menunjukkan upaya pengembangan kompetensi, tidak membantu rekan kerja, dan kualitas pekerjaan tidak memenuhi standar.",
        },
    },
    {
        id: "harmonis",
        title: "Harmonis",
        description: "1. Menghargai setiap orang apapun latar belakangnya.\n\n2. Suka menolong orang lain.\n\n3. Membangun lingkungan kerja yang kondusif.",
        indicators: {
            5: "Pegawai sangat menghargai keberagaman, aktif membantu rekan kerja tanpa diminta, dan menjadi agen positif dalam menciptakan lingkungan kerja yang harmonis dan inklusif.",
            4: "Pegawai menghargai perbedaan, sering membantu rekan kerja, dan berkontribusi positif terhadap lingkungan kerja yang kondusif.",
            3: "Pegawai menghormati rekan kerja dari berbagai latar belakang, bersedia membantu ketika diminta, dan menjaga hubungan kerja yang baik.",
            2: "Pegawai kurang menunjukkan apresiasi terhadap keberagaman, jarang membantu rekan kerja, dan kontribusi terhadap harmoni lingkungan kerja minimal.",
            1: "Pegawai tidak menghargai perbedaan, tidak membantu rekan kerja, atau bahkan mengganggu harmoni lingkungan kerja.",
        },
    },
    {
        id: "loyal",
        title: "Loyal",
        description: "1. Memegang teguh ideologi Pancasila, Undang-Undang Dasar Negara Republik Indonesia Tahun 1945, setia pada NKRI serta pemerintahan yang sah.\n\n2. Menjaga nama baik sesama ASN, Pimpinan, Instansi dan Negara.\n\n3. Menjaga rahasia jabatan dan negara.",
        indicators: {
            5: "Pegawai menunjukkan loyalitas tertinggi terhadap NKRI dan Pancasila, selalu menjaga nama baik instansi dengan integritas penuh, dan sangat dapat dipercaya dalam menjaga kerahasiaan.",
            4: "Pegawai loyal terhadap negara dan instansi, menjaga nama baik organisasi, dan dapat dipercaya dalam menjaga informasi rahasia.",
            3: "Pegawai menunjukkan loyalitas dasar terhadap negara dan instansi, cukup menjaga nama baik, dan memahami pentingnya kerahasiaan.",
            2: "Pegawai kurang menunjukkan loyalitas, kadang kurang hati-hati dalam menjaga nama baik instansi, atau kurang teliti dalam menjaga kerahasiaan.",
            1: "Pegawai tidak menunjukkan loyalitas yang memadai, merusak nama baik instansi, atau melanggar kerahasiaan jabatan.",
        },
    },
    {
        id: "adaptif",
        title: "Adaptif",
        description: "1. Cepat menyesuaikan diri menghadapi perubahan.\n\n2. Terus berinovasi dan mengembangkan kreativitas.\n\n3. Bertindak proaktif.",
        indicators: {
            5: "Pegawai sangat adaptif terhadap perubahan, menjadi pelopor inovasi, dan selalu proaktif dalam mengantisipasi dan merespons tantangan baru.",
            4: "Pegawai cepat beradaptasi dengan perubahan, aktif berinovasi, dan sering bertindak proaktif dalam menghadapi situasi baru.",
            3: "Pegawai dapat menyesuaikan diri dengan perubahan, sesekali memberikan ide inovatif, dan bertindak proaktif ketika diperlukan.",
            2: "Pegawai lambat beradaptasi dengan perubahan, jarang berinovasi, dan cenderung reaktif daripada proaktif.",
            1: "Pegawai menolak perubahan, tidak menunjukkan kreativitas atau inovasi, dan selalu reaktif terhadap situasi.",
        },
    },
    {
        id: "kolaboratif",
        title: "Kolaboratif",
        description: "1. Memberi kesempatan kepada berbagai pihak untuk berkontribusi.\n\n2. Terbuka dalam bekerja sama untuk menghasilkan nilai tambah.\n\n3. Menggerakkan pemanfaatan berbagai sumber daya untuk tujuan bersama.",
        indicators: {
            5: "Pegawai sangat kolaboratif, aktif melibatkan berbagai pihak, terbuka terhadap ide-ide baru, dan efektif mengkoordinasikan sumber daya untuk mencapai tujuan bersama dengan hasil optimal.",
            4: "Pegawai kolaboratif, memberi kesempatan kepada rekan untuk berkontribusi, terbuka dalam bekerja sama, dan baik dalam mengelola sumber daya tim.",
            3: "Pegawai bersedia bekerja sama, cukup terbuka terhadap kontribusi orang lain, dan dapat berkolaborasi dalam memanfaatkan sumber daya.",
            2: "Pegawai kurang kolaboratif, jarang melibatkan orang lain, kurang terbuka terhadap masukan, dan lemah dalam koordinasi sumber daya.",
            1: "Pegawai tidak kolaboratif, bekerja sendiri, menolak kontribusi orang lain, dan tidak efektif dalam memanfaatkan sumber daya bersama.",
        },
    },
]

export default function AssessmentPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params)
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(true)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [ratings, setRatings] = React.useState<Record<string, number>>({})
    const [comments, setComments] = React.useState<Record<string, string>>({})
    const [employee, setEmployee] = React.useState<any>(null)
    const [expandedIndicators, setExpandedIndicators] = React.useState<Record<string, boolean>>({})

    React.useEffect(() => {
        const fetchEmployee = async () => {
            console.log("Fetching profile for ID:", resolvedParams.id)

            const supabase = createClient()
            const { data, error } = await supabase
                .from("profiles")
                .select("full_name, position")
                .eq("id", resolvedParams.id)
                .single()

            if (error) {
                console.error("Error fetching employee details:", JSON.stringify(error, null, 2))
                console.error("Params ID used:", resolvedParams.id)
            } else {
                setEmployee(data)
            }
            setIsLoading(false)
        }
        fetchEmployee()
    }, [resolvedParams.id])

    const handleRatingChange = (aspectId: string, value: number) => {
        setRatings((prev) => ({ ...prev, [aspectId]: value }))
    }

    const handleCommentChange = (aspectId: string, value: string) => {
        setComments((prev) => ({ ...prev, [aspectId]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Validate all ratings filled
        const allRated = aspects.every((aspect) => ratings[aspect.id])
        if (!allRated) {
            alert("Mohon lengkapi semua penilaian.")
            setIsSubmitting(false)
            return
        }

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            alert("Sesi anda berakhir. Silahkan login kembali.")
            router.push("/login")
            return
        }

        // 1. Ensure Assessment Record Exists (Upsert)
        // We use upsert to create if not exists, or get existing if it was pending
        const now = new Date()
        // Use local date to avoid timezone offset issues
        const assessmentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

        const { data: assessment, error: assessmentError } = await supabase
            .from("assessments")
            .upsert({
                evaluator_id: user.id,
                evaluatee_id: resolvedParams.id,
                status: 'completed',
                updated_at: now.toISOString(),
                assessment_month: assessmentMonth
            }, { onConflict: 'evaluator_id, evaluatee_id, assessment_month' })
            .select()
            .single()

        if (assessmentError) {
            console.error("Error creating assessment:", assessmentError)
            alert("Gagal menyimpan data penilaian.")
            setIsSubmitting(false)
            return
        }

        // 2. Insert Scores
        // Prepare rows
        const scoreRows = aspects.map(aspect => ({
            assessment_id: assessment.id,
            aspect: aspect.id,
            rating: ratings[aspect.id],
            comment: comments[aspect.id] || ""
        }))

        const { error: scoresError } = await supabase
            .from("assessment_scores")
            .insert(scoreRows)

        if (scoresError) {
            console.error("Error saving scores:", scoresError)
            alert("Gagal menyimpan skor detil.")
            setIsSubmitting(false)
            return
        }

        router.push("/dashboard/staff")
        setIsSubmitting(false)
    }

    if (isLoading) {
        return <div className="p-8 text-center">Memuat data pegawai...</div>
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:p-8 max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/staff">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="font-heading text-2xl md:text-3xl">Penilaian Pegawai</h1>
                    <p className="text-muted-foreground">
                        Menilai: <span className="font-semibold text-foreground">{employee?.full_name || "Nama tidak ditemukan"}</span>
                        {employee?.position && <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">{employee.position}</span>}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {aspects.map((aspect, index) => (
                    <Card key={aspect.id} className="border-l-4 border-l-primary">
                        <CardHeader>
                            <CardTitle className="text-xl flex justify-between items-center">
                                <span>{index + 1}. {aspect.title}</span>
                                {ratings[aspect.id] ? (
                                    <span className="text-sm font-normal text-muted-foreground bg-secondary px-2 py-1 rounded">
                                        Skor: {ratings[aspect.id] * 20}
                                    </span>
                                ) : null}
                            </CardTitle>
                            <CardDescription className="text-base whitespace-pre-line">{aspect.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Rating Indicators - Collapsible with Animation */}
                            <div className="border border-border/50 rounded-lg overflow-hidden bg-muted/30">
                                <button
                                    type="button"
                                    onClick={() => setExpandedIndicators(prev => ({
                                        ...prev,
                                        [aspect.id]: !prev[aspect.id]
                                    }))}
                                    className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-foreground">
                                            📋 Panduan Indikator Penilaian
                                        </span>
                                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                            Klik untuk {expandedIndicators[aspect.id] ? 'sembunyikan' : 'lihat detail'}
                                        </span>
                                    </div>
                                    <motion.div
                                        animate={{ rotate: expandedIndicators[aspect.id] ? 180 : 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    </motion.div>
                                </button>

                                <AnimatePresence initial={false}>
                                    {expandedIndicators[aspect.id] && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{
                                                duration: 0.3,
                                                ease: [0.04, 0.62, 0.23, 0.98]
                                            }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4 pt-2 space-y-3 border-t border-border/50 bg-background/50">
                                                {[5, 4, 3, 2, 1].map((star, index) => (
                                                    <motion.div
                                                        key={star}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{
                                                            delay: index * 0.05,
                                                            duration: 0.3
                                                        }}
                                                        className="flex gap-3 p-3 rounded-md bg-muted/40 hover:bg-muted/60 transition-colors"
                                                    >
                                                        <div className="flex-shrink-0 w-24">
                                                            <div className="flex items-center justify-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20 h-full">
                                                                <span className="text-base leading-none">{"⭐".repeat(star)}</span>
                                                                <span className="text-xs font-bold text-primary leading-none">
                                                                    {star}/5
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0 flex items-center">
                                                            <p className="text-sm text-foreground/90 leading-relaxed">
                                                                {aspect.indicators[star as keyof typeof aspect.indicators]}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.3 }}
                                                    className="pt-2 border-t border-border/30"
                                                >
                                                    <p className="text-xs text-muted-foreground italic text-center">
                                                        💡 Gunakan panduan ini untuk memberikan penilaian yang objektif dan konsisten
                                                    </p>
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="space-y-2">
                                <Label>Berikan Rating</Label>
                                <StarRating
                                    value={ratings[aspect.id] || 0}
                                    onChange={(val) => handleRatingChange(aspect.id, val)}
                                />
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Label htmlFor={`comment-${aspect.id}`}>Komentar (Opsional)</Label>
                                <Textarea
                                    id={`comment-${aspect.id}`}
                                    placeholder={`Tuliskan alasan penilaian anda untuk aspek ${aspect.title}...`}
                                    value={comments[aspect.id] || ""}
                                    onChange={(e) => handleCommentChange(aspect.id, e.target.value)}
                                    className="bg-muted/50 resize-none"
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <div className="flex justify-end gap-4 pb-8">
                    <Link href="/dashboard/staff">
                        <Button variant="outline" type="button">Batal</Button>
                    </Link>
                    <Button type="submit" size="lg" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Kirim Penilaian
                    </Button>
                </div>
            </form>
        </div>
    )
}
