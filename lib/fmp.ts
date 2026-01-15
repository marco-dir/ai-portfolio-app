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
    return fetchFMP(`/etf-sector-weightings/${symbol}`)
}

export const getETFCountryWeight = async (symbol: string) => {
    return fetchFMP(`/etf-country-weightings/${symbol}`)
}

// === Macroeconomic Data ===

// === Macroeconomic Data ===

export const getEconomicIndicator = async (name: string, from?: string, to?: string) => {
    // Uses v4 endpoint
    // name examples: GDP, CPI, unemploymentRate, federalFunds
    let url = `${BASE_URL.replace('v3', 'v4')}/economic?name=${name}&apikey=${FMP_API_KEY}`

    // Add date range if provided (FMP v4 might accept from/to, or we just fetch all and slice)
    // Checking docs, v4 economic often just returns all or takes from/to
    if (from) url += `&from=${from}`
    if (to) url += `&to=${to}`

    try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`FMP API Error: ${res.status}`)
        return await res.json()
    } catch (error) {
        console.error(`Failed to fetch Economic Indicator (${name}):`, error)
        return []
    }
}

export const getTreasuryRates = async (from?: string, to?: string) => {
    // Uses v4 endpoint
    let url = `${BASE_URL.replace('v3', 'v4')}/treasury?apikey=${FMP_API_KEY}`
    if (from && to) {
        url += `&from=${from}&to=${to}`
    }

    try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`FMP API Error: ${res.status}`)
        return await res.json()
    } catch (error) {
        console.error("Failed to fetch Treasury Rates:", error)
        return []
    }
}

export const getMarketIndicators = async () => {
    // Fetch quotes for VIX, USD Index, Commodities
    // Symbols: ^VIX, DX-Y.NYB, CLUSD (Oil), HGUSD (Copper)
    // Note: FMP symbols for commodities might vary. 
    // Trying standard ones: CLUSD (Crude Oil), HGUSD (Copper), GCUSD (Gold)
    const symbols = ['^VIX', 'DX-Y.NYB', 'CLUSD', 'GCUSD'].join(',')
    return getQuote(symbols)
}


// === Superinvestors Data ===

export const SUPERINVESTORS = [
    { name: "Warren Buffett (Berkshire Hathaway)", cik: "0001067983" },
    { name: "Ray Dalio (Bridgewater)", cik: "0001350694" },
    { name: "Jim Simons (Renaissance Tech)", cik: "0001037389" },
    { name: "Ken Griffin (Citadel)", cik: "0001423053" },
    { name: "Bill & Melinda Gates Foundation", cik: "0001166559" },
    { name: "Michael Burry (Scion Asset Management)", cik: "0001649339" },
    { name: "Bill Ackman (Pershing Square)", cik: "0001336528" },
    { name: "Carl Icahn (Icahn Capital)", cik: "0000921669" }
]

export const getSuperInvestorHoldings = async (cik: string, date?: string) => {
    // Uses v4 endpoint for holdings
    let url = `${BASE_URL.replace('v3', 'v4')}/institutional-ownership/portfolio-holdings?cik=${cik}&apikey=${FMP_API_KEY}`

    if (date) {
        url += `&date=${date}`
    } else {
        // If no date provided, try to find the latest available date first
        // Usually safe to guess the last quarter end or iterate a few recent ones if we want to be robust
        // But for simplicity in this call, we depend on the caller or default to latest via logic
        // FMP v4 endpoint without date might return latest? Documentation usually says date is required or returns specific period.
        // Let's try 2025-09-30 as primary default for now as verified in tests
        url += `&date=2025-09-30`
    }

    try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`FMP API Error: ${res.status}`)
        return await res.json()
    } catch (error) {
        console.error("Failed to fetch Superinvestor Holdings:", error)
        return []
    }
}

export const getVIX = async () => {
    const quote = await getQuote('^VIX')
    return quote ? quote[0] : null
}

// === Senate Trading Data ===

export const getSenateTrading = async (limit: number = 1000) => {
    // Uses v4 RSS feed endpoint which returns recent global trades
    // Standard senate-trading endpoint requires symbol parameter or returns empty
    const url = `${BASE_URL.replace('v3', 'v4')}/senate-trading-rss-feed?apikey=${FMP_API_KEY}&limit=${limit}`

    try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`FMP API Error: ${res.status}`)
        return await res.json()
    } catch (error) {
        console.error("Failed to fetch Senate Trading:", error)
        return []
    }
}

export const getSenateDisclosure = async (symbol?: string) => {
    // Uses v4 endpoint for senate disclosure by symbol
    let url = `${BASE_URL.replace('v3', 'v4')}/senate-disclosure?apikey=${FMP_API_KEY}`
    if (symbol) {
        url += `&symbol=${symbol}`
    }

    try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`FMP API Error: ${res.status}`)
        return await res.json()
    } catch (error) {
        console.error("Failed to fetch Senate Disclosure:", error)
        return []
    }
}

export const getEarningsTranscripts = async (symbol: string, limit: number = 1) => {
    // Uses v3 endpoint which returns full content
    return fetchFMP(`/earning_call_transcript/${symbol}?limit=${limit}`)
}

// === House Trading Data ===

export const getHouseTrading = async (limit: number = 1000) => {
    // Uses v4 RSS feed endpoint for House disclosures
    const url = `${BASE_URL.replace('v3', 'v4')}/house-disclosure-rss-feed?apikey=${FMP_API_KEY}&limit=${limit}`

    try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`FMP API Error: ${res.status}`)
        return await res.json()
    } catch (error) {
        console.error("Failed to fetch House Trading:", error)
        return []
    }
}

// Congress members to track
export const CONGRESS_MEMBERS = [
    { name: "Warren Davidson", chamber: "house" },
    { name: "Donald Norcross", chamber: "house" },
    { name: "Terri Sewell", chamber: "house" },
    { name: "Bryan Steil", chamber: "house" },
    { name: "Alex Padilla", chamber: "senate" },
    { name: "Nick Lalota", chamber: "house" },
]
