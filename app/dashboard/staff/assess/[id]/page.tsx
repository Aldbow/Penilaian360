"use client"

import * as React from "react"
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

// I'll stick to a simple alert for now to avoid dependency issues if toast isn't set up yet.
// Or I can add a simple state for success.

const aspects = [
    {
        id: "berorientasi-pelayanan",
        title: "Berorientasi Pelayanan",
        description: "1. Memahami dan memenuhi kebutuhan masyarakat.\n\n2. Ramah, cekatan, solutif, dan dapat diandalkan.\n\n3. Melakukan perbaikan tiada henti.",
    },
    {
        id: "akuntabel",
        title: "Akuntabel",
        description: "1. Melaksanakan tugas dengan jujur dan bertanggung jawab cermat disiplin dan berintegritas tinggi.\n\n2. Menggunakan kekayaan dan BMN secara bertanggung jawab efektif dan efisien.\n\n3. Tidak menyalahgunakan kewenangan jabatan.",
    },
    {
        id: "kompeten",
        title: "Kompeten",
        description: "1. Meningkatkan kompetensi diri untuk menjawab tantangan yang selalu berubah.\n\n2. Membantu orang lain belajar.\n\n3. Melaksanakan tugas dengan kualitas terbaik.",
    },
    {
        id: "harmonis",
        title: "Harmonis",
        description: "1. Menghargai setiap orang apapun latar belakangnya.\n\n2. Suka menolong orang lain.\n\n3. Membangun lingkungan kerja yang kondusif.",
    },
    {
        id: "loyal",
        title: "Loyal",
        description: "1. Memegang teguh ideologi Pancasila, Undang-Undang Dasar Negara Republik Indonesia Tahun 1945, setia pada NKRI serta pemerintahan yang sah.\n\n2. Menjaga nama baik sesama ASN, Pimpinan, Instansi dan Negara.\n\n3. Menjaga rahasia jabatan dan negara.",
    },
    {
        id: "adaptif",
        title: "Adaptif",
        description: "1. Cepat menyesuaikan diri menghadapi perubahan.\n\n2. Terus berinovasi dan mengembangkan kreativitas.\n\n3. Bertindak proaktif.",
    },
    {
        id: "kolaboratif",
        title: "Kolaboratif",
        description: "1. Memberi kesempatan kepada berbagai pihak untuk berkontribusi.\n\n2. Terbuka dalam bekerja sama untuk menghasilkan nilai tambah.\n\n3. Menggerakkan pemanfaatan berbagai sumber daya untuk tujuan bersama.",
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
        const assessmentMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString() // First day of current month

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
