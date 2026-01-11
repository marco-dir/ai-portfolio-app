import { MacroDashboard } from "@/components/macro/macro-dashboard"
import { getEconomicIndicator, getMarketIndicators, getTreasuryRates, getQuote, getHistoricalPrice } from "@/lib/fmp"

export default async function MacroPage() {
    const today = new Date().toISOString().split('T')[0]
    const fiveYearsAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 5)).toISOString().split('T')[0]

    const [
        marketQuotes,
        cpiData,
        sentimentData,
        treasuryData,
        gdpData,
        euQuotes,
        vixHistory,
        usdHistory,
        oilHistory,
        goldHistory
    ] = await Promise.all([
        getMarketIndicators(),
        getEconomicIndicator('CPI'),
        getEconomicIndicator('consumerSentiment'),
        getTreasuryRates(),
        getEconomicIndicator('realGDP'),
        getQuote('^STOXX50E,^GDAXI,FTSEMIB.MI,^FCHI,^FTSE,EURUSD,DE10YT'),
        getHistoricalPrice('^VIX', fiveYearsAgo, today),
        getHistoricalPrice('DX-Y.NYB', fiveYearsAgo, today),
        getHistoricalPrice('CLUSD', fiveYearsAgo, today),
        getHistoricalPrice('GCUSD', fiveYearsAgo, today)
    ])



    // 2. Process Data for Client Component

    // Extract Market Indicators
    // Quotes come as array of objects. We find by symbol.
    const getPrice = (source: any[], sym: string) => source?.find((q: any) => q.symbol === sym)?.price
    const getChange = (source: any[], sym: string) => source?.find((q: any) => q.symbol === sym)?.changesPercentage

    const realMarketData = {
        vix: getPrice(marketQuotes, '^VIX'),
        usd: getPrice(marketQuotes, 'DX-Y.NYB'),
        oil: getPrice(marketQuotes, 'CLUSD'), // Or CL.1
        gold: getPrice(marketQuotes, 'GCUSD'),
        lastUpdated: new Date().getTime()
    }

    const euMarketData = {
        stoxx50: { price: getPrice(euQuotes, '^STOXX50E'), change: getChange(euQuotes, '^STOXX50E') },
        dax: { price: getPrice(euQuotes, '^GDAXI'), change: getChange(euQuotes, '^GDAXI') },
        ftseMib: { price: getPrice(euQuotes, 'FTSEMIB.MI'), change: getChange(euQuotes, 'FTSEMIB.MI') },
        cac40: { price: getPrice(euQuotes, '^FCHI'), change: getChange(euQuotes, '^FCHI') },
        ftse100: { price: getPrice(euQuotes, '^FTSE'), change: getChange(euQuotes, '^FTSE') },
        eurUsd: { price: getPrice(euQuotes, 'EURUSD'), change: getChange(euQuotes, 'EURUSD') },
        bund10y: { price: getPrice(euQuotes, 'DE10YT'), change: getChange(euQuotes, 'DE10YT') } // Price IS the yield here
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Macroeconomia Globale</h1>
                    <p className="text-gray-400">Monitoraggio avanzato degli indicatori economici globali, inflazione e rischi di recessione.</p>
                </div>
            </div>

            <MacroDashboard
                realMarketData={realMarketData}
                euMarketData={euMarketData}
                initialCpiData={cpiData}
                initialSentimentData={sentimentData}
                initialTreasuryData={treasuryData}
                initialGdpData={gdpData}
                historicalData={{
                    vix: vixHistory?.historical,
                    usd: usdHistory?.historical,
                    oil: oilHistory?.historical,
                    gold: goldHistory?.historical
                }}
            />
        </div>
    )
}
