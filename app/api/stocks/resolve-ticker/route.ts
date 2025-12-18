import { NextResponse } from 'next/server'

const FMP_API_KEY = process.env.FMP_API_KEY
const BASE_URL = "https://financialmodelingprep.com/api/v3"

// Country to preferred exchange mapping
const COUNTRY_EXCHANGE_MAP: Record<string, string[]> = {
    'IT': ['MIL'],                    // Italy → Milan
    'US': ['NASDAQ', 'NYSE', 'AMEX'], // USA → US exchanges
    'GB': ['LSE'],                    // UK → London
    'FR': ['PAR'],                    // France → Paris
    'DE': ['ETR', 'FRA'],             // Germany → Frankfurt/Xetra
    'NL': ['AMS'],                    // Netherlands → Amsterdam
    'ES': ['BME'],                    // Spain → Madrid
    'CH': ['SWX'],                    // Switzerland → Swiss
    'BE': ['BRU'],                    // Belgium → Brussels
    'AT': ['VIE'],                    // Austria → Vienna
    'NO': ['OSL'],                    // Norway → Oslo
    'SE': ['STO'],                    // Sweden → Stockholm
    'FI': ['HEL'],                    // Finland → Helsinki
    'DK': ['CPH'],                    // Denmark → Copenhagen
    'PT': ['LIS'],                    // Portugal → Lisbon
    'IE': ['DUB'],                    // Ireland → Dublin
}

// Default exchange priority: Italian first, then US, then Europe
const DEFAULT_EXCHANGE_PRIORITY: Record<string, number> = {
    'MIL': 1,      // Borsa Italiana - default priority
    'NASDAQ': 2,
    'NYSE': 3,
    'AMEX': 4,
    'LSE': 5,
    'PAR': 6,
    'ETR': 7,
    'FRA': 8,
    'AMS': 9,
    'BME': 10,
    'SWX': 11,
    'BRU': 12,
    'VIE': 13,
    'OSL': 14,
    'STO': 15,
    'HEL': 16,
    'CPH': 17,
    'LIS': 18,
    'DUB': 19
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    if (!FMP_API_KEY) {
        return NextResponse.json({ error: 'FMP API key not configured' }, { status: 500 })
    }

    try {
        const queryUpper = query.toUpperCase()
        const queryLower = query.toLowerCase()

        const response = await fetch(
            `${BASE_URL}/search?query=${encodeURIComponent(query)}&limit=100&apikey=${FMP_API_KEY}`
        )

        if (!response.ok) {
            throw new Error('Failed to fetch from FMP')
        }

        const results: any[] = await response.json()

        if (!Array.isArray(results) || results.length === 0) {
            return NextResponse.json({ error: 'No results found' }, { status: 404 })
        }

        // Filter valid exchanges
        const filtered = results.filter(item => {
            const exchange = item.exchangeShortName
            return exchange in DEFAULT_EXCHANGE_PRIORITY ||
                ['NASDAQ', 'NYSE', 'AMEX', 'EURONEXT'].includes(exchange) ||
                item.symbol.includes('.')
        })

        // PRIORITY 1: Exact ticker match (highest priority)
        const exactMatch = filtered.find(item =>
            item.symbol === queryUpper || item.symbol.toUpperCase() === queryUpper
        )
        if (exactMatch) {
            return NextResponse.json({
                ticker: exactMatch.symbol,
                name: exactMatch.name,
                exchange: exactMatch.exchangeShortName,
                currency: exactMatch.currency
            })
        }

        // PRIORITY 2: For company name searches, prioritize home market
        // First, determine if this looks like a well-known company and get its home country
        const sortedResults = filtered.sort((a, b) => {
            // 2a. Prefer name matches that start with the query
            const aNameMatch = a.name.toLowerCase().startsWith(queryLower)
            const bNameMatch = b.name.toLowerCase().startsWith(queryLower)

            if (aNameMatch && !bNameMatch) return -1
            if (!aNameMatch && bNameMatch) return 1

            // 2b. If both match names, prefer home market based on company country
            // We can infer home market from where the "main" listing is
            // Companies typically have their primary listing in their home country

            // Use default priority (Italy first, then US, then Europe)
            const priorityA = DEFAULT_EXCHANGE_PRIORITY[a.exchangeShortName] || 999
            const priorityB = DEFAULT_EXCHANGE_PRIORITY[b.exchangeShortName] || 999

            return priorityA - priorityB
        })

        if (sortedResults.length > 0) {
            const bestMatch = sortedResults[0]
            return NextResponse.json({
                ticker: bestMatch.symbol,
                name: bestMatch.name,
                exchange: bestMatch.exchangeShortName,
                currency: bestMatch.currency
            })
        }

        return NextResponse.json({ error: 'No suitable match found' }, { status: 404 })

    } catch (error) {
        console.error('Ticker resolution error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
