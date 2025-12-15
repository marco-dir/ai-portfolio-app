"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, Loader2 } from "lucide-react"

interface SearchResult {
    symbol: string
    name: string
    currency: string
    stockExchange: string
    exchangeShortName: string
}

export function FinancialAnalysisSearch({ initialTicker }: { initialTicker?: string }) {
    const router = useRouter()
    const [query, setQuery] = useState(initialTicker || "")
    const [results, setResults] = useState<SearchResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)

    // Priority exchanges: Italian and American markets first, then other European
    const exchangePriority: Record<string, number> = {
        'MIL': 1,      // Milan (Italian)
        'NASDAQ': 2,   // NASDAQ (American)
        'NYSE': 3,     // NYSE (American)
        'AMEX': 4,     // AMEX (American)
        'CPH': 5,      // Copenhagen (Danish)
        'PAR': 6,      // Paris (French)
        'FRA': 7,      // Frankfurt (German)
        'ETR': 8,      // XETRA (German)
        'AMS': 9,      // Amsterdam (Dutch)
        'BME': 10,     // Madrid (Spanish)
        'SWX': 11,     // Swiss Exchange
        'LSE': 12,     // London
        'BRU': 13,     // Brussels
        'VIE': 14,     // Vienna
        'OSL': 15,     // Oslo
        'STO': 16,     // Stockholm
        'HEL': 17      // Helsinki
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        const searchStocks = async () => {
            if (query.length < 2) {
                setResults([])
                return
            }

            setIsSearching(true)

            try {
                const response = await fetch(
                    `https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(query)}&limit=50&apikey=${process.env.NEXT_PUBLIC_FMP_API_KEY}`
                )
                const data: SearchResult[] = await response.json()

                // Check if data is an array
                if (!Array.isArray(data)) {
                    // FMP sometimes returns {} for no results, which is expected behavior
                    // Silently handle this case without logging
                    setResults([])
                    return
                }

                // Filter and sort results
                const filtered = data
                    .filter(item => {
                        // Include stocks from priority exchanges
                        const exchange = item.exchangeShortName
                        return exchange in exchangePriority ||
                            ['NASDAQ', 'NYSE', 'AMEX'].includes(exchange) ||
                            item.symbol.includes('.')  // European stocks often have dots
                    })
                    .sort((a, b) => {
                        // Sort by exchange priority
                        const priorityA = exchangePriority[a.exchangeShortName] || 999
                        const priorityB = exchangePriority[b.exchangeShortName] || 999

                        if (priorityA !== priorityB) {
                            return priorityA - priorityB
                        }

                        // If same priority, sort by name match
                        const queryLower = query.toLowerCase()
                        const aNameMatch = a.name.toLowerCase().startsWith(queryLower)
                        const bNameMatch = b.name.toLowerCase().startsWith(queryLower)

                        if (aNameMatch && !bNameMatch) return -1
                        if (!aNameMatch && bNameMatch) return 1

                        // Finally, alphabetically
                        return a.name.localeCompare(b.name)
                    })
                    .slice(0, 20) // Limit to top 20 results

                setResults(filtered)
                setShowResults(true)
            } catch (error) {
                console.error('Search error:', error)
                setResults([])
            } finally {
                setIsSearching(false)
            }
        }

        const debounceTimer = setTimeout(searchStocks, 300)
        return () => clearTimeout(debounceTimer)
    }, [query])

    const handleSelect = (symbol: string) => {
        setQuery(symbol)
        setShowResults(false)
        router.push(`/dashboard/financial-analysis?ticker=${symbol}`)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const trimmedQuery = query.trim()

        if (!trimmedQuery) return

        setShowResults(false)
        setIsSearching(true)

        try {
            // Call our API to resolve the query to a ticker
            const response = await fetch(`/api/stocks/resolve-ticker?query=${encodeURIComponent(trimmedQuery)}`)

            if (response.ok) {
                const data = await response.json()
                router.push(`/dashboard/financial-analysis?ticker=${data.ticker}`)
            } else {
                // If resolution fails, try as direct ticker
                router.push(`/dashboard/financial-analysis?ticker=${trimmedQuery.toUpperCase()}`)
            }
        } catch (error) {
            console.error('Ticker resolution error:', error)
            // Fallback to direct ticker search
            router.push(`/dashboard/financial-analysis?ticker=${trimmedQuery.toUpperCase()}`)
        } finally {
            setIsSearching(false)
        }
    }

    return (
        <div ref={searchRef} className="relative w-full max-w-2xl">
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => results.length > 0 && setShowResults(true)}
                        placeholder="Cerca per ticker o nome azienda (es. AAPL, Apple, Ferrari, Novo Nordisk)..."
                        className="w-full pl-12 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    {isSearching && (
                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" size={20} />
                    )}
                </div>
            </form>

            {/* Search Results Dropdown */}
            {showResults && results.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                    {results.map((result) => (
                        <button
                            key={`${result.symbol}-${result.exchangeShortName}`}
                            onClick={() => handleSelect(result.symbol)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="font-medium text-white">{result.name}</div>
                                    <div className="text-sm text-gray-400 mt-0.5">
                                        {result.symbol} • {result.exchangeShortName}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 ml-4">
                                    {result.currency}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* No results message */}
            {showResults && !isSearching && query.length >= 2 && results.length === 0 && (
                <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4 text-center text-gray-400">
                    Nessun risultato trovato per "{query}"
                </div>
            )}
        </div>
    )
}
