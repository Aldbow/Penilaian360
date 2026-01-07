"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface CompletionDonutChartProps {
    data: {
        name: string
        value: number
        color: string
    }[]
    total: number
}

export function CompletionDonutChart({ data, total }: CompletionDonutChartProps) {
    return (
        <ResponsiveContainer width="100%" height={280}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                {/* Center Label */}
                <text
                    x="50%"
                    y="46%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground"
                    style={{ fontSize: '28px', fontWeight: 700 }}
                >
                    {total}
                </text>
                <text
                    x="50%"
                    y="56%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-muted-foreground"
                    style={{ fontSize: '12px' }}
                >
                    Total Target
                </text>
                <Tooltip
                    formatter={(value, name) => [`${value ?? 0} penilaian`, name]}
                    contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry) => (
                        <span style={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}>{value}</span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    )
}
