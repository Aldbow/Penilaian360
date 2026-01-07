"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, LabelList } from "recharts"

interface ScoreDistributionChartProps {
    data: {
        range: string
        count: number
        percentage: number
    }[]
}

const COLORS = {
    "0-40": "#ef4444",    // Red - Poor
    "41-60": "#f59e0b",   // Amber - Needs Improvement
    "61-80": "#3b82f6",   // Blue - Good
    "81-100": "#10b981",  // Green - Excellent
}

export function ScoreDistributionChart({ data }: ScoreDistributionChartProps) {
    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 50, left: 10, bottom: 5 }}>
                <XAxis
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    dataKey="range"
                    type="category"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                />
                <Tooltip
                    cursor={{ fill: 'transparent' }}
                    formatter={(value, name, props) => [
                        `${value ?? 0} penilaian (${props?.payload?.percentage ?? 0}%)`,
                        'Jumlah'
                    ]}
                    contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={28}>
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={COLORS[entry.range as keyof typeof COLORS] || '#6b7280'}
                        />
                    ))}
                    <LabelList
                        dataKey="percentage"
                        position="right"
                        formatter={(value) => `${value ?? 0}%`}
                        style={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}
