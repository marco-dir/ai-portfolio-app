"use client"

import { useMemo } from "react"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from "recharts"

interface ValuationMultiplesProps {
    incomeStatements: any[]
    balanceSheets: any[]
    historicalPrices: any[]
    currentPE: number | null
    currentPB: number | null
}

export function ValuationMultiples({
    incomeStatements,
    balanceSheets,
    historicalPrices,
    currentPE,
    currentPB
}: ValuationMultiplesProps) {

    const multiplesData = useMemo(() => {
        if (!historicalPrices || historicalPrices.length === 0 || !incomeStatements || incomeStatements.length === 0) {
            return { peData: [], pbData: [] }
        }

        // Create a map of annual EPS and Book Value
        const annualMetrics = new Map()

        incomeStatements.forEach(income => {
            const year = new Date(income.date).getFullYear()
            const eps = income.epsdiluted || income.eps || 0
            annualMetrics.set(year, { ...annualMetrics.get(year), eps })
        })

        balanceSheets?.forEach(balance => {
            const year = new Date(balance.date).getFullYear()
            const income = incomeStatements.find(inc => new Date(inc.date).getFullYear() === year)
            const shares = income?.weightedAverageShsOutDil || income?.weightedAverageShsOut || 1
            const bookValue = shares > 0 ? (balance.totalStockholdersEquity || balance.totalEquity || 0) / shares : 0
            annualMetrics.set(year, { ...annualMetrics.get(year), bookValue })
        })

        // Sample monthly price data and calculate PE/PB
        const monthlyData: any[] = []
        const sortedPrices = [...historicalPrices].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        // Sample every 20 days (roughly monthly)
        for (let i = 0; i < sortedPrices.length; i += 20) {
            const priceData = sortedPrices[i]
            const date = new Date(priceData.date)
            const year = date.getFullYear()
            const metrics = annualMetrics.get(year)

            if (metrics) {
                const pe = metrics.eps > 0 ? priceData.close / metrics.eps : null
                const pb = metrics.bookValue > 0 ? priceData.close / metrics.bookValue : null

                if (pe && pe > 0 && pe < 100) {
                    monthlyData.push({
                        date: date.toLocaleDateString('it-IT', { year: 'numeric', month: 'short' }),
                        pe,
                        pb: pb && pb > 0 && pb < 20 ? pb : null
                    })
                }
            }
        }

        const peData = monthlyData.filter(d => d.pe !== null)
        const pbData = monthlyData.filter(d => d.pb !== null)

        return { peData, pbData }
    }, [historicalPrices, incomeStatements, balanceSheets])

    const peStats = useMemo(() => {
        if (multiplesData.peData.length === 0) return null
        const values = multiplesData.peData.map(d => d.pe).filter((v): v is number => v !== null)
        return {
            avg: values.reduce((a, b) => a + b, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values)
        }
    }, [multiplesData.peData])

    const pbStats = useMemo(() => {
        if (multiplesData.pbData.length === 0) return null
        const values = multiplesData.pbData.map(d => d.pb).filter((v): v is number => v !== null)
        return {
            avg: values.reduce((a, b) => a + b, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values)
        }
    }, [multiplesData.pbData])

    if (multiplesData.peData.length === 0 && multiplesData.pbData.length === 0) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Analisi Multipli Storici</h3>
                <p className="text-gray-400">Dati non disponibili</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">Analisi Multipli Storici</h3>

            <div className="grid md:grid-cols-2 gap-6">
                {/* PE Ratio Chart */}
                {multiplesData.peData.length > 0 && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-white mb-4">P/E Ratio Storico</h4>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={multiplesData.peData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#9CA3AF"
                                        fontSize={11}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis stroke="#9CA3AF" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#111827',
                                            borderColor: '#374151',
                                            borderRadius: '0.5rem'
                                        }}
                                        formatter={(value: number) => [value.toFixed(2), 'P/E']}
                                    />
                                    {peStats && (
                                        <ReferenceLine
                                            y={peStats.avg}
                                            stroke="#f59e0b"
                                            strokeDasharray="3 3"
                                            label={{ value: `Media: ${peStats.avg.toFixed(1)}`, fill: '#f59e0b', fontSize: 12 }}
                                        />
                                    )}
                                    {currentPE && (
                                        <ReferenceLine
                                            y={currentPE}
                                            stroke="#ef4444"
                                            strokeDasharray="5 5"
                                            label={{ value: `Attuale: ${currentPE.toFixed(1)}`, fill: '#ef4444', fontSize: 12 }}
                                        />
                                    )}
                                    <Line
                                        type="monotone"
                                        dataKey="pe"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        {peStats && (
                            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <div className="text-gray-400">Minimo</div>
                                    <div className="text-white font-semibold">{peStats.min.toFixed(2)}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400">Media</div>
                                    <div className="text-white font-semibold">{peStats.avg.toFixed(2)}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400">Massimo</div>
                                    <div className="text-white font-semibold">{peStats.max.toFixed(2)}</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* PB Ratio Chart */}
                {multiplesData.pbData.length > 0 && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-white mb-4">P/B Ratio Storico</h4>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={multiplesData.pbData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#9CA3AF"
                                        fontSize={11}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis stroke="#9CA3AF" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#111827',
                                            borderColor: '#374151',
                                            borderRadius: '0.5rem'
                                        }}
                                        formatter={(value: number) => [value.toFixed(2), 'P/B']}
                                    />
                                    {pbStats && (
                                        <ReferenceLine
                                            y={pbStats.avg}
                                            stroke="#f59e0b"
                                            strokeDasharray="3 3"
                                            label={{ value: `Media: ${pbStats.avg.toFixed(1)}`, fill: '#f59e0b', fontSize: 12 }}
                                        />
                                    )}
                                    {currentPB && (
                                        <ReferenceLine
                                            y={currentPB}
                                            stroke="#ef4444"
                                            strokeDasharray="5 5"
                                            label={{ value: `Attuale: ${currentPB.toFixed(1)}`, fill: '#ef4444', fontSize: 12 }}
                                        />
                                    )}
                                    <ReferenceLine
                                        y={1}
                                        stroke="#10b981"
                                        strokeDasharray="3 3"
                                        label={{ value: 'P/B = 1', fill: '#10b981', fontSize: 12 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="pb"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        {pbStats && (
                            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <div className="text-gray-400">Minimo</div>
                                    <div className="text-white font-semibold">{pbStats.min.toFixed(2)}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400">Media</div>
                                    <div className="text-white font-semibold">{pbStats.avg.toFixed(2)}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400">Massimo</div>
                                    <div className="text-white font-semibold">{pbStats.max.toFixed(2)}</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
