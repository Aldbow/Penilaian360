"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"

interface AspectTrendChartProps {
    data: {
        month: string
        pelayanan: number
        akuntabel: number
        kompeten: number
        harmonis: number
        loyal: number
        adaptif: number
        kolaboratif: number
    }[]
}

const ASPECT_COLORS = {
    pelayanan: "#ef4444",
    akuntabel: "#f97316",
    kompeten: "#eab308",
    harmonis: "#22c55e",
    loyal: "#14b8a6",
    adaptif: "#3b82f6",
    kolaboratif: "#8b5cf6"
}

const ASPECT_NAMES = {
    pelayanan: "Pelayanan",
    akuntabel: "Akuntabel",
    kompeten: "Kompeten",
    harmonis: "Harmonis",
    loyal: "Loyal",
    adaptif: "Adaptif",
    kolaboratif: "Kolaboratif"
}

export function AspectTrendChart({ data }: AspectTrendChartProps) {
    return (
        <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.5} />
                <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend
                    verticalAlign="bottom"
                    height={50}
                    wrapperStyle={{ paddingTop: '10px' }}
                    formatter={(value) => ASPECT_NAMES[value as keyof typeof ASPECT_NAMES] || value}
                />
                {Object.entries(ASPECT_COLORS).map(([key, color]) => (
                    <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        name={key}
                        stroke={color}
                        strokeWidth={2}
                        dot={{ fill: color, strokeWidth: 1, r: 3 }}
                        activeDot={{ r: 5, strokeWidth: 2 }}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    )
}
