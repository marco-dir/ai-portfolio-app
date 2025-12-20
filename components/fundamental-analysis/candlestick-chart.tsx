"use client"

import { useMemo } from "react"
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts"

interface CandlestickChartProps {
    data: any[]
    currency: string
}

// Custom Candlestick shape
const Candlestick = (props: any) => {
    const { x, y, width, height, payload, domainMin } = props

    if (!payload || !payload.open || !payload.close || !payload.high || !payload.low || !domainMin) {
        return null
    }

    const isGreen = payload.close >= payload.open
    const color = isGreen ? "#10b981" : "#ef4444"

    // Calculate ratio (pixels per price unit)
    // The bar height represents (payload.high - domainMin)
    // Avoid division by zero
    const priceRangeFromMin = payload.high - domainMin
    if (priceRangeFromMin <= 0) return null

    const ratio = height / priceRangeFromMin

    // Calculate pixel coordinates relative to chart top (y)
    // y is the pixel position of value (payload.high)
    const yHigh = y
    const yLow = y + (payload.high - payload.low) * ratio
    const yOpen = y + (payload.high - payload.open) * ratio
    const yClose = y + (payload.high - payload.close) * ratio

    const bodyTop = Math.min(yOpen, yClose)
    const bodyBottom = Math.max(yOpen, yClose)
    const bodyHeight = Math.max(1, bodyBottom - bodyTop)

    return (
        <g>
            {/* Wick (High to Low) */}
            <line
                x1={x + width / 2}
                y1={yHigh}
                x2={x + width / 2}
                y2={yLow}
                stroke={color}
                strokeWidth={1}
            />
            {/* Body (Open to Close) */}
            <rect
                x={x}
                y={bodyTop}
                width={width}
                height={bodyHeight}
                fill={color}
                stroke={color}
            />
        </g>
    )
}

export function CandlestickChart({ data, currency }: CandlestickChartProps) {
    const chartData = useMemo(() => {
        if (!data || !Array.isArray(data)) return []

        // Get last year of data
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

        return data
            .filter(item => new Date(item.date) >= oneYearAgo)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(item => ({
                date: item.date,
                high: item.high,
                low: item.low,
                open: item.open,
                close: item.close,
                volume: item.volume
            }))
    }, [data])

    if (!chartData || chartData.length === 0) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <p className="text-gray-400">Dati grafico non disponibili</p>
            </div>
        )
    }

    // Calculate YTD and 1Y performance
    const ytdStart = new Date(new Date().getFullYear(), 0, 1)
    const ytdData = chartData.filter(item => new Date(item.date) >= ytdStart)

    const ytdChange = ytdData.length > 1
        ? ((ytdData[ytdData.length - 1].close - ytdData[0].close) / ytdData[0].close) * 100
        : 0

    const oneYearChange = chartData.length > 1
        ? ((chartData[chartData.length - 1].close - chartData[0].close) / chartData[0].close) * 100
        : 0

    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency

    // Calculate domain for Y axis
    const allPrices = chartData.flatMap(d => [d.high, d.low])
    const minPrice = Math.min(...allPrices) * 0.95
    const maxPrice = Math.max(...allPrices) * 1.05

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Grafico Annuale (Candele Giornaliere)</h3>
                <div className="flex gap-4">
                    <div className="text-right">
                        <div className="text-sm text-gray-400">YTD</div>
                        <div className={`text-lg font-semibold ${ytdChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {ytdChange >= 0 ? '+' : ''}{ytdChange.toFixed(2)}%
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-400">1 Anno</div>
                        <div className={`text-lg font-semibold ${oneYearChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {oneYearChange >= 0 ? '+' : ''}{oneYearChange.toFixed(2)}%
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                            dataKey="date"
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickFormatter={(val) => {
                                const d = new Date(val)
                                return d.toLocaleDateString('it-IT', { month: 'short', day: 'numeric' })
                            }}
                            minTickGap={50}
                        />
                        <YAxis
                            stroke="#9CA3AF"
                            fontSize={12}
                            domain={[minPrice, maxPrice]}
                            allowDataOverflow={false}
                            tickFormatter={(val) => `${currencySymbol}${val.toFixed(0)}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#111827',
                                borderColor: '#374151',
                                borderRadius: '0.5rem'
                            }}
                            labelFormatter={(label) => new Date(label).toLocaleDateString('it-IT')}
                            formatter={(value: any, name: any) => {
                                const labels: Record<string, string> = {
                                    high: 'Massimo',
                                    low: 'Minimo',
                                    open: 'Apertura',
                                    close: 'Chiusura'
                                }
                                return [`${currencySymbol}${value.toFixed(2)}`, labels[name] || name]
                            }}
                        />
                        <Bar
                            dataKey="high"
                            fill="transparent"
                            shape={(props: any) => <Candlestick {...props} domainMin={minPrice} />}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
