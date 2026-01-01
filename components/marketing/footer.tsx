import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black py-12 md:py-16 lg:py-20">
            <div className="container">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold tracking-tight text-white">Penilaian360</h4>
                        <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">
                            Platform penilaian kinerja UKPBJ Kementerian Ketenagakerjaan berbasis nilai BerAKHLAK untuk mewujudkan SDM yang unggul.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Tautan</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
                            </li>
                            <li>
                                <Link href="/login" className="hover:text-white transition-colors">Login Pegawai</Link>
                            </li>
                            <li>
                                <Link href="/admin" className="hover:text-white transition-colors">Login Admin</Link>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Bantuan</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/#faq" className="hover:text-white transition-colors">FAQ</Link>
                            </li>
                            <li>
                                <Link href="/#contact" className="hover:text-white transition-colors">Hubungi Kami</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-white transition-colors">Panduan Pengguna</Link>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Kontak</h4>
                        <div className="text-sm text-muted-foreground space-y-2">
                            <p>Gedung UKPBJ Kemnaker</p>
                            <p>Jl. Jend. Gatot Subroto Kav. 51</p>
                            <p>Jakarta Selatan, DKI Jakarta</p>
                            <p className="pt-2">
                                <span className="block text-white/50 text-xs">Email</span>
                                ukpbj@kemnaker.go.id
                            </p>
                        </div>
                    </div>
                </div>

                <Separator className="my-8 bg-white/10" />

                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} UKPBJ Kementerian Ketenagakerjaan. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <Link href="#" className="text-muted-foreground hover:text-white transition-colors text-xs">Privacy Policy</Link>
                        <Link href="#" className="text-muted-foreground hover:text-white transition-colors text-xs">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
