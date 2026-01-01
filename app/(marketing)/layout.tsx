import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="z-40">
                <Navbar />
            </header>
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    )
}
