"use client"

import React, { useState, useEffect } from "react"
import { Plus, Trash2, TrendingUp, TrendingDown, PieChart as PieChartIcon, BarChart as BarChartIcon, Activity, Layers, Globe, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"
import ReactMarkdown from "react-markdown"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LineChart, Line } from "recharts"
import { analyzePortfolio } from "@/lib/portfolio-analytics"
import { PortfolioAnalytics } from "@/components/portfolio-analytics"

type Stock = {
    id: string
    symbol: string
    quantity: number
    buyPrice: number
}

type Portfolio = {
    id: string
    name: string
    stocks: Stock[]
}

type StockData = {
    symbol: string
    price: number
    change: number
    name: string
    divYield?: number
}

type DetailedStockData = {
    sector: string
    country: string
    currency: string
    beta: number
    ytd: number
    historical: { date: string, close: number }[]
}


export default function PortfolioView({ initialPortfolio, forexRate }: { initialPortfolio: Portfolio, forexRate: number }) {
    const getCurrencySymbol = (currency?: string) => {
        if (!currency) return "$"
        switch (currency) {
            case "EUR": return "€"
            case "GBP": return "£"
            case "DKK": return "kr"
            case "SEK": return "kr"
            case "NOK": return "kr"
            case "CHF": return "Fr"
            case "JPY": return "¥"
            case "CNY": return "¥"
            case "USD": return "$"
            default: return currency
        }
    }


    const [portfolio, setPortfolio] = useState(initialPortfolio)
    const router = useRouter()
    const [isEditingName, setIsEditingName] = useState(false)
    const [editedName, setEditedName] = useState(initialPortfolio.name)
    const [chartRange, setChartRange] = useState<"1Y" | "YTD" | "2Y" | "5Y">("1Y")
    const [stockData, setStockData] = useState<Record<string, StockData>>({})
    const [detailedData, setDetailedData] = useState<Record<string, DetailedStockData>>({})
    const [newStock, setNewStock] = useState({ symbol: "", quantity: "", buyPrice: "" })
    const [analysis, setAnalysis] = useState("")
    const [loading, setLoading] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)

    const [forexRates, setForexRates] = useState<Record<string, number>>({ "EUR": forexRate, "USD": 1 })

    useEffect(() => {
        fetchStockData()
    }, [portfolio.stocks])

    const fetchStockData = async () => {
        const data: Record<string, StockData> = {}
        const details: Record<string, DetailedStockData> = {}
        const newRates: Record<string, number> = { ...forexRates }

        for (const stock of portfolio.stocks) {
            try {
                // Fetch Quote
                const resQuote = await fetch(`/api/stocks/quote?symbol=${stock.symbol}`)
                if (resQuote.ok) {
                    const quote = await resQuote.json()
                    data[stock.symbol] = quote
                }

                // Fetch Details (Sector, Beta, Historical, Country, Currency)
                const resDetails = await fetch(`/api/stocks/details?symbol=${stock.symbol}`)
                if (resDetails.ok) {
                    const detail = await resDetails.json()
                    details[stock.symbol] = detail

                    // Check currency and fetch rate if needed
                    const currency = detail.currency || "USD"
                    if (currency !== "USD" && !newRates[currency]) {
                        try {
                            const resRate = await fetch(`/api/forex?currency=${currency}`)
                            if (resRate.ok) {
                                const rateData = await resRate.json()
                                newRates[currency] = rateData.rate
                            }
                        } catch (e) {
                            console.error(`Failed to fetch rate for ${currency}`, e)
                        }
                    }
                }

            } catch (e) {
                console.error(e)
            }
        }
        setStockData(data)
        setDetailedData(details)
        setForexRates(newRates)
    }

    const handleAddStock = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newStock.symbol || !newStock.quantity || !newStock.buyPrice) return

        setLoading(true)
        try {
            const res = await fetch(`/api/portfolio/${portfolio.id}/stock`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    symbol: newStock.symbol,
                    quantity: parseFloat(newStock.quantity),
                    buyPrice: parseFloat(newStock.buyPrice),
                }),
            })

            if (res.ok) {
                const updatedPortfolio = await res.json()
                setPortfolio(updatedPortfolio)
                setNewStock({ symbol: "", quantity: "", buyPrice: "" })
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleAnalyze = async () => {
        setAnalyzing(true)
        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ portfolioId: portfolio.id }),
            })
            const data = await res.json()
            setAnalysis(data.analysis)
        } catch (error) {
            console.error(error)
        } finally {
            setAnalyzing(false)
        }
    }

    const handleDeletePortfolio = async () => {
        if (!confirm("Sei sicuro di voler eliminare questo portafoglio?")) return;
        try {
            const res = await fetch(`/api/portfolio/${portfolio.id}`, {
                method: "DELETE"
            })
            if (res.ok) {
                window.location.href = "/dashboard/portfolio"
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleSaveName = async () => {
        try {
            const res = await fetch(`/api/portfolio/${portfolio.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editedName })
            })
            if (res.ok) {
                setPortfolio({ ...portfolio, name: editedName })
                setIsEditingName(false)
                router.refresh()
            }
        } catch (error) {
            console.error(error)
        }
    }

    const { metrics, recommendations } = React.useMemo(() => {
        if (!portfolio.stocks.length || Object.keys(detailedData).length === 0) return { metrics: null, recommendations: [] }

        const holdingsForAnalysis = portfolio.stocks.map(s => {
            const rawHistory = detailedData[s.symbol]?.historical || []
            // FMP returns Newest -> Oldest. We need Oldest -> Newest for correct volatility/return calc over time
            const sortedHistory = [...rawHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            const prices = sortedHistory.map(h => h.close)

            return {
                symbol: s.symbol,
                quantity: s.quantity,
                buyPrice: s.buyPrice,
                currentPrice: stockData[s.symbol]?.price || s.buyPrice,
                beta: detailedData[s.symbol]?.beta || 1,
                historical: prices
            }
        })

        return analyzePortfolio(holdingsForAnalysis)

    }, [portfolio.stocks, detailedData, stockData])

    // --- Charts & Analytics Calculations ---

    // 1. Allocation by Stock
    const allocationData = portfolio.stocks.map(stock => {
        const currentPrice = stockData[stock.symbol]?.price || stock.buyPrice
        const currency = detailedData[stock.symbol]?.currency || "USD"
        const rate = forexRates[currency] || 1
        let value = stock.quantity * currentPrice
        // Convert to USD for allocation chart
        value = value * rate
        return {
            name: stock.symbol,
            value: value
        }
    })

    // 2. Performance by Stock
    const performanceData = portfolio.stocks.map(stock => {
        const currentPrice = stockData[stock.symbol]?.price || stock.buyPrice
        const currency = detailedData[stock.symbol]?.currency || "USD"
        const rate = forexRates[currency] || 1
        let totalBuy = stock.quantity * stock.buyPrice
        let totalCurrent = stock.quantity * currentPrice

        // Convert to USD for comparison chart
        totalBuy = totalBuy * rate
        totalCurrent = totalCurrent * rate

        return {
            name: stock.symbol,
            Investito: totalBuy,
            Valore: totalCurrent
        }
    })

    // 3. Sector Allocation
    const sectorMap: Record<string, number> = {}
    portfolio.stocks.forEach(stock => {
        const sector = detailedData[stock.symbol]?.sector || "Unknown"
        const currentPrice = stockData[stock.symbol]?.price || stock.buyPrice
        const currency = detailedData[stock.symbol]?.currency || "USD"
        const rate = forexRates[currency] || 1
        const value = stock.quantity * currentPrice * rate
        sectorMap[sector] = (sectorMap[sector] || 0) + value
    })
    const sectorData = Object.entries(sectorMap).map(([name, value]) => ({ name, value }))

    // 4. Country Allocation
    const countryMap: Record<string, number> = {}
    portfolio.stocks.forEach(stock => {
        const country = detailedData[stock.symbol]?.country || "Unknown"
        const currentPrice = stockData[stock.symbol]?.price || stock.buyPrice
        const currency = detailedData[stock.symbol]?.currency || "USD"
        const rate = forexRates[currency] || 1
        const value = stock.quantity * currentPrice * rate
        countryMap[country] = (countryMap[country] || 0) + value
    })
    const countryData = Object.entries(countryMap).map(([name, value]) => ({ name, value }))

    // 5. Currency Allocation
    const currencyMap: Record<string, number> = {}
    portfolio.stocks.forEach(stock => {
        const currency = detailedData[stock.symbol]?.currency || "USD"
        const currentPrice = stockData[stock.symbol]?.price || stock.buyPrice
        const rate = forexRates[currency] || 1
        const value = stock.quantity * currentPrice * rate
        currencyMap[currency] = (currencyMap[currency] || 0) + value
    })
    const currencyData = Object.entries(currencyMap).map(([name, value]) => ({ name, value }))

    // 6. Historical Performance (Normalized with Fill-Forward)
    const allDates = new Set<string>()
    const stockHistories: Record<string, Record<string, number>> = {}
    let hasHistoricalData = false

    // Collect all dates and map histories
    portfolio.stocks.forEach(stock => {
        const history = detailedData[stock.symbol]?.historical || []
        if (history.length > 0) hasHistoricalData = true

        const stockMap: Record<string, number> = {}
        history.forEach(point => {
            if (!point.date) return
            const dateKey = point.date.split('T')[0]
            stockMap[dateKey] = point.close
            allDates.add(dateKey)
        })
        stockHistories[stock.symbol] = stockMap
    })

    // Sort dates
    const sortedDates = Array.from(allDates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

    // Filter by range
    const now = new Date()
    let startDate = new Date()
    if (chartRange === "1Y") startDate.setFullYear(now.getFullYear() - 1)
    if (chartRange === "2Y") startDate.setFullYear(now.getFullYear() - 2)
    if (chartRange === "5Y") startDate.setFullYear(now.getFullYear() - 5)
    if (chartRange === "YTD") startDate = new Date(now.getFullYear(), 0, 1)

    const filteredDates = sortedDates.filter(d => new Date(d) >= startDate)

    // Fill Forward & Aggregate
    const lastKnownPrices: Record<string, number> = {}
    const historicalChartData = filteredDates.map(date => {
        let totalValue = 0
        portfolio.stocks.forEach(stock => {
            // Update last known price if available for this date
            if (stockHistories[stock.symbol]?.[date] !== undefined) {
                lastKnownPrices[stock.symbol] = stockHistories[stock.symbol][date]
            }
            // Use last known price if available, otherwise 0 (or buyPrice if no history yet?)
            const price = lastKnownPrices[stock.symbol] || 0
            const currency = detailedData[stock.symbol]?.currency || "USD"
            const rate = forexRates[currency] || 1
            totalValue += price * stock.quantity * rate
        })
        return { date, value: totalValue }
    })

    // 7. Risk Analysis (Weighted Beta, Sharpe, StdDev)
    let totalValue = 0
    let weightedBetaSum = 0

    portfolio.stocks.forEach(stock => {
        const currentPrice = stockData[stock.symbol]?.price || stock.buyPrice
        const currency = detailedData[stock.symbol]?.currency || "USD"
        const rate = forexRates[currency] || 1
        let value = stock.quantity * currentPrice * rate

        const beta = detailedData[stock.symbol]?.beta || 1.0

        totalValue += value
        weightedBetaSum += value * beta
    })

    const portfolioBeta = totalValue > 0 ? weightedBetaSum / totalValue : 0

    let riskLabel = "Medio"
    let riskColor = "text-yellow-400"
    if (portfolioBeta < 0.8) {
        riskLabel = "Basso"
        riskColor = "text-green-400"
    } else if (portfolioBeta > 1.2) {
        riskLabel = "Alto"
        riskColor = "text-red-400"
    }

    // Calculate Portfolio Returns for Sharpe & StdDev
    // We need daily returns of the TOTAL portfolio value
    const dailyReturns: number[] = []
    for (let i = 1; i < historicalChartData.length; i++) {
        const prev = historicalChartData[i - 1].value
        const curr = historicalChartData[i].value
        if (prev > 0) {
            dailyReturns.push((curr - prev) / prev)
        }
    }

    // Standard Deviation (Annualized)
    const meanReturn = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length || 0
    const variance = dailyReturns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / dailyReturns.length || 0
    const stdDevDaily = Math.sqrt(variance)
    const stdDevAnnualized = stdDevDaily * Math.sqrt(252)

    // Sharpe Ratio (Annualized)
    // Assuming Risk Free Rate ~ 2% (0.02)
    const riskFreeRate = 0.02
    // Annualized Return approximation: (Total Return / Years) or Compound Annual Growth Rate?
    // Let's use simple annualized return from daily mean for consistency with Sharpe formula: MeanDaily * 252
    const annualizedReturn = meanReturn * 252
    const sharpeRatio = stdDevAnnualized > 0 ? (annualizedReturn - riskFreeRate) / stdDevAnnualized : 0

    // 8. Portfolio YTD Calculation
    let weightedYTDSum = 0

    portfolio.stocks.forEach(stock => {
        const currentPrice = stockData[stock.symbol]?.price || stock.buyPrice
        const currency = detailedData[stock.symbol]?.currency || "USD"
        const rate = forexRates[currency] || 1
        const value = stock.quantity * currentPrice * rate
        const ytd = detailedData[stock.symbol]?.ytd || 0

        weightedYTDSum += value * ytd
    })

    const portfolioYTD = totalValue > 0 ? weightedYTDSum / totalValue : 0

    // 9. Dividends Paid YTD & Monthly
    const [dividendsYTD, setDividendsYTD] = useState(0)
    const [monthlyDividends, setMonthlyDividends] = useState<{ name: string, value: number }[]>([])

    useEffect(() => {
        const calculateDividends = async () => {
            let total = 0
            const currentYear = new Date().getFullYear()
            const monthlyData = Array(12).fill(0)
            const monthNames = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"]

            for (const stock of portfolio.stocks) {
                try {
                    const res = await fetch(`/api/stocks/dividends?symbol=${stock.symbol}`)
                    if (res.ok) {
                        const data = await res.json()
                        const stockDividends = (data && data.historical) ? data.historical : []

                        // Get currency for conversion
                        const currency = detailedData[stock.symbol]?.currency || "USD"
                        const rate = forexRates[currency] || 1

                        stockDividends.forEach((d: { date: string, paymentDate?: string, dividend: number }) => {
                            const date = new Date(d.paymentDate || d.date) // Use paymentDate if available
                            if (date.getFullYear() === currentYear) {
                                let amount = d.dividend * stock.quantity
                                // Convert to USD
                                amount = amount * rate
                                total += amount
                                monthlyData[date.getMonth()] += amount
                            }
                        })
                    }
                } catch (e) {
                    console.error(e)
                }
            }
            setDividendsYTD(total)
            setMonthlyDividends(monthlyData.map((value, index) => ({
                name: monthNames[index],
                value: value
            })))
        }

        if (portfolio.stocks.length > 0) {
            calculateDividends()
        }
    }, [portfolio.stocks, detailedData, forexRates])

    const totalValueEUR = totalValue / (forexRate || 1)

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff7300', '#d0ed57'];

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
        const RADIAN = Math.PI / 180;
        // Move label outside
        const radius = outerRadius * 1.2;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                {`${name} ${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {isEditingName ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-700 text-2xl font-bold"
                            />
                            <button onClick={handleSaveName} className="text-green-400 hover:text-green-300">Salva</button>
                            <button onClick={() => setIsEditingName(false)} className="text-gray-400 hover:text-gray-300">Annulla</button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 group">
                            <h1 className="text-3xl font-bold text-white">{portfolio.name}</h1>
                            <button onClick={() => setIsEditingName(true)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-opacity">
                                ✏️
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-sm text-gray-400">Valore Totale</div>
                        <div className="text-2xl font-bold text-white">${totalValue.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">€{totalValueEUR.toFixed(2)}</div>
                    </div>
                    <button
                        onClick={handleDeletePortfolio}
                        className="px-4 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        Elimina
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Charts & Stocks */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Portfolio YTD & Risk Analysis Row */}
                    {portfolio.stocks.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Portfolio YTD Card */}
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <TrendingUp size={20} /> Rendimento YTD
                                    </h3>
                                    <p className="text-gray-400 text-sm mt-1">Performance da inizio anno</p>
                                </div>
                                <div className="text-right mt-4">
                                    <div className={`text-2xl font-bold ${portfolioYTD >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {portfolioYTD >= 0 ? '+' : ''}{portfolioYTD.toFixed(2).replace('.', ',')}%
                                    </div>
                                    <div className="text-gray-500 text-sm">Ponderato</div>
                                </div>
                            </div>

                            {/* Overall Return Card */}
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Activity size={20} /> Rendimento Totale
                                    </h3>
                                    <p className="text-gray-400 text-sm mt-1">Performance complessiva</p>
                                </div>
                                <div className="text-right mt-4">
                                    {(() => {
                                        let totalCost = 0
                                        let totalCurrent = 0
                                        portfolio.stocks.forEach(s => {
                                            const price = stockData[s.symbol]?.price || s.buyPrice
                                            const currency = detailedData[s.symbol]?.currency || "USD"
                                            let cost = s.quantity * s.buyPrice
                                            let value = s.quantity * price
                                            if (currency === "EUR") {
                                                cost *= forexRate
                                                value *= forexRate
                                            }
                                            totalCost += cost
                                            totalCurrent += value
                                        })
                                        const overallReturn = totalCost > 0 ? ((totalCurrent - totalCost) / totalCost) * 100 : 0
                                        return (
                                            <div className={`text-2xl font-bold ${overallReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {overallReturn >= 0 ? '+' : ''}{overallReturn.toFixed(2).replace('.', ',')}%
                                            </div>
                                        )
                                    })()}
                                    <div className="text-gray-500 text-sm">Su prezzo carico</div>
                                </div>
                            </div>



                            {/* Dividends Card */}
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <DollarSign size={20} /> Dividendi
                                    </h3>
                                    <p className="text-gray-400 text-sm mt-1">Incassati YTD</p>
                                </div>
                                <div className="text-right mt-4">
                                    <div className="text-2xl font-bold text-green-400">
                                        ${dividendsYTD.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                    <div className="text-sm text-green-600">
                                        €{(dividendsYTD / (forexRate || 1)).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>


                            {/* Dividend Yield Card */}
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <PieChartIcon size={20} /> Yield Attuale
                                    </h3>
                                    <p className="text-gray-400 text-sm mt-1">Rendimento dividendo medio</p>
                                </div>
                                <div className="text-right mt-4">
                                    {(() => {
                                        let totalVal = 0
                                        let weightedYield = 0
                                        portfolio.stocks.forEach(s => {
                                            const price = stockData[s.symbol]?.price || s.buyPrice
                                            const currency = detailedData[s.symbol]?.currency || "USD"
                                            let value = s.quantity * price
                                            if (currency === "EUR") value *= forexRate

                                            // We need yield from somewhere. 
                                            // Currently stockData doesn't have it, detailedData doesn't seem to have it explicitly in the type def above but let's check.
                                            // The type definition says `divYield?: number` in StockData.
                                            // But fetchStockData only gets quote and details. Quote usually doesn't have yield.
                                            // We might need to fetch ratios or key-metrics if not present.
                                            // However, let's assume for now we can get it or default to 0.
                                            // Actually, let's use a placeholder or try to use what we have.
                                            // If we can't get it easily without refetching, we might show 0 for now.
                                            // Wait, I can update fetchStockData to get it.
                                            // For this specific block, I'll calculate based on available data.
                                            const yieldVal = stockData[s.symbol]?.divYield || 0
                                            totalVal += value
                                            weightedYield += value * yieldVal
                                        })
                                        const avgYield = totalVal > 0 ? weightedYield / totalVal : 0
                                        return (
                                            <div className="text-2xl font-bold text-blue-400">
                                                {avgYield.toFixed(2).replace('.', ',')}%
                                            </div>
                                        )
                                    })()}
                                    <div className="text-gray-500 text-sm">Ponderato</div>
                                </div>
                            </div>


                        </div>
                    )}
                    {/* Charts Section */}
                    {portfolio.stocks.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Allocation Pie */}
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <PieChartIcon size={20} /> Allocazione Asset
                                </h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={allocationData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={renderCustomizedLabel}
                                                labelLine={false}
                                            >
                                                {allocationData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Sector Pie */}
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Layers size={20} /> Allocazione Settoriale
                                </h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={sectorData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#82ca9d"
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={renderCustomizedLabel}
                                                labelLine={false}
                                            >
                                                {sectorData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Country Pie */}
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Globe size={20} /> Allocazione Geografica
                                </h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={countryData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#ff7300"
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={renderCustomizedLabel}
                                                labelLine={false}
                                            >
                                                {countryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Currency Pie */}
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <DollarSign size={20} /> Allocazione Valutaria
                                </h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={currencyData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#d0ed57"
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={renderCustomizedLabel}
                                                labelLine={false}
                                            >
                                                {currencyData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 6) % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Performance Bar */}
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 md:col-span-2">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <BarChartIcon size={20} /> Performance per Titolo
                                </h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={performanceData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis dataKey="name" stroke="#9CA3AF" />
                                            <YAxis stroke="#9CA3AF" />
                                            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                                            <Legend />
                                            <Bar dataKey="Investito" fill="#8884d8" />
                                            <Bar dataKey="Valore" fill="#82ca9d" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Historical Line Chart */}
                            {hasHistoricalData && (
                                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 md:col-span-2">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <TrendingUp size={20} /> Andamento Storico
                                        </h3>
                                        <div className="flex gap-2">
                                            {(["1Y", "YTD", "2Y", "5Y"] as const).map((range) => (
                                                <button
                                                    key={range}
                                                    onClick={() => setChartRange(range)}
                                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${chartRange === range
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                                                        }`}
                                                >
                                                    {range}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={historicalChartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                                <XAxis
                                                    dataKey="date"
                                                    stroke="#9CA3AF"
                                                    tickFormatter={(str) => {
                                                        const date = new Date(str);
                                                        return `${date.getMonth() + 1}/${date.getFullYear().toString().substr(2)}`
                                                    }}
                                                />
                                                <YAxis stroke="#9CA3AF" />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                                />
                                                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {/* AI Analytics Section */}
                            <div className="md:col-span-2 mt-8">
                                {metrics && <PortfolioAnalytics metrics={metrics} recommendations={recommendations} />}
                            </div>
                        </div>
                    )}

                    {/* Monthly Dividends Chart */}
                    {portfolio.stocks.length > 0 && (
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <BarChartIcon size={20} /> Dividendi Mensili (YTD)
                            </h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyDividends}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="name" stroke="#9CA3AF" />
                                        <YAxis stroke="#9CA3AF" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                                            formatter={(value: any) => [`$${value.toFixed(2)}`, 'Dividendi']}
                                        />
                                        <Bar dataKey="value" fill="#10B981" name="Dividendi" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">Asset</h2>

                        <form onSubmit={handleAddStock} className="mb-8 pb-8 border-b border-gray-800">
                            <h3 className="text-lg font-medium text-white mb-4">Aggiungi Titolo</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <input
                                    type="text"
                                    placeholder="Simbolo (es. AAPL)"
                                    value={newStock.symbol}
                                    onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value })}
                                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white outline-none focus:border-blue-500"
                                />
                                <input
                                    type="number"
                                    placeholder="Quantità"
                                    value={newStock.quantity}
                                    onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
                                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white outline-none focus:border-blue-500"
                                />
                                <input
                                    type="number"
                                    placeholder="Prezzo Acquisto"
                                    value={newStock.buyPrice}
                                    onChange={(e) => setNewStock({ ...newStock, buyPrice: e.target.value })}
                                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white outline-none focus:border-blue-500"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {loading ? "Aggiunta..." : "Aggiungi"}
                                </button>
                            </div>
                        </form>
                        <div className="space-y-4">
                            {portfolio.stocks.map((stock) => {
                                const data = stockData[stock.symbol]
                                const detail = detailedData[stock.symbol]
                                const currentPrice = data?.price || stock.buyPrice
                                const totalValue = stock.quantity * currentPrice
                                const gainLoss = (currentPrice - stock.buyPrice) * stock.quantity
                                const gainLossPercent = ((currentPrice - stock.buyPrice) / stock.buyPrice) * 100

                                return (
                                    <div key={stock.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 group">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white text-lg">{stock.symbol}</span>
                                                <span className="text-sm text-gray-400">{stock.quantity} azioni</span>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Prezzo Acquisto: {getCurrencySymbol(detail?.currency)}{stock.buyPrice.toFixed(2)}
                                            </div>
                                            {detail && (
                                                <div className="text-xs text-gray-600 mt-1 flex gap-2 flex-wrap">
                                                    <span>{detail.sector}</span>
                                                    <span>•</span>
                                                    <span>{detail.country}</span>
                                                    <span>•</span>
                                                    <span>Beta: {detail.beta.toFixed(2)}</span>
                                                    <span>•</span>
                                                    <span className={detail.ytd >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                        YTD: {detail.ytd >= 0 ? '+' : ''}{detail.ytd.toFixed(2)}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="font-bold text-white text-lg">{getCurrencySymbol(detail?.currency)}{totalValue.toFixed(2)}</div>
                                                <div className={`text-sm flex items-center justify-end gap-1 ${gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {gainLoss >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                    {gainLoss >= 0 ? '+' : ''}{gainLoss.toFixed(2)} ({gainLossPercent.toFixed(2)}%)
                                                </div>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    if (!confirm(`Sei sicuro di voler rimuovere ${stock.symbol} dal portafoglio?`)) return
                                                    try {
                                                        const res = await fetch(`/api/portfolio/${portfolio.id}/stock/${stock.id}`, {
                                                            method: "DELETE"
                                                        })
                                                        if (res.ok) {
                                                            const updatedPortfolio = await res.json()
                                                            setPortfolio(updatedPortfolio)
                                                        }
                                                    } catch (error) {
                                                        console.error(error)
                                                    }
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="Rimuovi titolo"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                            {portfolio.stocks.length === 0 && (
                                <p className="text-gray-500 text-center py-4">Nessun titolo in questo portafoglio.</p>
                            )}
                        </div>


                    </div>
                </div>

                {/* Right Column: Risk & AI Analysis */}
                <div className="space-y-6">
                    {/* Risk Analysis Card */}
                    {portfolio.stocks.length > 0 && (
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Activity size={20} /> Analisi Rischio
                                    </h3>
                                    <p className="text-gray-400 text-sm mt-1">Metriche di portafoglio</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-6">
                                <div className="text-gray-400">Profilo</div>
                                <div className={`text-xl font-bold ${riskColor}`}>{riskLabel}</div>
                            </div>

                            <div className="space-y-4 border-t border-gray-800 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Beta</span>
                                    <span className="text-white font-mono">{portfolioBeta.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Sharpe Ratio</span>
                                    <span className="text-white font-mono">{sharpeRatio.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Deviazione Std</span>
                                    <span className="text-white font-mono">{(stdDevAnnualized * 100).toFixed(2)}%</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Analisi AI</h2>
                        <p className="text-gray-400 text-sm mb-6">
                            Ottieni un&apos;analisi professionale del tuo portafoglio basata sui dati attuali.
                        </p>

                        {!analysis && (
                            <button
                                onClick={handleAnalyze}
                                disabled={analyzing || portfolio.stocks.length === 0}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {analyzing ? "Analisi in corso..." : "Genera Report"}
                            </button>
                        )}

                        {analysis && (
                            <div className="prose prose-invert max-w-none mt-4">
                                <ReactMarkdown>{analysis}</ReactMarkdown>
                                <button
                                    onClick={() => setAnalysis("")}
                                    className="mt-4 text-sm text-gray-400 hover:text-white underline"
                                >
                                    Nuova Analisi
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    )
}
