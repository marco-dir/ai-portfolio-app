import {
    getQuote,
    getProfile,
    getKeyRatios,
    getRatios,
    getKeyMetricsTTM,
    getIncomeStatement,
    getBalanceSheet,
    getCashFlow,
    getHistoricalPrice,
    getDividends
} from "@/lib/fmp"
import { getDiramcoScore } from "@/lib/google-sheets"
import { FundamentalOverview } from "@/components/fundamental-analysis/fundamental-overview"
import { FinancialIndicators } from "@/components/fundamental-analysis/financial-indicators"
import { DiramcoScore } from "@/components/fundamental-analysis/diramco-score"
import { AIAnalysis } from "@/components/fundamental-analysis/ai-analysis"
import { CandlestickChart } from "@/components/fundamental-analysis/candlestick-chart"
import { HistoricalCharts } from "@/components/fundamental-analysis/historical-charts"
import { ValuationMultiples } from "@/components/fundamental-analysis/valuation-multiples"

export async function ValueAnalysisContent({ ticker }: { ticker: string }) {
    const results = await Promise.allSettled([
        getProfile(ticker),
        getQuote(ticker),
        getKeyRatios(ticker, 'annual', 30),
        getRatios(ticker),
        getKeyMetricsTTM(ticker),
        getIncomeStatement(ticker, 'annual', 30),
        getBalanceSheet(ticker, 'annual', 30),
        getCashFlow(ticker, 'annual', 30),
        getHistoricalPrice(ticker),
        getDiramcoScore(ticker),
        getDividends(ticker)
    ])

    const companyProfile = results[0].status === 'fulfilled' ? results[0].value?.[0] : null
    const quote = results[1].status === 'fulfilled' ? results[1].value?.[0] : null
    const keyRatiosArray = results[2].status === 'fulfilled' ? results[2].value : null
    const keyRatios = keyRatiosArray?.[0] || null
    const financialRatios = results[3].status === 'fulfilled' ? results[3].value?.[0] : null
    const keyMetricsTTM = results[4].status === 'fulfilled' ? results[4].value?.[0] : null
    const incomeStatements = results[5].status === 'fulfilled' ? results[5].value : null
    const balanceSheets = results[6].status === 'fulfilled' ? results[6].value : null
    const cashFlows = results[7].status === 'fulfilled' ? results[7].value : null
    const historicalData = results[8].status === 'fulfilled' ? results[8].value : null
    const historicalPrices = historicalData?.historical || null
    const diramcoScore = results[9].status === 'fulfilled' ? results[9].value : null
    const dividendsData = results[10].status === 'fulfilled' ? results[10].value : null

    let dividendHistory = null
    // Extract dividend history - prioritize specific endpoint, fallback to income statement
    if (dividendsData?.historical) {
        dividendHistory = dividendsData.historical.map((d: any) => ({
            date: d.date,
            dividend: d.adjDividend || d.dividend
        }))
    } else {
        dividendHistory = incomeStatements?.map((inc: any) => ({
            date: inc.date,
            dividend: inc.dividendPerShare || 0
        })) || []
    }

    // Calculate EPS Growth
    let epsGrowth = null
    if (incomeStatements && incomeStatements.length >= 2) {
        const latest = incomeStatements[0]
        const previous = incomeStatements[1]
        const latestEPS = latest.epsdiluted || latest.eps
        const previousEPS = previous.epsdiluted || previous.eps
        if (latestEPS && previousEPS && previousEPS !== 0) {
            epsGrowth = ((latestEPS - previousEPS) / Math.abs(previousEPS)) * 100
        }
    }

    if (!companyProfile || !quote) {
        return (
            <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
                <p className="text-red-400">
                    Impossibile recuperare i dati per {ticker.toUpperCase()}
                </p>
            </div>
        )
    }

    return (
        <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Company Overview */}
            <FundamentalOverview
                ticker={ticker}
                companyName={companyProfile.companyName || ticker}
                sector={companyProfile.sector || 'N/A'}
                industry={companyProfile.industry || 'N/A'}
                currentPrice={quote.price || 0}
                priceChange={quote.changesPercentage || 0}
                marketCap={companyProfile.mktCap || 0}
                currency={companyProfile.currency || 'USD'}
                pe={quote.pe || keyRatios?.peRatio || keyMetricsTTM?.peRatioTTM || null}
                pb={keyRatios?.pbRatio || keyMetricsTTM?.pbRatioTTM || null}
                peg={keyMetricsTTM?.pegRatioTTM || keyRatios?.pegRatio || financialRatios?.pegRatioTTM || null}
                dividendYield={companyProfile.lastDiv && quote.price ? companyProfile.lastDiv / quote.price : null}
                epsGrowth={epsGrowth}
            />

            {/* Annual Price Chart */}
            {historicalPrices && (
                <CandlestickChart
                    data={historicalPrices}
                    currency={companyProfile.currency || 'USD'}
                />
            )}

            {/* DIRAMCO Score */}
            <DiramcoScore score={diramcoScore} />

            {/* Financial Indicators */}
            <FinancialIndicators
                pe={quote.pe || keyRatios?.peRatio || keyMetricsTTM?.peRatioTTM || null}
                pb={keyRatios?.pbRatio || keyMetricsTTM?.pbRatioTTM || null}
                ps={keyRatios?.priceToSalesRatio || keyMetricsTTM?.priceToSalesRatioTTM || null}
                peg={keyMetricsTTM?.pegRatioTTM || keyRatios?.pegRatio || financialRatios?.pegRatioTTM || null}
                roe={keyRatios?.returnOnEquity || financialRatios?.returnOnEquity || null}
                roa={keyRatios?.returnOnAssets || financialRatios?.returnOnAssets || null}
                roic={keyMetricsTTM?.roicTTM || keyRatios?.returnOnCapitalEmployed || null}
                debtEquity={keyRatios?.debtEquityRatio || financialRatios?.debtEquityRatio || null}
                currentRatio={keyRatios?.currentRatio || financialRatios?.currentRatio || null}
                quickRatio={keyRatios?.quickRatio || financialRatios?.quickRatio || null}
                beta={companyProfile.beta || null}
                grossMargin={keyRatios?.grossProfitMargin || null}
                operatingMargin={keyRatios?.operatingProfitMargin || null}
                profitMargin={keyRatios?.netProfitMargin || null}
            />

            {/* Historical Financial Charts */}
            {incomeStatements && incomeStatements.length > 0 && (
                <HistoricalCharts
                    incomeStatements={incomeStatements}
                    balanceSheets={balanceSheets || []}
                    cashFlows={cashFlows || []}
                    dividendHistory={dividendHistory || []}
                    currency={companyProfile.currency || 'USD'}
                    symbol={ticker}
                />
            )}

            {/* Valuation Multiples */}
            {historicalPrices && historicalPrices.length > 0 && incomeStatements && incomeStatements.length > 0 && (
                <ValuationMultiples
                    incomeStatements={incomeStatements}
                    balanceSheets={balanceSheets || []}
                    historicalPrices={historicalPrices}
                    currentPE={quote.pe || keyRatios?.peRatio || null}
                    currentPB={keyRatios?.pbRatio || null}
                />
            )}

            {/* AI Analysis */}
            <AIAnalysis
                ticker={ticker}
                companyName={companyProfile.companyName || ticker}
            />
        </div>
    )
}
