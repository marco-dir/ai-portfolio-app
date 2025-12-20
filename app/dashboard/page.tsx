import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, ArrowRight, TrendingUp, TrendingDown, Activity, DollarSign, Wallet, PieChart, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { getQuote, getProfile, getHistoricalPrice, getDividends, getRatios } from "@/lib/fmp"
import { formatNumber } from "@/lib/utils"

async function getPortfolioMetrics(portfolio: any) {
    let totalValue = 0
    let totalStartValue = 0
    let totalCost = 0
    let weightedBetaSum = 0
    let totalDividends = 0
    let weightedYieldSum = 0

    const currentYear = new Date().getFullYear()
    const startOfYear = `${currentYear}-01-01`
    const endOfYear = `${currentYear}-12-31`

    // Parallelize stock data fetching
    const stockPromises = portfolio.stocks.map(async (stock: any) => {
        const [quote, profile, history, dividends, ratios] = await Promise.all([
            getQuote(stock.symbol),
            getProfile(stock.symbol),
            getHistoricalPrice(stock.symbol, startOfYear, startOfYear),
            getDividends(stock.symbol),
            getRatios(stock.symbol)
        ])

        const price = quote?.[0]?.price || 0
        const beta = profile?.[0]?.beta || 1
        const dividendYield = ratios?.[0]?.dividendYieldTTM || 0

        let startPrice = price
        if (history && history.historical && history.historical.length > 0) {
            const sorted = history.historical.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
            startPrice = sorted[0].close
        }

        const value = stock.quantity * price
        const cost = stock.quantity * stock.buyPrice
        const startValue = stock.quantity * startPrice

        // Calculate YTD dividends
        let stockDividends = 0
        if (dividends && dividends.historical) {
            stockDividends = dividends.historical
                .filter((d: any) => d.date >= startOfYear && d.date <= endOfYear)
                .reduce((sum: number, d: any) => sum + d.dividend, 0) * stock.quantity
        }

        return {
            value,
            cost,
            startValue,
            weightedBeta: value * beta,
            weightedYield: value * dividendYield,
            dividends: stockDividends
        }
    })

    const results = await Promise.all(stockPromises)

    results.forEach(r => {
        totalValue += r.value
        totalStartValue += r.startValue
        totalCost += r.cost
        weightedBetaSum += r.weightedBeta
        weightedYieldSum += r.weightedYield
        totalDividends += r.dividends
    })

    const ytdReturn = totalStartValue > 0 ? ((totalValue - totalStartValue) / totalStartValue) * 100 : 0
    const overallReturn = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0
    const risk = totalValue > 0 ? weightedBetaSum / totalValue : 0
    const dividendYield = totalValue > 0 ? (weightedYieldSum / totalValue) * 100 : 0

    return {
        totalValue,
        ytdReturn,
        overallReturn,
        risk,
        totalDividends,
        dividendYield
    }
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    const portfolios = await prisma.portfolio.findMany({
        where: { userId: session.user.id },
        include: { stocks: true },
        take: 3
    })

    const watchlist = await prisma.watchlist.findUnique({
        where: { userId: session.user.id }
    })

    const watchlistSymbols = watchlist?.symbols ? watchlist.symbols.split(",") : []

    // Fetch Watchlist Quotes
    let watchlistQuotes: any[] = []
    if (watchlistSymbols.length > 0) {
        watchlistQuotes = await getQuote(watchlistSymbols.join(",")) || []
    }

    // Calculate metrics for each portfolio
    const portfoliosWithMetrics = await Promise.all(portfolios.map(async (p) => {
        const metrics = await getPortfolioMetrics(p)
        return { ...p, ...metrics }
    }))

    // Calculate Aggregate Metrics
    let totalNetWorth = 0
    let totalDividendsAll = 0
    let weightedYTDSum = 0
    let totalStartValueAll = 0

    portfoliosWithMetrics.forEach(p => {
        totalNetWorth += p.totalValue
        totalDividendsAll += p.totalDividends
        // Reconstruct start value to calculate aggregate YTD accurately
        // YTD = (Current - Start) / Start
        // Start = Current / (1 + YTD/100)
        const startVal = p.totalValue / (1 + p.ytdReturn / 100)
        totalStartValueAll += startVal
    })

    const aggregateYTD = totalStartValueAll > 0 ? ((totalNetWorth - totalStartValueAll) / totalStartValueAll) * 100 : 0

    return (
        <div className="space-y-10">
            {/* Hero Section - Aggregate Metrics */}
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-8 shadow-2xl border border-blue-800/50">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                        <Wallet className="text-blue-400" size={32} />
                        Patrimonio Totale
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <p className="text-blue-200 text-sm font-medium mb-1">Valore Netto</p>
                            <div className="text-4xl font-bold text-white tracking-tight">
                                ${formatNumber(totalNetWorth)}
                            </div>
                        </div>

                        <div>
                            <p className="text-blue-200 text-sm font-medium mb-1">Rendimento YTD</p>
                            <div className={`text-3xl font-bold flex items-center gap-2 ${aggregateYTD >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {aggregateYTD >= 0 ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
                                {aggregateYTD >= 0 ? '+' : ''}{formatNumber(aggregateYTD)}%
                            </div>
                        </div>

                        <div>
                            <p className="text-blue-200 text-sm font-medium mb-1">Dividendi Totali (YTD)</p>
                            <div className="text-3xl font-bold text-green-400 flex items-center gap-2">
                                <DollarSign size={28} />
                                {formatNumber(totalDividendsAll)}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Portfolios Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <PieChart size={24} className="text-purple-400" />
                        I tuoi Portafogli
                    </h2>
                    <Link href="/dashboard/portfolio" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 bg-blue-900/30 px-4 py-2 rounded-full border border-blue-800 hover:border-blue-600 active:scale-95 transition-transform">
                        Vedi Tutti <ArrowRight size={14} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {portfoliosWithMetrics.map(portfolio => (
                        <Link key={portfolio.id} href={`/dashboard/portfolio/${portfolio.id}`} className="block h-full">
                            <div className="h-full p-6 bg-gray-900 border border-gray-800 rounded-xl hover:border-blue-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors mb-1">{portfolio.name}</h3>
                                        <span className="text-xs font-medium text-gray-500 bg-gray-800 px-2 py-1 rounded-md border border-gray-700">
                                            {portfolio.stocks.length} Asset
                                        </span>
                                    </div>
                                    <div className={`p-2 rounded-lg ${portfolio.ytdReturn >= 0 ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                                        {portfolio.ytdReturn >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                    </div>
                                </div>

                                <div className="space-y-5 flex-grow">
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Valore</p>
                                        <p className="text-2xl font-bold text-white">
                                            ${formatNumber(portfolio.totalValue)}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Rendimento YTD</p>
                                            <p className={`font-semibold ${portfolio.ytdReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {portfolio.ytdReturn >= 0 ? '+' : ''}{formatNumber(portfolio.ytdReturn)}%
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Yield</p>
                                            <p className="font-semibold text-blue-400">
                                                {formatNumber(portfolio.dividendYield)}%
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-center text-xs text-gray-500">
                                    <span>Rischio: <span className={portfolio.risk > 1.2 ? 'text-red-400' : portfolio.risk < 0.8 ? 'text-green-400' : 'text-yellow-400'}>{portfolio.risk.toFixed(2)}</span></span>
                                    <span>Div: ${formatNumber(portfolio.totalDividends)}</span>
                                </div>
                            </div>
                        </Link>
                    ))}

                    <Link href="/dashboard/portfolio/new" className="block h-full">
                        <div className="h-full min-h-[250px] p-6 bg-gray-900/30 border border-dashed border-gray-800 rounded-xl hover:border-blue-500 hover:bg-blue-900/10 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-gray-400 group">
                            <div className="p-4 rounded-full bg-gray-800 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 mb-4 shadow-lg">
                                <Plus size={32} />
                            </div>
                            <span className="font-medium group-hover:text-blue-400 transition-colors">Crea Nuovo Portafoglio</span>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Watchlist Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Activity size={24} className="text-orange-400" />
                        Watchlist
                    </h2>
                    <Link href="/dashboard/watchlist" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 bg-blue-900/30 px-4 py-2 rounded-full border border-blue-800 hover:border-blue-600 active:scale-95 transition-transform">
                        Gestisci <ArrowRight size={14} />
                    </Link>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    {watchlistSymbols.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {watchlistQuotes.map((quote: any) => (
                                <div key={quote.symbol} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 hover:bg-gray-800 hover:border-gray-600 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-white">{quote.symbol}</span>
                                        <span className={`text-sm font-medium ${quote.changesPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {quote.changesPercentage >= 0 ? '+' : ''}{quote.changesPercentage?.toFixed(2)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs text-gray-400 truncate max-w-[120px]" title={quote.name}>{quote.name}</span>
                                        <span className="text-lg font-bold text-white">${quote.price?.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                            {watchlistQuotes.length === 0 && watchlistSymbols.map(symbol => (
                                <div key={symbol} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 flex items-center justify-between">
                                    <span className="font-bold text-white">{symbol}</span>
                                    <span className="text-xs text-gray-500">Dati non disponibili</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">La tua watchlist è vuota.</p>
                            <Link href="/dashboard/watchlist" className="text-blue-400 hover:underline">
                                Aggiungi titoli alla watchlist
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
