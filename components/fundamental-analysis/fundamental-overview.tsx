import { AddToWatchlistButton } from "./add-to-watchlist-button"

interface FundamentalOverviewProps {
    ticker: string
    companyName: string
    sector: string
    industry: string
    currentPrice: number
    priceChange: number
    marketCap: number
    currency: string
    pe: number | null
    pb: number | null
    peg: number | null
    dividendYield: number | null
    epsGrowth: number | null
}

export function FundamentalOverview({
    ticker,
    companyName,
    sector,
    industry,
    currentPrice,
    priceChange,
    marketCap,
    currency,
    pe,
    pb,
    peg,
    dividendYield,
    epsGrowth
}: FundamentalOverviewProps) {
    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <h2 className="text-3xl font-bold text-white">{companyName}</h2>
                        <AddToWatchlistButton ticker={ticker} />
                    </div>
                    <p className="text-gray-400">{ticker.toUpperCase()}</p>
                    <div className="flex gap-4 mt-2">
                        <span className="text-sm text-gray-500">Settore: {sector}</span>
                        <span className="text-sm text-gray-500">Industria: {industry}</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-white">
                        {currencySymbol}{currentPrice.toFixed(2)}
                    </div>
                    <div className={`text-lg font-semibold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Market Cap</div>
                    <div className="text-white font-semibold">
                        {currencySymbol}{(marketCap / 1000000000).toFixed(2)}B
                    </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">P/E Ratio</div>
                    <div className="text-white font-semibold">
                        {pe ? pe.toFixed(2) : 'N/A'}
                    </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">P/B Ratio</div>
                    <div className="text-white font-semibold">
                        {pb ? pb.toFixed(2) : 'N/A'}
                    </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">PEG Ratio</div>
                    <div className="text-white font-semibold">
                        {peg ? peg.toFixed(2) : 'N/A'}
                    </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Dividend Yield</div>
                    <div className="text-white font-semibold">
                        {dividendYield ? `${(dividendYield * 100).toFixed(2)}%` : 'N/A'}
                    </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">EPS Growth</div>
                    <div className="text-white font-semibold">
                        {epsGrowth ? `${epsGrowth >= 0 ? '+' : ''}${epsGrowth.toFixed(2)}%` : 'N/A'}
                    </div>
                </div>
            </div>
        </div>
    )
}
