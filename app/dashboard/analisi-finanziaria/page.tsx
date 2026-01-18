import { Suspense } from "react"
import {
    getQuote,
    getProfile,
    getIncomeStatement,
    getBalanceSheet,
    getCashFlow,
    getKeyRatios,
    getAnalystEstimates,
    getInsiderTrading,
    getStockNews,
    getAnalystRatings,
    getAnalystRecommendations,
    getHistoricalPrice,
    getEarningsCalendar,
    getDividendHistory,
    getInstitutionalHolders,
    getMutualFundHolders,
    getBeneficialOwnership,
    getEarningsTranscripts
} from "@/lib/fmp"
import { FinancialAnalysisSearch } from "@/components/financial-analysis/search-bar"
import { CompanyHeader } from "@/components/financial-analysis/company-header"
import { AnalysisTabs } from "@/components/financial-analysis/analysis-tabs"

export default async function FinancialAnalysisPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const ticker = typeof params.ticker === 'string' ? params.ticker : undefined

    let companyProfile = null
    let quote = null
    let incomeStatement = null
    let balanceSheet = null
    let cashFlow = null
    let keyRatios = null
    let estimates = null
    let insiderTrades = null
    let stockNews = null
    let ratings = null
    let recommendations = null
    let historicalPrice = null
    let calendar = null
    let dividendHistory = null
    let institutionalHolders = null
    let mutualFundHolders = null
    let beneficialOwnership = null
    let transcripts = null

    if (ticker) {
        // Parallel data fetching
        const results = await Promise.allSettled([
            getProfile(ticker),
            getQuote(ticker),
            getIncomeStatement(ticker),
            getBalanceSheet(ticker),
            getCashFlow(ticker),
            getKeyRatios(ticker, 'quarter', 200), // Quarterly data for more granular charts
            getAnalystEstimates(ticker),
            getInsiderTrading(ticker),
            getStockNews(ticker),
            getAnalystRatings(ticker),
            getAnalystRecommendations(ticker),
            getHistoricalPrice(ticker, undefined, undefined), // default fetches full history or large chunk, we handle slicing in UI
            getEarningsCalendar(ticker),
            getDividendHistory(ticker),
            getInstitutionalHolders(ticker),
            getMutualFundHolders(ticker),
            getBeneficialOwnership(ticker),
            getEarningsTranscripts(ticker, 1) // Fetch latest transcript
        ])

        // Helper to extract value or null
        const getValue = <T,>(result: PromiseSettledResult<T>) =>
            result.status === 'fulfilled' ? result.value : null

        companyProfile = getValue(results[0])?.[0] || null
        quote = getValue(results[1])?.[0] || null
        incomeStatement = getValue(results[2]) || []
        balanceSheet = getValue(results[3]) || []
        cashFlow = getValue(results[4]) || []
        keyRatios = getValue(results[5]) || []
        estimates = results[6].status === 'fulfilled' ? results[6].value : null
        insiderTrades = results[7].status === 'fulfilled' ? results[7].value : null
        stockNews = results[8].status === 'fulfilled' ? results[8].value : null
        ratings = results[9].status === 'fulfilled' ? results[9].value : null
        recommendations = results[10].status === 'fulfilled' ? results[10].value : null
        historicalPrice = results[11].status === 'fulfilled' ? results[11].value : null
        calendar = results[12].status === 'fulfilled' ? results[12].value : null
        dividendHistory = results[13].status === 'fulfilled' ? results[13].value?.historical : null
        institutionalHolders = results[14].status === 'fulfilled' ? results[14].value : null
        mutualFundHolders = results[15].status === 'fulfilled' ? results[15].value : null
        beneficialOwnership = results[16].status === 'fulfilled' ? results[16].value : null
        transcripts = results[17].status === 'fulfilled' ? results[17].value : null

        // Fallback to Perplexity for news if empty
        if ((!stockNews || stockNews.length === 0) && companyProfile) {
            console.log(`Fetching fallback news from Perplexity for ${ticker}...`)
            const { getPerplexityNews } = await import("@/lib/perplexity")
            const fallbackNews = await getPerplexityNews(ticker, companyProfile.companyName)
            if (fallbackNews && fallbackNews.length > 0) {
                stockNews = fallbackNews
            }
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Analisi Finanziaria</h1>
                    <p className="text-gray-400">Analisi approfondita dei dati finanziari, valutazioni e metriche chiave.</p>
                </div>

                <FinancialAnalysisSearch initialTicker={ticker} />
                <p className="text-sm text-gray-500 mt-2 ml-1">
                    Visualizza dati storici di Conto Economico, Stato Patrimoniale, Flussi di Cassa e Key Ratios. Accedi a Valutazioni intelligenti, Calendario finanziario, Notizie in tempo reale, Stime Analisti, Insider e molto altro.
                </p>

                {ticker && !companyProfile && (
                    <div className="bg-red-900/20 border border-red-900 text-red-200 p-4 rounded-lg">
                        Could not find data for ticker "{ticker}". Please check the symbol and try again.
                    </div>
                )}

                {ticker && companyProfile && quote && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CompanyHeader profile={companyProfile} quote={quote} keyRatios={keyRatios} />

                        <AnalysisTabs
                            ticker={ticker}
                            incomeStatement={incomeStatement}
                            balanceSheet={balanceSheet}
                            cashFlow={cashFlow}
                            keyRatios={keyRatios}
                            estimates={estimates}
                            insiderTrades={insiderTrades}
                            stockNews={stockNews}
                            ratings={ratings}
                            recommendations={recommendations}
                            historicalPrice={historicalPrice}
                            calendar={calendar}
                            dividendHistory={dividendHistory}
                            institutionalHolders={institutionalHolders}
                            mutualFundHolders={mutualFundHolders}
                            beneficialOwnership={beneficialOwnership}
                            transcripts={transcripts}
                            quote={quote}
                            profile={companyProfile}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
