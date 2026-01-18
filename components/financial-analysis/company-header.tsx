"use client"

import { TrendingUp, TrendingDown, Star } from "lucide-react"
import { useState } from "react"

interface CompanyProfile {
    symbol?: string
    price: number
    beta: number
    volAvg: number
    mktCap: number
    lastDiv: number
    range: string
    changes: number
    companyName: string
    currency: string
    cik: string
    isin: string
    cusip: string
    exchange: string
    exchangeShortName: string
    industry: string
    website: string
    description: string
    ceo: string
    sector: string
    country: string
    fullTimeEmployees: string
    phone: string
    address: string
    city: string
    state: string
    zip: string
    dcfDiff: number
    dcf: number
    image: string
    ipoDate: string
    defaultImage: boolean
    isEtf: boolean
    isActivelyTrading: boolean
    isAdr: boolean
    isFund: boolean
}

interface Quote {
    symbol: string
    name: string
    price: number
    changesPercentage: number
    change: number
    dayLow: number
    dayHigh: number
    yearHigh: number
    yearLow: number
    marketCap: number
    priceAvg50: number
    priceAvg200: number
    volume: number
    avgVolume: number
    exchange: string
    open: number
    previousClose: number
    eps: number
    pe: number
    earningsAnnouncement: string
    sharesOutstanding: number
    timestamp: number
}

export function CompanyHeader({
    profile,
    quote,
    keyRatios,
    keyMetricsTTM,
    financialRatios
}: {
    profile: CompanyProfile
    quote: Quote
    keyRatios?: any[]
    keyMetricsTTM?: any
    financialRatios?: any
}) {
    const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false)
    const [watchlistMessage, setWatchlistMessage] = useState<string | null>(null)

    if (!profile || !quote) return null

    const isPositive = quote.change >= 0
    const currency = profile.currency || "USD"

    // Get latest key ratios for current metrics
    const latestRatios = keyRatios && keyRatios.length > 0 ? keyRatios[0] : null

    // Format large numbers (Billions, Trillions)
    const formatMarketCap = (num: number) => {
        if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
        return num.toLocaleString()
    }

    const formatPercent = (num: number | null | undefined) => {
        if (num === null || num === undefined) return 'N/A'
        return `${(num * 100).toFixed(2)}%`
    }

    const formatRatio = (num: number | null | undefined) => {
        if (num === null || num === undefined) return 'N/A'
        return num.toFixed(2)
    }

    const addToWatchlist = async () => {
        setIsAddingToWatchlist(true)
        setWatchlistMessage(null)

        try {
            const response = await fetch('/api/watchlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    symbol: quote.symbol
                })
            })

            const data = await response.json()

            if (response.ok) {
                setWatchlistMessage('✓ Aggiunto alla watchlist')
                setTimeout(() => setWatchlistMessage(null), 3000)
            } else {
                setWatchlistMessage(data.error || 'Errore durante l\'aggiunta')
                setTimeout(() => setWatchlistMessage(null), 3000)
            }
        } catch (error) {
            setWatchlistMessage('Errore di connessione')
            setTimeout(() => setWatchlistMessage(null), 3000)
        } finally {
            setIsAddingToWatchlist(false)
        }
    }

    return (
        <div className="w-full bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">

                {/* Left: Logo & Name */}
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-lg p-2 flex items-center justify-center overflow-hidden">
                        <img
                            src={profile.image}
                            alt={profile.companyName}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${profile.companyName}&background=random`
                            }}
                        />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{profile.companyName}</h1>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <span className="font-mono bg-gray-800 px-1.5 py-0.5 rounded text-gray-300">{quote.symbol}</span>
                            <span>•</span>
                            <span>{profile.exchangeShortName}</span>
                            <span>•</span>
                            <span>{profile.sector}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Price & Metrics */}
                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <div className="text-3xl font-bold text-white flex items-center justify-end gap-2">
                            {quote.price.toFixed(2)} <span className="text-sm text-gray-500">{currency}</span>
                        </div>
                        <div className={`flex items-center justify-end gap-1 font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            {isPositive ? '+' : ''}{quote.change.toFixed(2)} ({quote.changesPercentage.toFixed(2)}%)
                        </div>
                    </div>

                    <button
                        onClick={addToWatchlist}
                        disabled={isAddingToWatchlist}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                    >
                        <Star size={18} />
                        <span className="hidden sm:inline">{isAddingToWatchlist ? 'Aggiunta...' : 'Aggiungi a Watchlist'}</span>
                    </button>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 pt-4 border-t border-gray-800">
                <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Market Cap</div>
                    <div className="text-sm font-semibold text-white">{formatMarketCap(profile.mktCap)}</div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Beta</div>
                    <div className="text-sm font-semibold text-white">{profile.beta.toFixed(2)}</div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">P/E Ratio</div>
                    <div className="text-sm font-semibold text-white">{quote.pe ? quote.pe.toFixed(2) : 'N/A'}</div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">P/B Ratio</div>
                    <div className="text-sm font-semibold text-white">{latestRatios?.priceToBookRatio ? formatRatio(latestRatios.priceToBookRatio) : 'N/A'}</div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">PEG Ratio</div>
                    <div className="text-sm font-semibold text-white">
                        {keyMetricsTTM?.pegRatioTTM
                            ? formatRatio(keyMetricsTTM.pegRatioTTM)
                            : financialRatios?.pegRatioTTM
                                ? formatRatio(financialRatios.pegRatioTTM)
                                : latestRatios?.pegRatio
                                    ? formatRatio(latestRatios.pegRatio)
                                    : latestRatios?.priceEarningsToGrowthRatio
                                        ? formatRatio(latestRatios.priceEarningsToGrowthRatio)
                                        : 'N/A'}
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">ROE</div>
                    <div className="text-sm font-semibold text-white">{latestRatios?.returnOnEquity ? formatPercent(latestRatios.returnOnEquity) : 'N/A'}</div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">ROIC</div>
                    <div className="text-sm font-semibold text-white">{latestRatios?.returnOnCapitalEmployed ? formatPercent(latestRatios.returnOnCapitalEmployed) : 'N/A'}</div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Div. Yield</div>
                    <div className="text-sm font-semibold text-white">
                        {profile.lastDiv && quote.price
                            ? formatPercent(profile.lastDiv / quote.price)
                            : latestRatios?.dividendYield
                                ? formatPercent(latestRatios.dividendYield)
                                : 'N/A'}
                    </div>
                </div>
            </div>

            {watchlistMessage && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${watchlistMessage.startsWith('✓')
                    ? 'bg-green-900/20 border border-green-900 text-green-400'
                    : 'bg-red-900/20 border border-red-900 text-red-400'
                    }`}>
                    {watchlistMessage}
                </div>
            )}
        </div>
    )
}
