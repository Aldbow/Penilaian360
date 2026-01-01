"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, LabelList } from "recharts"

interface AspectBarChartProps {
    data: {
        subject: string
        A: number
        fullMark: number
    }[]
}

const COLORS = [
    "#10b981", // Emerald (High)
    "#3b82f6", // Blue (Good)
    "#f59e0b", // Amber (Medium)
    "#ef4444", // Red (Low)
]

const getColor = (score: number) => {
    if (score >= 90) return COLORS[0]
    if (score >= 80) return COLORS[1]
    if (score >= 70) return COLORS[2]
    return COLORS[3]
}

export function AspectBarChart({ data }: AspectBarChartProps) {
    // Transform subject names for shorter labels if needed, or keep as is
    const chartData = data.map(item => ({
        ...item,
        shortName: item.subject.split(" ")[0] // Take first word "Berorientasi", "Akuntabel" etc
    }))

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis
                    dataKey="subject"
                    type="category"
                    width={110}
                    tick={{ fontSize: 13, fill: "#e5e7eb", fontWeight: 500 }}
                    interval={0}
                />
                <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151" }}
                    itemStyle={{ color: "#f3f4f6" }}
                    formatter={(value: any) => [`${value}`, 'Nilai']}
                />
                <Bar dataKey="A" radius={[0, 4, 4, 0]} barSize={20}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getColor(entry.A)} />
                    ))}
                    <LabelList dataKey="A" position="right" fill="#e5e7eb" fontSize={12} formatter={(val: any) => `${val}`} />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}
