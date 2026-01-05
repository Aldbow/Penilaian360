"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"

interface OverallChartProps {
    data: { name: string; total: number }[]
}

const COLORS = [
    "#10b981", // Emerald (High > 90)
    "#3b82f6", // Blue (Good 80-90)
    "#f59e0b", // Amber (Medium 70-80)
    "#ef4444", // Red (Low < 70)
]

const getColor = (score: number) => {
    if (score >= 90) return COLORS[0]
    if (score >= 80) return COLORS[1]
    if (score >= 70) return COLORS[2]
    return COLORS[3]
}

export function OverallChart({ data }: OverallChartProps) {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#e0e0e2"
                    fontSize={16}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={16}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: 'var(theme(borderRadius.md))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getColor(entry.total)} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}
