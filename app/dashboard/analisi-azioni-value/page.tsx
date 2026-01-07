import { Suspense } from "react"
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
import { FundamentalSearchBar } from "@/components/fundamental-analysis/fundamental-search-bar"
import { FundamentalOverview } from "@/components/fundamental-analysis/fundamental-overview"
import { FinancialIndicators } from "@/components/fundamental-analysis/financial-indicators"
import { DiramcoScore } from "@/components/fundamental-analysis/diramco-score"
import { AIAnalysis } from "@/components/fundamental-analysis/ai-analysis"
import { CandlestickChart } from "@/components/fundamental-analysis/candlestick-chart"
import { HistoricalCharts } from "@/components/fundamental-analysis/historical-charts"
import { ValuationMultiples } from "@/components/fundamental-analysis/valuation-multiples"

export default async function FundamentalAnalysisPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const ticker = typeof params.ticker === 'string' ? params.ticker : undefined

    let companyProfile = null
    let quote = null
    let keyRatios = null
    let keyRatiosArray = null
    let financialRatios = null
    let keyMetricsTTM = null
    let incomeStatements = null
    let balanceSheets = null
    let cashFlows = null
    let historicalPrices = null
    let dividendHistory = null
    let diramcoScore = null

    if (ticker) {
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

        companyProfile = results[0].status === 'fulfilled' ? results[0].value?.[0] : null
        quote = results[1].status === 'fulfilled' ? results[1].value?.[0] : null
        keyRatiosArray = results[2].status === 'fulfilled' ? results[2].value : null
        keyRatios = keyRatiosArray?.[0] || null
        financialRatios = results[3].status === 'fulfilled' ? results[3].value?.[0] : null
        keyMetricsTTM = results[4].status === 'fulfilled' ? results[4].value?.[0] : null
        incomeStatements = results[5].status === 'fulfilled' ? results[5].value : null
        balanceSheets = results[6].status === 'fulfilled' ? results[6].value : null
        cashFlows = results[7].status === 'fulfilled' ? results[7].value : null
        const historicalData = results[8].status === 'fulfilled' ? results[8].value : null
        historicalPrices = historicalData?.historical || null
        diramcoScore = results[9].status === 'fulfilled' ? results[9].value : null
        const dividendsData = results[10].status === 'fulfilled' ? results[10].value : null

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

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                    Azioni Value e News IA
                </h1>
                <p className="text-gray-400">
                    Analisi delle Azioni approfondita secondo i principi del Value Investing interpretati da DIRAMCO e scopri le ultime notizie tramite l'Intelligenza Artificiale.
                </p>
            </div>

            <div className="mb-8">
                <Suspense fallback={<div className="text-white">Caricamento...</div>}>
                    <FundamentalSearchBar />
                </Suspense>
            </div>

            {ticker && companyProfile && quote ? (
                <div className="mt-8 space-y-6">
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
            ) : ticker ? (
                <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <p className="text-red-400">
                        Impossibile recuperare i dati per {ticker.toUpperCase()}
                    </p>
                </div>
            ) : (
                <div className="mt-8 text-center">
                    <p className="text-gray-400">
                        Cerca un titolo per iniziare l'analisi fondamentale delle azionie scoprire Key Ratio, Indicatori di Performance, Indicatori di Prezzo e trend storici selezionati da DIRAMCO.
                    </p>
                </div>
            )}
        </div>
    )
}
