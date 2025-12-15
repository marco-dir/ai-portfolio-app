import { NextResponse } from 'next/server'

const FMP_API_KEY = process.env.FMP_API_KEY
const BASE_URL = "https://financialmodelingprep.com/api/v3"

// Priority exchanges: Milan (1), US (2), Europe (3)
const EXCHANGE_PRIORITY: Record<string, number> = {
    'MIL': 1,      // Borsa Italiana
    'NASDAQ': 2,
    'NYSE': 3,
    'AMEX': 4,
    'LSE': 5,      // London
    'PAR': 6,      // Paris
    'ETR': 7,      // Xetra
    'FRA': 8,      // Frankfurt
    'AMS': 9,      // Amsterdam
    'BME': 10,     // Madrid
    'SWX': 11,     // Swiss
    'BRU': 12,     // Brussels
    'VIE': 13,     // Vienna
    'OSL': 14,     // Oslo
    'STO': 15,     // Stockholm
    'HEL': 16,     // Helsinki
    'CPH': 17,     // Copenhagen
    'LIS': 18,     // Lisbon
    'DUB': 19      // Dublin
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

        // Filter and sort results
        const sortedResults = results
            .filter(item => {
                const exchange = item.exchangeShortName
                // Keep if in priority list or is a major exchange
                return exchange in EXCHANGE_PRIORITY ||
                    ['NASDAQ', 'NYSE', 'AMEX', 'EURONEXT'].includes(exchange) ||
                    item.symbol.includes('.') // Broadly include European tickers
            })
            .sort((a, b) => {
                // 1. Sort by Exchange Priority
                const priorityA = EXCHANGE_PRIORITY[a.exchangeShortName] || 999
                const priorityB = EXCHANGE_PRIORITY[b.exchangeShortName] || 999

                if (priorityA !== priorityB) {
                    return priorityA - priorityB
                }

                // 2. Sort by Exact Match on Symbol
                if (a.symbol === query.toUpperCase()) return -1
                if (b.symbol === query.toUpperCase()) return 1

                // 3. Sort by Name Match
                const queryLower = query.toLowerCase()
                const aNameMatch = a.name.toLowerCase().startsWith(queryLower)
                const bNameMatch = b.name.toLowerCase().startsWith(queryLower)

                if (aNameMatch && !bNameMatch) return -1
                if (!aNameMatch && bNameMatch) return 1

                return 0
            })

        if (sortedResults.length > 0) {
            // Return best match
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
