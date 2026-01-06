"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send } from "lucide-react"

export function ContactForm() {
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [isSent, setIsSent] = React.useState<boolean>(false)

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)

        // Simulate network request
        setTimeout(() => {
            setIsLoading(false)
            setIsSent(true)

            // Reset after 3 seconds
            setTimeout(() => setIsSent(false), 3000)
        }, 1500)
    }

    return (
        <div className="grid gap-6 p-6 rounded-xl border border-white/5 bg-white/5 backdrop-blur-xl">
            <form onSubmit={onSubmit}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nama Lengkap</Label>
                        <Input id="name" placeholder="Nama Anda" disabled={isLoading} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" placeholder="nama@kemnaker.go.id" type="email" disabled={isLoading} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="subject">Subjek</Label>
                        <Input id="subject" placeholder="Perihal pesan" disabled={isLoading} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="message">Pesan</Label>
                        <Textarea
                            id="message"
                            placeholder="Tuliskan pesan atau kendala yang Anda alami..."
                            className="min-h-[120px] resize-none"
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <Button disabled={isLoading || isSent} className="w-full">
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isSent ? "Pesan Terkirim!" : (
                            <>
                                <Send className="mr-2 h-4 w-4" /> Kirim Pesan
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
