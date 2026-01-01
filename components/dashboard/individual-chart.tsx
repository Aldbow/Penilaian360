"use client"

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface IndividualChartProps {
    data: { subject: string; A: number; fullMark: number }[]
}

export function IndividualChart({ data }: IndividualChartProps) {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid stroke="hsl(var(--muted-foreground))" opacity={0.2} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                    name="Pegawai"
                    dataKey="A"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: 'var(theme(borderRadius.md))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
            </RadarChart>
        </ResponsiveContainer>
    )
}
