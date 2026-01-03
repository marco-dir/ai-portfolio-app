import { getEconomicIndicator, getTreasuryRates, getVIX, getQuote } from "@/lib/fmp"
import { MacroSidebar as MacroSidebarClient } from "./macro-sidebar-client"

export async function MacroSidebar() {
    // Fetch Data in Parallel
    const [cpiData, sentimentData, unemploymentData, treasuryData, vixData, euStoxxQuote, eurUsdQuote] = await Promise.all([
        getEconomicIndicator('CPI'),
        getEconomicIndicator('consumerSentiment'),
        getEconomicIndicator('unemploymentRate'),
        getTreasuryRates(),
        getVIX(),
        getQuote('^STOXX50E'),
        getQuote('EURUSD')
    ])

    // Current Values USA
    const currentCPI = cpiData?.[0]?.value ?? null
    const currentSentiment = sentimentData?.[0]?.value ?? null
    const currentUnemployment = unemploymentData?.[0]?.value ?? null
    const currentTreasury = treasuryData?.[0]
    const currentVIX = vixData?.price ?? null

    const usaData = {
        cpi: currentCPI,
        sentiment: currentSentiment,
        unemployment: currentUnemployment,
        treasury10Y: currentTreasury?.year10 ?? null,
        treasury2Y: currentTreasury?.year2 ?? null,
        vix: currentVIX
    }

    // EU Data (Hybrid: Real Market + Estimated Macro)
    const stoxx50 = euStoxxQuote?.[0]?.price ?? null
    const eurUsd = eurUsdQuote?.[0]?.price ?? null

    const euData = {
        inflation: 2.4, // Estimated/Last known
        unemployment: 6.4, // Estimated
        sentiment: -14.7, // ZEW Est
        bond10Y: 2.35, // Bund Est
        stoxx50: stoxx50,
        eurUsd: eurUsd
    }

    return <MacroSidebarClient usaData={usaData} euData={euData} />
}
