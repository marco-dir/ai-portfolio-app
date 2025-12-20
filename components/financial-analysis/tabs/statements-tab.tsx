"use client"

import { useState } from "react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts"
import { formatCurrency } from "@/lib/format-utils"

interface StatementItem {
    label: string
    key: string
    color?: string
}

interface FinancialStatementsTabProps {
    data: any[]
    type: "income" | "balance" | "cashflow"
    currency: string
}

export function FinancialStatementsTab({ data, type, currency }: FinancialStatementsTabProps) {
    if (!data || data.length === 0) {
        return <div className="p-4 text-gray-400">Nessun dato disponibile.</div>
    }

    // Define columns/metrics based on statement type
    let metrics: StatementItem[] = []

    if (type === "income") {
        metrics = [
            { label: "Ricavi", key: "revenue", color: "#3b82f6" },
            { label: "Costo Venduto", key: "costOfRevenue", color: "#ef4444" },
            { label: "Utile Lordo", key: "grossProfit", color: "#22c55e" },
            { label: "Spese R&D", key: "researchAndDevelopmentExpenses", color: "#a855f7" },
            { label: "Spese Generali", key: "generalAndAdministrativeExpenses", color: "#f97316" },
            { label: "Spese Vendita/Marketing", key: "sellingAndMarketingExpenses", color: "#06b6d4" },
            { label: "Utile Operativo", key: "operatingIncome", color: "#eab308" },
            { label: "Interessi Passivi", key: "interestExpense", color: "#dc2626" },
            { label: "Utile ante Imposte", key: "incomeBeforeTax", color: "#8b5cf6" },
            { label: "Imposte", key: "incomeTaxExpense", color: "#ec4899" },
            { label: "Utile Netto", key: "netIncome", color: "#10b981" },
            { label: "EBITDA", key: "ebitda", color: "#14b8a6" },
            { label: "EPS", key: "eps", color: "#f59e0b" },
            { label: "EPS Diluito", key: "epsdiluted", color: "#06b6d4" },
            { label: "Azioni Outstanding", key: "weightedAverageShsOut", color: "#8b5cf6" },
            { label: "Azioni Diluite", key: "weightedAverageShsOutDil", color: "#a855f7" }
        ]
    } else if (type === "balance") {
        metrics = [
            { label: "Attività Totali", key: "totalAssets", color: "#3b82f6" },
            { label: "Attività Correnti", key: "totalCurrentAssets", color: "#06b6d4" },
            { label: "Cassa & Eq.", key: "cashAndCashEquivalents", color: "#22c55e" },
            { label: "Investimenti a Breve", key: "shortTermInvestments", color: "#10b981" },
            { label: "Crediti Correnti", key: "netReceivables", color: "#8b5cf6" },
            { label: "Inventario", key: "inventory", color: "#f97316" },
            { label: "Attività Non Correnti", key: "totalNonCurrentAssets", color: "#14b8a6" },
            { label: "Immobilizzazioni", key: "propertyPlantEquipmentNet", color: "#a855f7" },
            { label: "Goodwill", key: "goodwill", color: "#ec4899" },
            { label: "Attività Intangibili", key: "intangibleAssets", color: "#f59e0b" },
            { label: "Passività Totali", key: "totalLiabilities", color: "#ef4444" },
            { label: "Passività Correnti", key: "totalCurrentLiabilities", color: "#dc2626" },
            { label: "Debiti Commerciali", key: "accountPayables", color: "#b91c1c" },
            { label: "Debito a Breve", key: "shortTermDebt", color: "#991b1b" },
            { label: "Debito a Lungo", key: "longTermDebt", color: "#7f1d1d" },
            { label: "Debito Totale", key: "totalDebt", color: "#dc2626" },
            { label: "Patrimonio Netto", key: "totalStockholdersEquity", color: "#22c55e" },
            { label: "Utili Portati a Nuovo", key: "retainedEarnings", color: "#16a34a" }
        ]
    } else if (type === "cashflow") {
        metrics = [
            { label: "Flusso Op.", key: "operatingCashFlow", color: "#22c55e" },
            { label: "Utile Netto", key: "netIncome", color: "#10b981" },
            { label: "Ammortamenti", key: "depreciationAndAmortization", color: "#06b6d4" },
            { label: "Stock-Based Comp.", key: "stockBasedCompensation", color: "#14b8a6" },
            { label: "Variaz. Capitale Circ.", key: "changeInWorkingCapital", color: "#8b5cf6" },
            { label: "Flusso Investimenti", key: "netCashUsedForInvestingActivites", color: "#ef4444" },
            { label: "Capex", key: "capitalExpenditure", color: "#dc2626" },
            { label: "Investimenti", key: "investmentsInPropertyPlantAndEquipment", color: "#b91c1c" },
            { label: "Acquisizioni", key: "acquisitionsNet", color: "#991b1b" },
            { label: "Flusso Fin.", key: "netCashUsedProvidedByFinancingActivities", color: "#3b82f6" },
            { label: "Emissione Debito", key: "debtRepayment", color: "#2563eb" },
            { label: "Riacquisto Azioni", key: "commonStockRepurchased", color: "#1d4ed8" },
            { label: "Dividendi Pagati", key: "dividendsPaid", color: "#eab308" },
            { label: "Free Cash Flow", key: "freeCashFlow", color: "#f59e0b" }
        ]
    }

    const [selectedMetrics, setSelectedMetrics] = useState<string[]>([metrics[0].key, metrics[metrics.length - 2].key])

    const toggleMetric = (key: string) => {
        if (selectedMetrics.includes(key)) {
            setSelectedMetrics(selectedMetrics.filter(k => k !== key))
        } else {
            setSelectedMetrics([...selectedMetrics, key])
        }
    }

    // Sort data chronologically
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Range Selector Logic
    const [range, setRange] = useState<"5Y" | "10Y" | "20Y" | "Max">("10Y")

    const getFilteredData = (data: any[]) => {
        if (range === "Max") return data
        const years = range === "5Y" ? 5 : range === "10Y" ? 10 : 20
        // Data is usually sorted DESC (newest first). So taking first N items gives recent N years.
        return data.slice(0, years)
    }

    const filteredData = getFilteredData(data)

    // Table Data (Reverse Chronological - same as filtered)
    const tableData = [...filteredData]

    // Sort data chronologically for the chart
    const chartData = [...filteredData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(item => ({
        ...item,
        year: item.date.split("-")[0]
    }))

    return (
        <div className="space-y-6">
            {/* Chart Section */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2 md:mb-0">Andamento Storico</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        {/* Range Selector */}
                        <div className="flex items-center gap-4">
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

                        <div className="flex gap-2 flex-wrap">
                            {metrics.map(metric => (
                                <button
                                    key={metric.key}
                                    onClick={() => toggleMetric(metric.key)}
                                    className={`px - 3 py - 1 rounded text - xs font - medium transition - colors border ${selectedMetrics.includes(metric.key)
                                        ? `bg-gray-800 text-white border-gray-600`
                                        : "bg-transparent text-gray-500 border-gray-800 hover:border-gray-700"
                                        } `}
                                    style={{
                                        borderColor: selectedMetrics.includes(metric.key) ? metric.color : undefined,
                                        color: selectedMetrics.includes(metric.key) ? metric.color : undefined
                                    }}
                                >
                                    {metric.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis
                                dataKey="year"
                                stroke="#9CA3AF"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#9CA3AF"
                                fontSize={12}
                                tickFormatter={(val) => formatCurrency(val, currency).replace(currency, '')}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem' }}
                                itemStyle={{ color: '#E5E7EB' }}
                                formatter={(value: any) => [formatCurrency(value, currency), '']}
                            />
                            <Legend />
                            {metrics.map(metric => (
                                selectedMetrics.includes(metric.key) && (
                                    <Bar
                                        key={metric.key}
                                        dataKey={metric.key}
                                        name={metric.label}
                                        fill={metric.color}
                                        radius={[4, 4, 0, 0]}
                                    />
                                )
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-800 text-gray-400">
                            <tr>
                                <th className="px-6 py-3 font-medium whitespace-nowrap sticky left-0 bg-gray-800 z-10">Metrica</th>
                                {tableData.map((period, i) => (
                                    <th key={i} className="px-6 py-3 font-medium whitespace-nowrap">
                                        {period.date.split('-')[0]}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {metrics.map((metric) => (
                                <tr key={metric.key} className="hover:bg-gray-800/50">
                                    <td className="px-6 py-3 font-medium text-gray-300 sticky left-0 bg-gray-900 z-10 border-r border-gray-800">
                                        {metric.label}
                                    </td>
                                    {tableData.map((period, i) => (
                                        <td key={i} className="px-6 py-3 text-gray-400 whitespace-nowrap">
                                            {formatCurrency(period[metric.key], currency)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {/* Detailed Rows */}
                            {type === "income" && (
                                <>
                                    <tr className="hover:bg-gray-800/50"><td className="px-6 py-3 text-gray-500 pl-8 sticky left-0 bg-gray-900 border-r border-gray-800">EPS</td>
                                        {tableData.map((d, i) => <td key={i} className="px-6 py-3 text-gray-400">{d.eps?.toFixed(2)}</td>)}
                                    </tr>
                                    <tr className="hover:bg-gray-800/50"><td className="px-6 py-3 text-gray-500 pl-8 sticky left-0 bg-gray-900 border-r border-gray-800">EPS Diluted</td>
                                        {tableData.map((d, i) => <td key={i} className="px-6 py-3 text-gray-400">{d.epsdiluted?.toFixed(2)}</td>)}
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
