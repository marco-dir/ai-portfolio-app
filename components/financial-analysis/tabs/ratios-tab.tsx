"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function KeyRatiosTab({ data }: { data: any[] }) {
    if (!data || data.length === 0) return <div className="p-4 text-gray-400">Nessun dato disponibile.</div>

    // Range Selector Logic
    const [range, setRange] = useState<"5Y" | "10Y" | "20Y" | "Max">("10Y")

    // Metric selection state - store selected metrics per group
    const [selectedMetrics, setSelectedMetrics] = useState<Record<string, string[]>>({})

    const getFilteredData = (data: any[]) => {
        if (range === "Max") return data
        // Since data is now quarterly, multiply years by 4 to get number of quarters
        const quarters = (range === "5Y" ? 5 : range === "10Y" ? 10 : 20) * 4
        return data.slice(0, quarters)
    }

    const filteredData = getFilteredData(data)

    // Ratio Groups
    const ratioGroups = [
        {
            title: "Redditività",
            metrics: [
                { label: "ROE", key: "returnOnEquity", color: "#3b82f6" },
                { label: "ROA", key: "returnOnAssets", color: "#10b981" },
                { label: "ROIC", key: "returnOnCapitalEmployed", color: "#8b5cf6" },
                { label: "ROI", key: "returnOnInvestment", color: "#f59e0b" },
                { label: "Margine Netto", key: "netProfitMargin", color: "#ef4444" },
                { label: "Margine Operativo", key: "operatingProfitMargin", color: "#06b6d4" },
                { label: "Margine Lordo", key: "grossProfitMargin", color: "#ec4899" },
            ]
        },
        {
            title: "Valutazione",
            metrics: [
                { label: "P/E", key: "priceEarningsRatio", color: "#3b82f6" },
                { label: "P/B", key: "priceToBookRatio", color: "#10b981" },
                { label: "P/S", key: "priceToSalesRatio", color: "#8b5cf6" },
                { label: "PEG", key: "pegRatio", color: "#f59e0b" },
                { label: "EV/Sales", key: "enterpriseValueMultiple", color: "#ef4444" },
                { label: "P/FCF", key: "priceToFreeCashFlowsRatio", color: "#06b6d4" },
            ]
        },
        {
            title: "Salute Finanziaria",
            metrics: [
                { label: "Debt/Equity", key: "debtEquityRatio", color: "#ef4444" },
                { label: "Current Ratio", key: "currentRatio", color: "#10b981" },
                { label: "Quick Ratio", key: "quickRatio", color: "#3b82f6" },
                { label: "Cash Ratio", key: "cashRatio", color: "#8b5cf6" },
                { label: "Interest Coverage", key: "interestCoverage", color: "#f59e0b" },
            ]
        },
        {
            title: "Efficienza",
            metrics: [
                { label: "Asset Turnover", key: "assetTurnover", color: "#3b82f6" },
                { label: "Inventory Turnover", key: "inventoryTurnover", color: "#10b981" },
                { label: "Receivables Turnover", key: "receivablesTurnover", color: "#8b5cf6" },
                { label: "Days Sales Outstanding", key: "daysOfSalesOutstanding", color: "#f59e0b" },
                { label: "Days Inventory Outstanding", key: "daysOfInventoryOutstanding", color: "#ef4444" },
                { label: "Days Payables Outstanding", key: "daysOfPayablesOutstanding", color: "#06b6d4" },
                { label: "Cash Conversion Cycle", key: "cashConversionCycle", color: "#ec4899" },
                { label: "Dividend Yield", key: "dividendYield", color: "#14b8a6" },
            ]
        }
    ]

    // Get selected metrics for a group (with defaults)
    const getSelectedMetricsForGroup = (groupTitle: string, metrics: any[]) => {
        if (selectedMetrics[groupTitle]) {
            return selectedMetrics[groupTitle]
        }
        // Default: select first metric
        return [metrics[0].key]
    }

    // Toggle metric selection for a group
    const toggleMetricForGroup = (groupTitle: string, metricKey: string, allMetrics: any[]) => {
        const current = getSelectedMetricsForGroup(groupTitle, allMetrics)
        let updated: string[]

        if (current.includes(metricKey)) {
            // Deselect - but keep at least one selected
            if (current.length > 1) {
                updated = current.filter(k => k !== metricKey)
            } else {
                return // Don't allow deselecting the last one
            }
        } else {
            // Select - limit to 5 metrics
            if (current.length < 5) {
                updated = [...current, metricKey]
            } else {
                return // Don't allow more than 5
            }
        }

        setSelectedMetrics(prev => ({
            ...prev,
            [groupTitle]: updated
        }))
    }

    return (
        <div className="space-y-8">
            {/* Range Selector */}
            <div className="flex items-center justify-end gap-4">
                <span className="text-sm text-gray-400 font-medium">Periodo:</span>
                <div className="flex bg-gray-800 rounded-lg p-0.5 gap-0.5">
                    {(["5Y", "10Y", "20Y", "Max"] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${range === r
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-gray-400 hover:text-gray-200"
                                }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {ratioGroups.map((group) => {
                const selected = getSelectedMetricsForGroup(group.title, group.metrics)
                const selectedMetricObjects = group.metrics.filter(m => selected.includes(m.key))

                // Prepare chart data - handle quarterly data with Q1/Q2/Q3/Q4 labels
                const chartData = filteredData.map(item => {
                    const date = new Date(item.date)
                    const year = date.getFullYear()
                    const month = date.getMonth()
                    // Determine quarter based on month
                    const quarter = month < 3 ? 'Q1' : month < 6 ? 'Q2' : month < 9 ? 'Q3' : 'Q4'
                    const label = `${quarter} ${year}`

                    const dataPoint: any = { period: label, year: year }
                    selectedMetricObjects.forEach(metric => {
                        const value = item[metric.key]
                        dataPoint[metric.key] = value !== null && value !== undefined ? value : null
                    })
                    return dataPoint
                }).reverse()

                return (
                    <div key={group.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">{group.title}</h3>

                        {/* Metric Selection Buttons */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {group.metrics.map((metric) => {
                                const isSelected = selected.includes(metric.key)
                                return (
                                    <button
                                        key={metric.key}
                                        onClick={() => toggleMetricForGroup(group.title, metric.key, group.metrics)}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border ${isSelected
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-gray-800 text-gray-400 hover:bg-gray-700 border-gray-700"
                                            }`}
                                    >
                                        {metric.label}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Chart */}
                        {selectedMetricObjects.length > 0 && (
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                        <XAxis dataKey="period" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                                        <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#1f2937",
                                                border: "1px solid #374151",
                                                borderRadius: "8px",
                                                color: "#fff"
                                            }}
                                        />
                                        <Legend />
                                        {selectedMetricObjects.map((metric) => (
                                            <Line
                                                key={metric.key}
                                                type="monotone"
                                                dataKey={metric.key}
                                                stroke={metric.color}
                                                strokeWidth={2}
                                                dot={{ r: 3 }}
                                                name={metric.label}
                                                connectNulls
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
