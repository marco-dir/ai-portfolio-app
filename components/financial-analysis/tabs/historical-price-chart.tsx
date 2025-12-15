"use client"

import { useState, useMemo } from "react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts"
import { formatCurrency } from "@/lib/format-utils"

export function HistoricalPriceChart({ data }: { data: any[] }) {
    const [range, setRange] = useState<"1Y" | "YTD" | "5Y">("1Y")

    const chartData = useMemo(() => {
        if (!data) return []

        // Ensure data is an array - handle both array and object with historical property
        let dataArray: any[] = []
        if (Array.isArray(data)) {
            dataArray = data
        } else if (data && typeof data === 'object' && 'historical' in data) {
            dataArray = (data as any).historical || []
        }

        if (!Array.isArray(dataArray) || dataArray.length === 0) return []

        const now = new Date()
        let cutoffDate: Date

        switch (range) {
            case 'YTD':
                cutoffDate = new Date(now.getFullYear(), 0, 1)
                break
            case '1Y':
                cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1))
                break
            case '5Y':
                cutoffDate = new Date(now.setFullYear(now.getFullYear() - 5))
                break
            default:
                return dataArray.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        }

        return dataArray
            .filter(item => new Date(item.date) >= cutoffDate)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }, [data, range])

    if (!data || data.length === 0) return null

    // Calculate min/max for Y-axis domain
    const prices = chartData.map(d => d.close)
    const minPrice = Math.min(...prices) * 0.95
    const maxPrice = Math.max(...prices) * 1.05

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Andamento Prezzo</h3>
                <div className="flex bg-gray-900 rounded-lg p-0.5 border border-gray-700">
                    {(["YTD", "1Y", "5Y"] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${range === r
                                ? "bg-gray-700 text-white shadow-sm"
                                : "text-gray-400 hover:text-gray-200"
                                }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickFormatter={(val) => {
                                const d = new Date(val);
                                return range === "5Y" ? d.getFullYear().toString() : d.toLocaleDateString(undefined, { month: 'short' });
                            }}
                            minTickGap={30}
                        />
                        <YAxis
                            hide={false}
                            stroke="#9CA3AF"
                            fontSize={12}
                            domain={[minPrice, maxPrice]}
                            tickFormatter={(val) => val.toFixed(0)}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem' }}
                            itemStyle={{ color: '#E5E7EB' }}
                            formatter={(value: number) => [formatCurrency(value), 'Price']}
                            labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        />
                        <Area
                            type="monotone"
                            dataKey="close"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
