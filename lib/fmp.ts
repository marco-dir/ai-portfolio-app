import { unstable_cache } from "next/cache"

const FMP_API_KEY = process.env.FMP_API_KEY
const BASE_URL = "https://financialmodelingprep.com/api/v3"

if (!FMP_API_KEY) {
    console.warn("FMP_API_KEY is not set in environment variables")
}

async function fetchFMP(endpoint: string) {
    if (!FMP_API_KEY) return null

    const separator = endpoint.includes("?") ? "&" : "?"
    const url = `${BASE_URL}${endpoint}${separator}apikey=${FMP_API_KEY}`

    try {
        const res = await fetch(url)
        if (!res.ok) {
            throw new Error(`FMP API Error: ${res.status} ${res.statusText}`)
        }
        return await res.json()
    } catch (error) {
        console.error(`Failed to fetch from FMP (${endpoint}):`, error)
        return null
    }
}

export const getQuote = async (symbol: string) => {
    return fetchFMP(`/quote/${symbol}`)
}

export const getKeyMetrics = async (symbol: string) => {
    return fetchFMP(`/key-metrics-ttm/${symbol}`)
}

export const getRatios = async (symbol: string) => {
    return fetchFMP(`/ratios-ttm/${symbol}`)
}

export const getHistoricalPrice = async (symbol: string, from?: string, to?: string) => {
    let endpoint = `/historical-price-full/${symbol}`
    if (from && to) {
        endpoint += `?from=${from}&to=${to}`
    }
    return fetchFMP(endpoint)
}

export const getDividends = async (symbol: string) => {
    return fetchFMP(`/historical-price-full/stock_dividend/${symbol}`)
}

export const getProfile = async (symbol: string) => {
    return fetchFMP(`/profile/${symbol}`)
}

export const getForexRate = async () => {
    // EURUSD quote gives how many USD for 1 EUR. 
    // We usually want USD -> EUR conversion.
    // If EURUSD is 1.05, it means 1 EUR = 1.05 USD.
    // So 1 USD = 1 / 1.05 EUR.
    // Let's fetch EURUSD and invert it, or fetch USDEUR if available (usually major pairs are standard).
    // FMP has /quote/EURUSD
    const data = await fetchFMP(`/quote/EURUSD`)
    if (data && data[0]) {
        return data[0].price // This is 1 EUR in USD
    }
    return 1 // Fallback
}

// Cached versions to avoid hitting API limits too hard
export const getCachedQuote = unstable_cache(
    async (symbol: string) => getQuote(symbol),
    ['fmp-quote'],
    { revalidate: 60 } // Cache for 1 minute
)


export const getCachedForexRate = unstable_cache(
    async () => getForexRate(),
    ['fmp-forex'],
    { revalidate: 3600 } // Cache for 1 hour
)

export const getCachedProfile = unstable_cache(
    async (symbol: string) => getProfile(symbol),
    ['fmp-profile'],
    { revalidate: 86400 } // Cache for 24 hours
)

// === Financial Analysis Endpoints ===

export const getIncomeStatement = async (symbol: string, period: 'annual' | 'quarter' = 'annual', limit: number = 50) => {
    return fetchFMP(`/income-statement/${symbol}?period=${period}&limit=${limit}`)
}

export const getBalanceSheet = async (symbol: string, period: 'annual' | 'quarter' = 'annual', limit: number = 50) => {
    return fetchFMP(`/balance-sheet-statement/${symbol}?period=${period}&limit=${limit}`)
}

export const getCashFlow = async (symbol: string, period: 'annual' | 'quarter' = 'annual', limit: number = 50) => {
    return fetchFMP(`/cash-flow-statement/${symbol}?period=${period}&limit=${limit}`)
}

export const getKeyRatios = async (symbol: string, period: 'annual' | 'quarter' = 'annual', limit: number = 50) => {
    return fetchFMP(`/ratios/${symbol}?period=${period}&limit=${limit}`)
}

export const getKeyMetricsTTM = async (symbol: string) => {
    return fetchFMP(`/key-metrics-ttm/${symbol}`)
}

export const getInsiderTrading = async (symbol: string, limit: number = 100) => {
    // Note: Insider trading endpoint structure might differ slightly, checking documentation standard
    // FMP v4 endpoint for insider trading
    const url = `${BASE_URL.replace('v3', 'v4')}/insider-trading?symbol=${symbol}&limit=${limit}&apikey=${FMP_API_KEY}`

    try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`FMP API Error: ${res.status}`)
        return await res.json()
    } catch (error) {
        console.error("Failed to fetch Insider Trading:", error)
        return []
    }
}

export const getAnalystEstimates = async (symbol: string, period: 'annual' | 'quarter' = 'annual', limit: number = 30) => {
    return fetchFMP(`/analyst-estimates/${symbol}?period=${period}&limit=${limit}`)
}

export const getAnalystRatings = async (symbol: string, limit: number = 50) => {
    return fetchFMP(`/historical-rating/${symbol}?limit=${limit}`)
}

export const getAnalystRecommendations = async (symbol: string, limit: number = 50) => {
    return fetchFMP(`/analyst-stock-recommendations/${symbol}?limit=${limit}`)
}

export const getStockNews = async (symbol: string, limit: number = 20) => {
    return fetchFMP(`/stock_news?tickers=${symbol}&limit=${limit}`)
}

export const getEarningsCalendar = async (symbol: string) => {
    return fetchFMP(`/earnings-surprises/${symbol}`)
}

export const getDividendHistory = async (symbol: string) => {
    return fetchFMP(`/historical-price-full/stock_dividend/${symbol}`)
}

export const getInstitutionalHolders = async (symbol: string) => {
    return fetchFMP(`/institutional-holder/${symbol}`)
}

export const getMutualFundHolders = async (symbol: string) => {
    return fetchFMP(`/mutual-fund-holder/${symbol}`)
}

export const getBeneficialOwnership = async (symbol: string) => {
    // Uses v4 endpoint
    const url = `${BASE_URL.replace('v3', 'v4')}/insider/ownership/acquisition_of_beneficial_ownership?symbol=${symbol}&apikey=${FMP_API_KEY}`

    try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`FMP API Error: ${res.status}`)
        return await res.json()
    } catch (error) {
        console.error("Failed to fetch Beneficial Ownership:", error)
        return []
    }

}

export const getETFHolders = async (symbol: string) => {
    return fetchFMP(`/etf-holder/${symbol}`)
}

export const getETFSectorWeight = async (symbol: string) => {
    return fetchFMP(`/etf-sector-weight/${symbol}`)
}

export const getETFCountryWeight = async (symbol: string) => {
    return fetchFMP(`/etf-country-weight/${symbol}`)
}

