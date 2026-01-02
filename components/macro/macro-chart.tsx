"use client"

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { formatNumber } from "@/lib/format-utils"

export function MacroChart({ title, data, dataKey, color, unit = "" }: { title: string, data: any[], dataKey: string, color: string, unit?: string }) {
    if (!data || data.length === 0) return null

    // Reverse data if it comes in descending order (FMP usually returns latest first)
    // We want ascending for chart (oldest to newest)
    const chartData = [...data].reverse()

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickFormatter={(value) => value.split('-')[0]} // Show Year only
                            minTickGap={30}
                        />
                        <YAxis
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickFormatter={(value) => `${formatNumber(value)}${unit}`}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#F3F4F6' }}
                            itemStyle={{ color: '#F3F4F6' }}
                            formatter={(value: any) => [`${formatNumber(value)}${unit}`, title]}
                            labelFormatter={(label) => `Data: ${label}`}
                        />
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            fillOpacity={1}
                            fill={`url(#color${dataKey})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
