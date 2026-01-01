import { DashboardNav } from "@/components/dashboard/dashboard-nav"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col space-y-6">
            <header className="sticky top-0 z-40 border-b bg-background">
                <DashboardNav />
            </header>
            {/* Sidebar removed for full width */}
            <main className="flex w-full flex-1 flex-col overflow-hidden container px-4 mb-4">
                {children}
            </main>
        </div>
    )
}
