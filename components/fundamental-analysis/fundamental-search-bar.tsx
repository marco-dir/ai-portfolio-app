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

export function FundamentalSearchBar() {
    const router = useRouter()
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)

    // Priority exchanges: Italian first, then US, then Europe
    const exchangePriority: Record<string, number> = {
        'MIL': 1,      // Milan - prioritized for Italian market
        'NASDAQ': 2,
        'NYSE': 3,
        'AMEX': 4,
        'LSE': 5,
        'PAR': 6,
        'FRA': 7,
        'ETR': 8,
        'AMS': 9,
        'BME': 10,
        'SWX': 11
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
                    `/api/stocks/search?query=${encodeURIComponent(query)}`
                )
                const data: SearchResult[] = await response.json()

                if (!Array.isArray(data)) {
                    setResults([])
                    return
                }

                const queryUpper = query.toUpperCase()
                const queryLower = query.toLowerCase()

                // Filter and sort results
                const filtered = data
                    .filter(item => {
                        const exchange = item.exchangeShortName
                        return exchange in exchangePriority ||
                            ['NASDAQ', 'NYSE', 'AMEX'].includes(exchange) ||
                            item.symbol.includes('.') ||
                            item.currency === 'EUR'
                    })
                    .sort((a, b) => {
                        // PRIORITY 1: Exact ticker match comes first
                        const aExactMatch = a.symbol.toUpperCase() === queryUpper
                        const bExactMatch = b.symbol.toUpperCase() === queryUpper

                        if (aExactMatch && !bExactMatch) return -1
                        if (!aExactMatch && bExactMatch) return 1

                        // PRIORITY 2: Name starts with query
                        const aNameMatch = a.name.toLowerCase().startsWith(queryLower)
                        const bNameMatch = b.name.toLowerCase().startsWith(queryLower)

                        if (aNameMatch && !bNameMatch) return -1
                        if (!aNameMatch && bNameMatch) return 1

                        // PRIORITY 3: Exchange priority (Italy first, then US, then Europe)
                        const priorityA = exchangePriority[a.exchangeShortName] || 999
                        const priorityB = exchangePriority[b.exchangeShortName] || 999

                        if (priorityA !== priorityB) return priorityA - priorityB

                        return a.name.localeCompare(b.name)
                    })
                    .slice(0, 10)

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
        router.push(`/dashboard/analisi-azioni-value?ticker=${symbol}`)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const trimmedQuery = query.trim()
        if (!trimmedQuery) return

        setShowResults(false)
        setIsSearching(true)

        try {
            // Try to resolve ticker via our new API
            const response = await fetch(`/api/stocks/resolve-ticker?query=${encodeURIComponent(trimmedQuery)}`)

            if (response.ok) {
                const data = await response.json()
                router.push(`/dashboard/analisi-azioni-value?ticker=${data.ticker}`)
            } else {
                // Fallback to direct navigation
                router.push(`/dashboard/analisi-azioni-value?ticker=${trimmedQuery.toUpperCase()}`)
            }
        } catch (error) {
            console.error('Ticker resolution failed:', error)
            router.push(`/dashboard/analisi-azioni-value?ticker=${trimmedQuery.toUpperCase()}`)
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
                        placeholder="Inserisci ticker o nome azienda (es. intesa, eni, AAPL)..."
                        className="w-full pl-12 pr-12 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    {isSearching && (
                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" size={20} />
                    )}
                </div>
            </form>

            {/* Results Dropdown */}
            {showResults && results.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                    {results.map((result) => (
                        <button
                            key={`${result.symbol}-${result.exchangeShortName}`}
                            onClick={() => handleSelect(result.symbol)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-b-0 flex items-center justify-between"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-white truncate">{result.name}</div>
                                <div className="text-sm text-gray-400 flex items-center gap-2">
                                    <span className="font-mono bg-gray-800 px-1.5 py-0.5 rounded text-xs border border-gray-700">
                                        {result.symbol}
                                    </span>
                                    <span>•</span>
                                    <span>{result.exchangeShortName}</span>
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 ml-3 font-mono">
                                {result.currency}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
