import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SpotlightCard } from "@/components/ui/spotlight-card"
import Link from "next/link"
import { CheckCircle2, Circle } from "lucide-react"

interface Employee {
    id: string
    name: string
    position: string
    department: string
    status: "pending" | "completed"
}

interface EmployeeCardProps {
    employee: Employee
}

export function EmployeeCard({ employee }: EmployeeCardProps) {
    const isCompleted = employee.status === "completed"

    return (
        <SpotlightCard
            className={`
                flex flex-col h-full transition-all duration-300
                ${isCompleted ? 'opacity-80 grayscale-[0.5]' : 'hover:translate-y-[-4px] hover:shadow-lg hover:shadow-primary/10'}
            `}
        >
            <div className="flex flex-col h-full p-6">
                <div className="flex justify-between items-start mb-4">
                    <Avatar className="h-16 w-16 border-2 border-white/10 shadow-sm">
                        <AvatarImage src={`https://avatar.vercel.sh/${employee.id}.png`} alt={employee.name} />
                        <AvatarFallback className="text-lg bg-primary/10 text-primary font-bold">
                            {employee.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    {isCompleted ? (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1">
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                            Selesai
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-muted-foreground border-white/10 px-3 py-1">
                            <Circle className="mr-1.5 h-3.5 w-3.5" />
                            Belum
                        </Badge>
                    )}
                </div>

                <div className="space-y-2 mb-6 flex-1 min-h-[120px]">
                    <h3 className="font-bold text-lg leading-tight line-clamp-2 min-h-[3.5rem]" title={employee.name}>
                        {employee.name}
                    </h3>
                    <p className="text-sm font-medium text-primary/80 line-clamp-3 leading-snug">
                        {employee.position}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 pt-1">
                        {employee.department}
                    </p>
                </div>

                <div className="pt-4 mt-auto border-t border-white/5">
                    <Link href={isCompleted ? "#" : `/dashboard/staff/assess/${employee.id}`} className="w-full block">
                        <Button
                            className="w-full font-semibold shadow-none"
                            variant={isCompleted ? "outline" : "default"}
                            disabled={isCompleted}
                            size="default"
                        >
                            {isCompleted ? "Sudah Dinilai" : "Mulai Penilaian"}
                        </Button>
                    </Link>
                </div>
            </div>
        </SpotlightCard>
    )
}
