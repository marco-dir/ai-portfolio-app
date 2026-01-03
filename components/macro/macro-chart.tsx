"use client"

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { formatNumber } from "@/lib/format-utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MacroChartProps {
    title: string
    data: any[]
    dataKey: string
    color: string
    unit?: string
    description?: string
}

export function MacroChart({ title, data, dataKey, color, unit = "", description }: MacroChartProps) {
    if (!data || data.length === 0) return null

    const chartData = data

    // Calculate trend
    const lastValue = chartData[chartData.length - 1]?.[dataKey]
    const prevValue = chartData[chartData.length - 2]?.[dataKey]
    const trend = lastValue && prevValue
        ? ((lastValue - prevValue) / prevValue * 100).toFixed(2)
        : null

    const TrendIcon = trend && parseFloat(trend) > 0
        ? TrendingUp
        : trend && parseFloat(trend) < 0
            ? TrendingDown
            : Minus

    const trendColor = trend && parseFloat(trend) > 0
        ? 'text-green-400'
        : trend && parseFloat(trend) < 0
            ? 'text-red-400'
            : 'text-gray-400'

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-700/50 shadow-xl">
            {/* Background Glow Effect */}
            <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
                style={{ backgroundColor: color }}
            />

            {/* Header */}
            <div className="relative p-6 pb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
                        {description && (
                            <p className="text-sm text-gray-400">{description}</p>
                        )}
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${parseFloat(trend) > 0 ? 'bg-green-500/10' : parseFloat(trend) < 0 ? 'bg-red-500/10' : 'bg-gray-500/10'}`}>
                            <TrendIcon size={14} className={trendColor} />
                            <span className={`text-xs font-medium ${trendColor}`}>
                                {parseFloat(trend) > 0 ? '+' : ''}{trend}%
                            </span>
                        </div>
                    )}
                </div>

                {/* Current Value Display */}
                {lastValue && (
                    <div className="mt-4">
                        <span className="text-3xl font-bold text-white">
                            {formatNumber(lastValue)}{unit}
                        </span>
                        <span className="text-sm text-gray-400 ml-2">
                            Ultimo valore
                        </span>
                    </div>
                )}
            </div>

            {/* Chart */}
            <div className="h-48 px-4 pb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                                <stop offset="100%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.5} />
                        <XAxis
                            dataKey="date"
                            stroke="#6B7280"
                            fontSize={11}
                            tickFormatter={(value) => value?.split('-')[0]}
                            minTickGap={40}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="#6B7280"
                            fontSize={11}
                            tickFormatter={(value) => `${formatNumber(value)}`}
                            domain={['auto', 'auto']}
                            axisLine={false}
                            tickLine={false}
                            width={60}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                                borderColor: '#374151',
                                borderRadius: '12px',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}
                            itemStyle={{ color: '#F3F4F6' }}
                            formatter={(value: any) => [`${formatNumber(value)}${unit}`, title]}
                            labelFormatter={(label) => `📅 ${label}`}
                        />
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill={`url(#gradient-${title})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
