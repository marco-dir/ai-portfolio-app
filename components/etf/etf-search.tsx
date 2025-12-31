"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, Loader2 } from "lucide-react"

export function ETFSearch({ initialTicker }: { initialTicker?: string }) {
    const router = useRouter()
    const [query, setQuery] = useState(initialTicker || "")
    const [results, setResults] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Debounce manual implementation if hook not found
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2) {
                searchETFs(query)
            } else {
                setResults([])
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [query])

    const searchETFs = async (searchQuery: string) => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/etf/search?query=${encodeURIComponent(searchQuery)}`)
            if (res.ok) {
                const data = await res.json()
                setResults(data)
                setIsOpen(true)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSelect = (symbol: string) => {
        setQuery(symbol)
        setIsOpen(false)
        router.push(`/dashboard/etf?ticker=${symbol}`)
    }

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className="relative w-full max-w-xl" ref={containerRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    placeholder="Cerca un ETF (es. VOO, QQQ)..."
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                />
                {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" size={20} />
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-20">
                    <ul className="max-h-[300px] overflow-y-auto custom-scrollbar">
                        {results.map((etf) => (
                            <li
                                key={etf.symbol}
                                onClick={() => handleSelect(etf.symbol)}
                                className="px-4 py-3 hover:bg-gray-800 cursor-pointer transition-colors border-b border-gray-800 last:border-0"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="font-bold text-white block">{etf.symbol}</span>
                                        <span className="text-xs text-gray-400 truncate max-w-[280px] block">{etf.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded font-medium">ETF</span>
                                        <span className="text-xs text-gray-500 block mt-1">{etf.exchangeShortName}</span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {isOpen && results.length === 0 && query.length >= 2 && !isLoading && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-800 rounded-xl p-4 text-center text-gray-500 z-20">
                    Nessun ETF trovato.
                </div>
            )}
        </div>
    )
}
