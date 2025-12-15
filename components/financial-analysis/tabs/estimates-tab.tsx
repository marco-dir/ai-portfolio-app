"use client"

import { useState } from "react"
import { formatCurrency } from "@/lib/format-utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export function EstimatesTab({ estimates, ratings, recommendations }: { estimates: any[], ratings: any[], recommendations?: any[] }) {
    const hasEstimates = estimates && estimates.length > 0
    const hasRatings = ratings && ratings.length > 0
    const hasRecs = recommendations && recommendations.length > 0

    if (!hasEstimates && !hasRatings && !hasRecs) return <div className="p-4 text-gray-400">Nessun dato analista disponibile.</div>

    // Range Selector Logic
    const [range, setRange] = useState<"5Y" | "10Y" | "Max">("5Y")

    // Process estimates for chart (Revenue & EBITDA)
    // Sort chronological first
    const sortedEstimates = [...estimates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Filter based on range
    const getFilteredData = (data: any[]) => {
        if (range === "Max") return data
        const count = range === "5Y" ? 5 : 10
        // Taking the last N periods (most recent/future)
        return data.slice(-count)
    }

    const chartData = getFilteredData(sortedEstimates).map(item => ({
        year: item.date.split("-")[0],
        Revenue: item.estimatedRevenueAvg,
        EBITDA: item.estimatedEbitdaAvg,
        NetIncome: item.estimatedNetIncomeAvg
    }))

    // Process ratings
    const latestRating = hasRatings ? ratings[0] : null
    const latestRec = hasRecs ? recommendations[0] : null

    return (
        <div className="space-y-8">
            {/* Analyst Ratings Summary */}
            {(latestRating || latestRec) && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Consenso Analisti</h3>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {latestRating && (
                            <div className="text-center min-w-[150px]">
                                <div className="text-sm text-gray-400 mb-1">Raccomandazione</div>
                                <div className="text-2xl font-bold text-white px-4 py-2 bg-blue-600 rounded-lg inline-block">
                                    {latestRating.ratingRecommendation}
                                </div>
                            </div>
                        )}

                        {latestRec ? (
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4 text-center w-full">
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Strong Buy</div>
                                    <div className="font-bold text-green-400 text-lg">{latestRec.analystRatingsStrongBuy || 0}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Buy</div>
                                    <div className="font-bold text-green-500 text-lg">{latestRec.analystRatingsBuy || 0}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Hold</div>
                                    <div className="font-bold text-yellow-500 text-lg">{latestRec.analystRatingsHold || 0}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Sell</div>
                                    <div className="font-bold text-red-500 text-lg">{latestRec.analystRatingsSell || 0}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Strong Sell</div>
                                    <div className="font-bold text-red-700 text-lg">{latestRec.analystRatingsStrongSell || 0}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Strong Buy</div>
                                    <div className="flex justify-center gap-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <div key={i} className={`w - 2 h - 2 rounded - full ${i < (latestRating?.ratingScore >= 4.5 ? 5 : 0) ? 'bg-green-400' : 'bg-gray-700'} `} />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Buy</div>
                                    <div className="flex justify-center gap-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <div key={i} className={`w - 2 h - 2 rounded - full ${i < (latestRating?.ratingScore >= 3.5 && latestRating?.ratingScore < 4.5 ? 4 : 0) ? 'bg-green-500' : 'bg-gray-700'} `} />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Hold</div>
                                    <div className="flex justify-center gap-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <div key={i} className={`w - 2 h - 2 rounded - full ${i < (latestRating?.ratingScore >= 2.5 && latestRating?.ratingScore < 3.5 ? 3 : 0) ? 'bg-yellow-500' : 'bg-gray-700'} `} />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Sell</div>
                                    <div className="flex justify-center gap-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <div key={i} className={`w - 2 h - 2 rounded - full ${i < (latestRating?.ratingScore < 2.5 ? 2 : 0) ? 'bg-red-500' : 'bg-gray-700'} `} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Pie Chart for Analyst Consensus */}
            {latestRec && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mt-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Distribuzione Consenso Analisti</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Strong Buy', value: latestRec.analystRatingsStrongBuy || 0, color: '#22c55e' },
                                        { name: 'Buy', value: latestRec.analystRatingsBuy || 0, color: '#10b981' },
                                        { name: 'Hold', value: latestRec.analystRatingsHold || 0, color: '#eab308' },
                                        { name: 'Sell', value: latestRec.analystRatingsSell || 0, color: '#ef4444' },
                                        { name: 'Strong Sell', value: latestRec.analystRatingsStrongSell || 0, color: '#dc2626' }
                                    ].filter(item => item.value > 0)}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {[
                                        { name: 'Strong Buy', value: latestRec.analystRatingsStrongBuy || 0, color: '#22c55e' },
                                        { name: 'Buy', value: latestRec.analystRatingsBuy || 0, color: '#10b981' },
                                        { name: 'Hold', value: latestRec.analystRatingsHold || 0, color: '#eab308' },
                                        { name: 'Sell', value: latestRec.analystRatingsSell || 0, color: '#ef4444' },
                                        { name: 'Strong Sell', value: latestRec.analystRatingsStrongSell || 0, color: '#dc2626' }
                                    ].filter(item => item.value > 0).map((entry, index) => (
                                        <Cell key={`cell - ${index} `} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem' }}
                                    itemStyle={{ color: '#E5E7EB' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Estimates Chart */}
            {hasEstimates && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <h3 className="text-lg font-semibold text-white">Stime Ricavi e Consenso</h3>

                        <div className="flex bg-gray-800 rounded-lg p-0.5">
                            {(["5Y", "10Y", "Max"] as const).map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRange(r)}
                                    className={`px - 3 py - 1 rounded - md text - sm font - medium transition - all ${range === r
                                        ? "bg-gray-700 text-white shadow-sm"
                                        : "text-gray-400 hover:text-gray-200"
                                        } `}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="year" stroke="#9CA3AF" />
                                <YAxis
                                    stroke="#9CA3AF"
                                    tickFormatter={(val) => formatCurrency(val, "USD").replace("USD", "")} // Simplified currency
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem' }}
                                    formatter={(value: number) => [formatCurrency(value, "USD"), '']}
                                />
                                <Legend />
                                <Bar dataKey="Revenue" fill="#3b82f6" name="Est. Revenue" />
                                <Bar dataKey="EBITDA" fill="#eab308" name="Est. EBITDA" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Detailed Table */}
            {hasEstimates && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-800 text-gray-400">
                                <tr>
                                    <th className="px-6 py-3">Periodo</th>
                                    <th className="px-6 py-3 text-right">Ricavi Stim.</th>
                                    <th className="px-6 py-3 text-right">EBITDA Stim.</th>
                                    <th className="px-6 py-3 text-right">EPS Stim.</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {[...estimates].slice(0, 10).map((est, i) => (
                                    <tr key={i} className="hover:bg-gray-800/50">
                                        <td className="px-6 py-3 text-gray-300">{est.date}</td>
                                        <td className="px-6 py-3 text-right text-gray-400">{formatCurrency(est.estimatedRevenueAvg)}</td>
                                        <td className="px-6 py-3 text-right text-gray-400">{formatCurrency(est.estimatedEbitdaAvg)}</td>
                                        <td className="px-6 py-3 text-right text-gray-400">{est.estimatedEpsAvg?.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
