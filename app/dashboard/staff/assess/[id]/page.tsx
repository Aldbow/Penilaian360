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
        description: "1. Memahami dan memenuhi kebutuhan masyarakat.\n2. Ramah, cekatan, solutif, dan dapat diandalkan.\n3. Melakukan perbaikan tiada henti.",
        indicators: {
            5: "Mampu memahami kebutuhan masyarakat, kemudian memberikan pelayanan melebihi ekspektasi masyarakat dengan ramah, cekatan, solutif dan dapat diandalkan, serta terus melakukan perbaikan pelayanan.",
            4: "Mampu memahami dan memenuhi kebutuhan masyarakat, serta memberikan pelayanan dengan ramah, cekatan, solutif dan dapat diandalkan.",
            3: "Dalam memberikan pelayanan masih belum ramah, kurang cekatan, belum solutif dan kurang dapat diandalkan, tetapi dapat berbenah jika diberi masukan/bimbingan/arahan untuk perbaikan.",
            2: "Kurang responsif atau kurang cekatan terhadap kebutuhan pelayanan, seringkali kurang ramah sehingga tidak dapat diandalkan untuk memberikan pelayanan.",
            1: "Tidak memenuhi standar pelayanan, pelayanan yang diberikan tidak sesuai prosedur, tidak ramah, tidak cekatan, tidak solutif, serta tidak dapat diandalkan, bahkan terkadang timbul kekeliruan.",
        },
    },
    {
        id: "akuntabel",
        title: "Akuntabel",
        description: "1. Melaksanakan tugas dengan jujur dan bertanggung jawab cermat disiplin dan berintegritas tinggi.\n2. Menggunakan kekayaan dan BMN secara bertanggung jawab efektif dan efisien.\n3. Tidak menyalahgunakan kewenangan jabatan.",
        indicators: {
            5: "Bertanggung jawab atas kepecayaan yang diberikan, tidak menyalahgunakan wewenang dalam mengelola Barang Milik Negara. Jujur, teliti, disiplin, dan berintegritas dalam melaksanakan tugas. Selain itu, mampu menginspirasi sekitar atas perilakunya.",
            4: "Bertanggung jawab terhadap tugas jabatannya, jujur, teliti, disiplin, dan berintegritas, serta mengelola dan menggunakan Barang Milik Negara secara bertanggung jawab, efektif, dan efisien.",
            3: "Masih memerlukan arahan agar dapat konsisten dalam menjalankan tanggung jawab terhadap tugas jabatan secara jujur, teliti, disiplin, berintegritas, serta dalam menggunakan Barang Milik Negara secara bertanggung jawab, efektif, dan efisien.",
            2: "Kurang dapat dipercaya untuk menjalankan tugas secara jujur, teliti, disiplin dan berintegritas. Sesekali terdapat kecenderungan kurang bertanggung jawab dalam menggunakan Barang Milik Negara secara efektif dan efisien.",
            1: "Perilaku kerja menunjukkan potensi pelanggaran integritas, tidak dapat mempertanggungjawabkan pelaksanaan tugas, seringkali tidak jujur, tidak teliti, tidak disiplin, dan tidak menunjukkan tanggung jawab terhadap penggunaan Barang Milik Negara.",
        },
    },
    {
        id: "kompeten",
        title: "Kompeten",
        description: "1. Meningkatkan kompetensi diri untuk menjawab tantangan yang selalu berubah.\n2. Membantu orang lain belajar.\n3. Melaksanakan tugas dengan kualitas terbaik.",
        indicators: {
            5: "Berusaha untuk melaksanakan tugas dengan kualitas terbaik, terus belajar untuk menjawab tuntutan kerja yang dinamis. Kemudian mampu dan mau mengajarkan kompetensi yang dimiliki ke orang lain.",
            4: "Mampu menyelesaikan pekerjaan sesuai dengan keahlian dan tugas jabatannya, serta mau belajar untuk menjawab tuntutan kerja yang dinamis.",
            3: "Memerlukan arahan dalam menyelesaikan tugas dan masih kurang menunjukkan inisiatif untuk belajar sendiri. Perlu dorongan untuk melaksanakan tugas dengan lebih optimal.",
            2: "Kurang memiliki kecakapan dalam menyelesaikan tugas sehari-hari, serta tidak menunjukkan upaya untuk belajar meningkatkan kompetensi sehingga hasil pekerjaan sering diselesaikan apa adanya.",
            1: "Tidak menguasai tugas karena tidak memiliki keahlian khusus, kemampuannya rendah dan minim usaha untuk belajar.",
        },
    },
    {
        id: "harmonis",
        title: "Harmonis",
        description: "1. Menghargai setiap orang apapun latar belakangnya.\n2. Suka menolong orang lain.\n3. Membangun lingkungan kerja yang kondusif.",
        indicators: {
            5: "Secara konsisten membangun lingkungan kerja yang kondusif, saling menghargai, dapat menjaga hubungan kerja, peduli, saling menolong dengan rekan kerja, dapat bekerjasama dengan semua orang. Selain itu, dapat menularkan perilaku positif tersebut kepada rekan kerja.",
            4: "Menunjukkan sikap saling menghargai, menjaga hubungan kerja yang baik, peduli, saling menolong dengan rekan kerja, dan dapat bekerjasama dengan semua rekan kerja dalam suasana yang positif.",
            3: "Belum stabil dalam menghadapi perbedaan sehingga hubungan dengan rekan kerja belum konsisten harmonis. Terkadang memerlukan arahan untuk mampu bekerjasama, saling menghargai, saling menolong atau menunjukkan kepedulian di lingkungan kerja.",
            2: "Kurang menunjukkan sikap saling menghargai, kurang dapat menjaga hubungan kerja yang baik, terkadang acuh, kurang peka terhadap rekan yang perlu bantuan, kurang terbuka untuk bekerjasama dengan semua orang sehingga berpotensi menghambat suasana kerja.",
            1: "Menunjukkan perilaku tidak menghargai perbedaan, menolak untuk bekerjasama, tidak menghargai, acuh, serta sering menimbulkan situasi tidak kondusif dalam tim akibat ketidakmampuan mengelola keberagaman dalam hubungan kerja.",
        },
    },
    {
        id: "loyal",
        title: "Loyal",
        description: "1. Memegang teguh ideologi Pancasila, Undang-Undang Dasar Negara Republik Indonesia Tahun 1945, setia pada NKRI serta pemerintahan yang sah.\n2. Menjaga nama baik sesama ASN, Pimpinan, Instansi dan Negara.\n3. Menjaga rahasia jabatan dan negara.",
        indicators: {
            5: "Menunjukkan kesetiaan terhadap NKRI, dapat menjaga nama baik instansi, mematuhi ketentuan yang berlaku, melaksanakan tugas sesuai kebijakan pemerintah, serta menjaga rahasia jabatan dan negara. Selain itu, mampu mengajak dan menularkan perilaku loyal terhadap rekan kerja.",
            4: "Setia terhadap NKRI, dapat menjaga nama baik instansi, mematuhi ketentuan yang berlaku, melaksanakan tugas sesuai kebijakan pemerintah, serta menjaga rahasia jabatan dan negara sesuai kode etik profesi ASN.",
            3: "Masih memerlukan arahan untuk dapat menunjukkan perilaku yang menjaga kehormatan NKRI, instansi, serta profesi sebagai ASN. Perlu diberikan bimbingan agar dapat melaksanakan kebijakan pemerintah serta mau menjaga rahasia jabatan dan negara.",
            2: "Kurang menunjukkan dedikasi terhadap NKRI,  kurang dapat menjaga nama baik instansi, terkadang ada potensi menyalahi ketentuan yang berlaku, menghindari dalam melaksanakan tugas sesuai kebijakan pemerintah, serta kurang dapat menjaga rahasia jabatan dan negara.",
            1: "Tidak menunjukkan loyalitas terhadap NKRI dan/atau instansi, berperilaku yang berpotensi menurunkan kehormatan NKRI, instansi, citra profesi ASN, tidak mau melaksanakan tugas sesuai kebijakan pemerintah, serta mengabaikan ketentuan terkait rahasia jabatan dan negara.",
        },
    },
    {
        id: "adaptif",
        title: "Adaptif",
        description: "1. Cepat menyesuaikan diri menghadapi perubahan.\n2. Terus berinovasi dan mengembangkan kreativitas.\n3. Bertindak proaktif.",
        indicators: {
            5: "Cepat beradaptasi terhadap perubahan, menunjukkan kreativitas dan inovasi dalam melaksanakan tugas, serta secara aktif menginisiasi perbaikan proses kerja dan menerapkannya di lingkup unit kerja masing-masing.",
            4: "Mampu beradaptasi terhadap perubahan, memperbaiki cara kerja, dan melaksanakan tugas sesuai kebutuhan/situasi kerja.",
            3: "Jika diberikan arahan dapat beradaptasi, tetapi belum menunjukkan inisiatif dalam menjalankan tugas sehari-hari, ataupun dalam memperbaiki cara kerja.",
            2: "Mengalami kesulitan beradaptasi terhadap perubahan, yang terkadang berdampak pada kesulitan pelaksanaan tugas sehari hari serta cenderung mempertahankan cara kerja lama meskipun tidak lagi sesuai kebutuhan.",
            1: "Tidak mampu menyesuaikan diri/beradaptasi terhadap perubahan dan menolak penyesuaian/perbaikan proses kerja sehingga menghambat kelancaran tugas sehari-hari.",
        },
    },
    {
        id: "kolaboratif",
        title: "Kolaboratif",
        description: "1. Memberi kesempatan kepada berbagai pihak untuk berkontribusi.\n2. Terbuka dalam bekerja sama untuk menghasilkan nilai tambah.\n3. Menggerakkan pemanfaatan berbagai sumber daya untuk tujuan bersama.",
        indicators: {
            5: "Secara aktif mendorong kerja sama di dalam tim, membuka kesempatan bagi semua pihak untuk berkontribusi, mau terlibat dalam kerja tim, terbuka terhadap masukan, serta mampu menggerakkan pemanfaatan sumber daya bersama untuk mencapai tujuan organisasi.",
            4: "Mampu bekerja sama dengan baik, terlibat dalam kerja tim, serta terbuka terhadap masukan.",
            3: "Bekerjasama dalam tim hanya saat diminta. Masih memerlukan arahan agar dapat lebih terbuka terhadap masukan, dan juga kurang menunjukkan inisiatif untuk terlibat dalam tim kerja.",
            2: "Kesulitan bekerja sama dengan rekan kerja dalam tim, kurang dapat berkontribusi dalam kegiatan, serta kurang terbuka terhadap masukan sehingga berpotensi menghambat efektivitas kerja tim.",
            1: "Tidak mampu bekerja sama, tidak mau mendengar masukan/pendapat orang lain dan menolak arahan dalam tim, serta seringkali menimbulkan hambatan dalam kolaborasi.",
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
                                                        <div className="flex-shrink-0 w-38">
                                                            <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1.5 rounded-md border border-primary/20">
                                                                <div className="flex gap-0.5 flex-1 justify-center">
                                                                    {Array.from({ length: star }).map((_, i) => (
                                                                        <span key={i} className="text-sm leading-none">⭐</span>
                                                                    ))}
                                                                </div>
                                                                <span className="text-xs font-bold text-primary leading-none whitespace-nowrap">
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
                                                        💡 Gunakan panduan ini untuk memberikan penilaian
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
