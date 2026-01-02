import { Suspense } from "react"
import { getSuperInvestorHoldings, SUPERINVESTORS, getQuote } from "@/lib/fmp"
import { formatCurrency, formatNumber } from "@/lib/format-utils"
import Link from "next/link"
import { PieChart, Briefcase, TrendingUp } from "lucide-react"

// Client component for the chart needs to be separate if using recharts interactivity purely
// But let's build a simple server rendered view first or import client chart components
// We can reuse the PieChart we saw in other files or create a simple one.

import { ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { SuperinvestorChart } from "@/components/superinvestor/superinvestor-chart"

export const dynamic = 'force-dynamic' // Ensure we don't cache stale 13F data too long

export default async function SuperinvestorsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const initialCik = typeof params.cik === 'string' ? params.cik : SUPERINVESTORS[0].cik // Default to Buffett

    const selectedInvestor = SUPERINVESTORS.find(inv => inv.cik === initialCik) || SUPERINVESTORS[0]

    // Fetch data
    // We try a few dates if the default fails? 
    // For now, getSuperInvestorHoldings defaults to 2025-09-30 if no date passed
    // Modify lib/fmp.ts to accept date from params if we want history

    const holdings = await getSuperInvestorHoldings(initialCik)

    // Process data for charts
    // Top 10 holdings by value
    const sortedHoldings = [...holdings].sort((a, b) => b.marketValue - a.marketValue)
    const topHoldings = sortedHoldings.slice(0, 10)

    const totalValue = holdings.reduce((sum: number, item: any) => sum + item.marketValue, 0)

    const chartData = topHoldings.map((h: any) => ({
        name: h.symbol,
        value: h.marketValue,
        percent: (h.marketValue / totalValue) * 100
    }))

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <UsersIcon className="w-8 h-8 text-blue-500" />
                        Superinvestitori
                    </h1>
                    <p className="text-gray-400">Analizza i portafogli dei più grandi investitori del mondo (Dati 13F).</p>
                </div>

                {/* Investor Selector - Horizontal Scrollable List */}
                <div className="overflow-x-auto pb-4 custom-scrollbar">
                    <div className="flex gap-4">
                        {SUPERINVESTORS.map((inv) => (
                            <Link
                                key={inv.cik}
                                href={`/dashboard/superinvestitori?cik=${inv.cik}`}
                                className={`px-4 py-3 rounded-xl border whitespace-nowrap transition-all flex items-center gap-2 ${inv.cik === selectedInvestor.cik
                                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                                        : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white"
                                    }`}
                            >
                                <Briefcase size={16} />
                                <span className="font-medium">{inv.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {holdings && holdings.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Summary Card */}
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 lg:col-span-1">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <PieChart size={20} className="text-purple-500" />
                                Asset Allocation
                            </h2>
                            <div className="mb-6">
                                <p className="text-sm text-gray-400">Valore Totale Portafoglio</p>
                                <p className="text-2xl font-bold text-white">${formatNumber(totalValue)}</p>
                                <p className="text-xs text-gray-500 mt-1">Data: {holdings[0].dateReported}</p>
                            </div>

                            {/* Chart Component */}
                            <div className="h-[300px]">
                                <SuperinvestorChart data={chartData} />
                            </div>
                        </div>

                        {/* Holdings Table */}
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 lg:col-span-2">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <TrendingUp size={20} className="text-green-500" />
                                Top Holdings
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                                        <tr>
                                            <th className="px-6 py-3 rounded-l-lg">Simbolo</th>
                                            <th className="px-6 py-3">Nome (dal 13F)</th>
                                            <th className="px-6 py-3 text-right">Azioni</th>
                                            <th className="px-6 py-3 text-right">Valore</th>
                                            <th className="px-6 py-3 text-right rounded-r-lg">% Port.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {sortedHoldings.map((item: any, i: number) => {
                                            const percent = (item.marketValue / totalValue) * 100;
                                            return (
                                                <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-blue-400">
                                                        <Link href={`/dashboard/analisi-finanziaria?ticker=${item.symbol}`} className="hover:underline">
                                                            {item.symbol}
                                                        </Link>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-300 truncate max-w-[200px]">{item.companyName || item.symbol}</td>
                                                    <td className="px-6 py-4 text-right text-gray-300">{formatNumber(item.shares)}</td>
                                                    <td className="px-6 py-4 text-right text-white font-medium">${formatNumber(item.marketValue)}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <span className="text-gray-300">{percent.toFixed(2)}%</span>
                                                            <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                                                                <div className="h-full bg-blue-500" style={{ width: `${Math.min(percent, 100)}%` }} />
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                        <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Nessun dato disponibile</h3>
                        <p className="text-gray-400">Non siamo riusciti a recuperare i dati 13F per questo investitore al momento.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function UsersIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
