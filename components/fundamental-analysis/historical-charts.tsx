"use client"

import { useMemo } from "react"
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts"

interface HistoricalChartsProps {
    incomeStatements: any[]
    balanceSheets: any[]
    cashFlows: any[]
    dividendHistory: any[]
    currency: string
}

export function HistoricalCharts({
    incomeStatements,
    balanceSheets,
    cashFlows,
    dividendHistory,
    currency
}: HistoricalChartsProps) {
    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency

    // Prepare comprehensive financial data (30 years)
    const financialData = useMemo(() => {
        if (!incomeStatements || incomeStatements.length === 0) return []

        return incomeStatements
            .slice(0, 30)
            .reverse()
            .map((income, idx) => {
                const balance = balanceSheets?.find(b => b.date === income.date)
                const cashFlow = cashFlows?.find(cf => cf.date === income.date)
                const shares = income.weightedAverageShsOutDil || income.weightedAverageShsOut || 1

                const annualDividend = dividendHistory?.find(d => new Date(d.date).getFullYear() === new Date(income.date).getFullYear())

                return {
                    year: new Date(income.date).getFullYear().toString(),
                    // Revenue
                    revenue: income.revenue / 1000000000,
                    // EPS
                    eps: income.epsdiluted || income.eps || 0,
                    // Book Value per Share
                    bookValue: balance && shares ? (balance.totalStockholdersEquity || balance.totalEquity || 0) / shares : 0,
                    // Shares Outstanding (millions)
                    sharesOutstanding: shares / 1000000,
                    // Dividends per Share - use specific history or fallback to income statement
                    dividendPerShare: annualDividend ? annualDividend.dividend : (income.dividendPerShare || 0),
                    // Payout Ratio
                    payoutRatio: (annualDividend ? annualDividend.dividend : (income.dividendPerShare || 0)) && income.eps ? ((annualDividend ? annualDividend.dividend : (income.dividendPerShare || 0)) / income.eps) * 100 : 0,
                    // Margins
                    grossMargin: income.grossProfitRatio ? income.grossProfitRatio * 100 : 0,
                    // Debt/Equity
                    debtEquity: balance ? ((balance.totalDebt || balance.netDebt || 0) / (balance.totalStockholdersEquity || balance.totalEquity || 1)) * 100 : 0,
                    // Cash Flow per Share
                    operatingCFPerShare: cashFlow && shares ? (cashFlow.operatingCashFlow || 0) / shares : 0,
                    freeCFPerShare: cashFlow && shares ? (cashFlow.freeCashFlow || 0) / shares : 0,
                    investingCF: cashFlow ? (cashFlow.cashFlowFromInvestment || cashFlow.netCashUsedForInvestingActivites || 0) / 1000000000 : 0
                }
            })
    }, [incomeStatements, balanceSheets, cashFlows])

    if (financialData.length === 0) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Grafici Storici Finanziari</h3>
                <p className="text-gray-400">Dati non disponibili</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">Grafici Storici Finanziari (30 Anni)</h3>

            {/* Revenue & EPS */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Ricavi (Miliardi {currencySymbol})</h4>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financialData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="year" stroke="#9CA3AF" fontSize={11} angle={-45} textAnchor="end" height={80} />
                                <YAxis stroke="#9CA3AF" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem' }}
                                    formatter={(value: number) => [`${value.toFixed(2)}B`, 'Ricavi']}
                                />
                                <Bar dataKey="revenue" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">EPS ({currencySymbol})</h4>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financialData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="year" stroke="#9CA3AF" fontSize={11} angle={-45} textAnchor="end" height={80} />
                                <YAxis stroke="#9CA3AF" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem' }}
                                    formatter={(value: number) => [`${currencySymbol}${value.toFixed(2)}`, 'EPS']}
                                />
                                <Bar dataKey="eps" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Book Value & Debt/Equity */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Book Value per Share ({currencySymbol})</h4>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financialData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="year" stroke="#9CA3AF" fontSize={11} angle={-45} textAnchor="end" height={80} />
                                <YAxis stroke="#9CA3AF" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem' }}
                                    formatter={(value: number) => [`${currencySymbol}${value.toFixed(2)}`, 'Book Value']}
                                />
                                <Bar dataKey="bookValue" fill="#8b5cf6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Debt/Equity Ratio (%)</h4>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financialData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="year" stroke="#9CA3AF" fontSize={11} angle={-45} textAnchor="end" height={80} />
                                <YAxis stroke="#9CA3AF" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem' }}
                                    formatter={(value: number) => [`${value.toFixed(2)}%`, 'Debt/Equity']}
                                />
                                <Bar dataKey="debtEquity" fill="#ef4444" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Shares Outstanding & Dividends */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Azioni in Circolazione (Milioni)</h4>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financialData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="year" stroke="#9CA3AF" fontSize={11} angle={-45} textAnchor="end" height={80} />
                                <YAxis stroke="#9CA3AF" fontSize={12} domain={['auto', 'auto']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem' }}
                                    formatter={(value: number) => [`${value.toFixed(0)}M`, 'Azioni']}
                                />
                                <Bar dataKey="sharesOutstanding" fill="#f59e0b" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Dividendi per Azione ({currencySymbol})</h4>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financialData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="year" stroke="#9CA3AF" fontSize={11} angle={-45} textAnchor="end" height={80} />
                                <YAxis stroke="#9CA3AF" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem' }}
                                    formatter={(value: number) => [`${currencySymbol}${value.toFixed(2)}`, 'Dividendo']}
                                />
                                <Bar dataKey="dividendPerShare" fill="#06b6d4" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Payout Ratio & Gross Margin */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Payout Ratio (%)</h4>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financialData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="year" stroke="#9CA3AF" fontSize={11} angle={-45} textAnchor="end" height={80} />
                                <YAxis stroke="#9CA3AF" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem' }}
                                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Payout Ratio']}
                                />
                                <Bar dataKey="payoutRatio" fill="#ec4899" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Margine Lordo (%)</h4>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financialData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="year" stroke="#9CA3AF" fontSize={11} angle={-45} textAnchor="end" height={80} />
                                <YAxis stroke="#9CA3AF" fontSize={12} domain={['auto', 'auto']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem' }}
                                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Margine Lordo']}
                                />
                                <Bar dataKey="grossMargin" fill="#a855f7" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Cash Flow per Share & Investing Cash Flow */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Cash Flow per Share ({currencySymbol})</h4>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financialData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="year" stroke="#9CA3AF" fontSize={11} angle={-45} textAnchor="end" height={80} />
                                <YAxis stroke="#9CA3AF" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem' }}
                                    formatter={(value: number) => [`${currencySymbol}${value.toFixed(2)}`, '']}
                                />
                                <Legend />
                                <Bar dataKey="operatingCFPerShare" fill="#10b981" name="Operating CF/Share" />
                                <Bar dataKey="freeCFPerShare" fill="#3b82f6" name="Free CF/Share" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Cash Flow da Investimenti (Miliardi {currencySymbol})</h4>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financialData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="year" stroke="#9CA3AF" fontSize={11} angle={-45} textAnchor="end" height={80} />
                                <YAxis stroke="#9CA3AF" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem' }}
                                    formatter={(value: number) => [`${value.toFixed(2)}B`, 'Investing CF']}
                                />
                                <Bar dataKey="investingCF" fill="#f97316" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}
