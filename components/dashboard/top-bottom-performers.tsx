"use client"

import { TrendingUp, TrendingDown } from "lucide-react"

interface TopBottomPerformersProps {
    topPerformers: { name: string; score: number }[]
    bottomPerformers: { name: string; score: number }[]
}

export function TopBottomPerformers({ topPerformers, bottomPerformers }: TopBottomPerformersProps) {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            {/* Top Performers */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-green-500/15 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <h4 className="font-semibold text-sm">Performa Tertinggi</h4>
                </div>
                <div className="space-y-3">
                    {topPerformers.length > 0 ? (
                        topPerformers.map((performer, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <span className="text-sm font-bold text-muted-foreground w-5">{idx + 1}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium truncate max-w-[140px]" title={performer.name}>
                                            {performer.name}
                                        </span>
                                        <span className="text-sm font-bold text-green-500">{performer.score}</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                                            style={{ width: `${performer.score}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">Belum ada data</p>
                    )}
                </div>
            </div>

            {/* Bottom Performers / Areas for Improvement */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                        <TrendingDown className="h-4 w-4 text-amber-500" />
                    </div>
                    <h4 className="font-semibold text-sm">Perlu Pengembangan</h4>
                </div>
                <div className="space-y-3">
                    {bottomPerformers.length > 0 ? (
                        bottomPerformers.map((performer, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <span className="text-sm font-bold text-muted-foreground w-5">{idx + 1}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium truncate max-w-[140px]" title={performer.name}>
                                            {performer.name}
                                        </span>
                                        <span className="text-sm font-bold text-amber-500">{performer.score}</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                                            style={{ width: `${performer.score}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">Belum ada data</p>
                    )}
                </div>
            </div>
        </div>
    )
}
