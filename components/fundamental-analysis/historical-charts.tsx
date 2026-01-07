"use client"

import { useMemo, useState, useEffect } from "react"
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
    symbol?: string
}

export function HistoricalCharts({
    incomeStatements: initialIncomeStatements,
    balanceSheets: initialBalanceSheets,
    cashFlows: initialCashFlows,
    dividendHistory,
    currency,
    symbol
}: HistoricalChartsProps) {
    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency
    const [period, setPeriod] = useState<'annual' | 'quarter'>('annual')
    const [loading, setLoading] = useState(false)
    const [incomeStatements, setIncomeStatements] = useState(initialIncomeStatements)
    const [balanceSheets, setBalanceSheets] = useState(initialBalanceSheets)
    const [cashFlows, setCashFlows] = useState(initialCashFlows)

    // Fetch data when period changes
    useEffect(() => {
        if (period === 'annual') {
            // Reset to initial data for annual
            setIncomeStatements(initialIncomeStatements)
            setBalanceSheets(initialBalanceSheets)
            setCashFlows(initialCashFlows)
            return
        }

        if (!symbol) return

        const fetchQuarterlyData = async () => {
            setLoading(true)
            try {
                const response = await fetch(`/api/stocks/statements?symbol=${symbol}&period=quarter`)
                if (response.ok) {
                    const data = await response.json()
                    setIncomeStatements(data.incomeStatements)
                    setBalanceSheets(data.balanceSheets)
                    setCashFlows(data.cashFlows)
                }
            } catch (error) {
                console.error("Error fetching quarterly data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchQuarterlyData()
    }, [period, symbol, initialIncomeStatements, initialBalanceSheets, initialCashFlows])

    // Prepare comprehensive financial data
    const financialData = useMemo(() => {
        if (!incomeStatements || incomeStatements.length === 0) return []

        const dataLimit = period === 'quarter' ? 120 : 30

        return incomeStatements
            .slice(0, dataLimit)
            .reverse()
            .map((income, idx) => {
                const balance = balanceSheets?.find(b => b.date === income.date)
                const cashFlow = cashFlows?.find(cf => cf.date === income.date)
                const shares = income.weightedAverageShsOutDil || income.weightedAverageShsOut || 1

                const annualDividend = dividendHistory?.find(d => new Date(d.date).getFullYear() === new Date(income.date).getFullYear())

                // Format label based on period
                const date = new Date(income.date)
                let label: string
                if (period === 'quarter') {
                    const quarter = Math.ceil((date.getMonth() + 1) / 3)
                    label = `Q${quarter} ${date.getFullYear().toString().slice(-2)}`
                } else {
                    label = date.getFullYear().toString()
                }

                return {
                    year: label,

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
    }, [incomeStatements, balanceSheets, cashFlows, dividendHistory, period])

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-2xl font-bold text-white">
                    Grafici Storici Finanziari {period === 'annual' ? '(30 Anni)' : '(Trimestrali)'}
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPeriod('annual')}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${period === 'annual'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Annuale
                    </button>
                    <button
                        onClick={() => setPeriod('quarter')}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${period === 'quarter'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Trimestrale
                    </button>
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-400">Caricamento dati trimestrali...</span>
                </div>
            )}


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
                                    formatter={(value: any) => [`${value.toFixed(2)}B`, 'Ricavi']}
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
                                    formatter={(value: any) => [`${currencySymbol}${value.toFixed(2)}`, 'EPS']}
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
                                    formatter={(value: any) => [`${currencySymbol}${value.toFixed(2)}`, 'Book Value']}
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
                                    formatter={(value: any) => [`${value.toFixed(2)}%`, 'Debt/Equity']}
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
                                    formatter={(value: any) => [`${value.toFixed(0)}M`, 'Azioni']}
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
                                    formatter={(value: any) => [`${currencySymbol}${value.toFixed(2)}`, 'Dividendo']}
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
                                    formatter={(value: any) => [`${value.toFixed(1)}%`, 'Payout Ratio']}
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
                                    formatter={(value: any) => [`${value.toFixed(1)}%`, 'Margine Lordo']}
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
                                    formatter={(value: any) => [`${currencySymbol}${value.toFixed(2)}`, '']}
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
                                    formatter={(value: any) => [`${value.toFixed(2)}B`, 'Investing CF']}
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
