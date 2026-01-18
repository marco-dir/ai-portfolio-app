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
    getEarningsTranscripts,
    getKeyMetricsTTM,
    getRatios
} from "@/lib/fmp"
import { CompanyHeader } from "@/components/financial-analysis/company-header"
import { AnalysisTabs } from "@/components/financial-analysis/analysis-tabs"

export async function AnalysisContent({ ticker }: { ticker: string }) {
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
        getEarningsTranscripts(ticker, 1), // Fetch latest transcript
        getKeyMetricsTTM(ticker),
        getRatios(ticker)
    ])

    // Helper to extract value or null
    const getValue = <T,>(result: PromiseSettledResult<T>) =>
        result.status === 'fulfilled' ? result.value : null

    const companyProfile = getValue(results[0])?.[0] || null
    const quote = getValue(results[1])?.[0] || null
    const incomeStatement = getValue(results[2]) || []
    const balanceSheet = getValue(results[3]) || []
    const cashFlow = getValue(results[4]) || []
    const keyRatios = getValue(results[5]) || []
    const estimates = results[6].status === 'fulfilled' ? results[6].value : null
    const insiderTrades = results[7].status === 'fulfilled' ? results[7].value : null
    let stockNews = results[8].status === 'fulfilled' ? results[8].value : null
    const ratings = results[9].status === 'fulfilled' ? results[9].value : null
    const recommendations = results[10].status === 'fulfilled' ? results[10].value : null
    const historicalPrice = results[11].status === 'fulfilled' ? results[11].value : null
    const calendar = results[12].status === 'fulfilled' ? results[12].value : null
    const dividendHistory = results[13].status === 'fulfilled' ? results[13].value?.historical : null
    const institutionalHolders = results[14].status === 'fulfilled' ? results[14].value : null
    const mutualFundHolders = results[15].status === 'fulfilled' ? results[15].value : null
    const beneficialOwnership = results[16].status === 'fulfilled' ? results[16].value : null
    const transcripts = results[17].status === 'fulfilled' ? results[17].value : null
    const keyMetricsTTM = results[18].status === 'fulfilled' ? results[18].value?.[0] : null
    const financialRatios = results[19].status === 'fulfilled' ? results[19].value?.[0] : null

    // Fallback to Perplexity for news if empty
    if ((!stockNews || stockNews.length === 0) && companyProfile) {
        console.log(`Fetching fallback news from Perplexity for ${ticker}...`)
        const { getPerplexityNews } = await import("@/lib/perplexity")
        const fallbackNews = await getPerplexityNews(ticker, companyProfile.companyName)
        if (fallbackNews && fallbackNews.length > 0) {
            stockNews = fallbackNews
        }
    }

    if (!companyProfile) {
        return (
            <div className="bg-red-900/20 border border-red-900 text-red-200 p-4 rounded-lg">
                Could not find data for ticker "{ticker}". Please check the symbol and try again.
            </div>
        )
    }

    if (!quote) return null

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CompanyHeader
                profile={companyProfile}
                quote={quote}
                keyRatios={keyRatios}
                keyMetricsTTM={keyMetricsTTM}
                financialRatios={financialRatios}
            />

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
    )
}
