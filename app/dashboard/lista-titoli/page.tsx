"use client"

import { useState, useEffect } from "react"
import { Trash2, Plus, Search, TrendingUp, TrendingDown } from "lucide-react"

type StockData = {
  symbol: string
  price: number
  change: number
  name: string
  pe?: number
  pb?: number
  divYield?: number
  marketCap?: number
  high52?: number
  low52?: number
  currency?: string
  peg?: number
}

export default function WatchlistPage() {
  const [stocks, setStocks] = useState<StockData[]>([])
  const [newSymbol, setNewSymbol] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWatchlist()
  }, [])

  const fetchWatchlist = async () => {
    try {
      const res = await fetch("/api/watchlist")
      const data = await res.json()

      const stockPromises = data.symbols.map(async (symbol: string) => {
        try {
          const quoteRes = await fetch(`/api/stocks/quote?symbol=${symbol}`)
          if (quoteRes.ok) {
            return await quoteRes.json()
          }
          return { symbol, price: 0, change: 0, name: symbol }
        } catch (e) {
          return { symbol, price: 0, change: 0, name: symbol }
        }
      })

      const stockData = await Promise.all(stockPromises)
      setStocks(stockData)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSymbol) return

    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: newSymbol }),
      })
      if (res.ok) {
        setNewSymbol("")
        fetchWatchlist()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleRemove = async (symbol: string) => {
    try {
      const res = await fetch(`/api/watchlist?symbol=${symbol}`, {
        method: "DELETE",
      })
      if (res.ok) {
        fetchWatchlist()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const formatLargeNumber = (num?: number) => {
    if (!num) return "-"
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T"
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B"
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M"
    return num.toLocaleString()
  }

  const getCurrencySymbol = (currency?: string) => {
    if (!currency) return "$"
    if (currency === "EUR") return "€"
    if (currency === "GBP") return "£"
    return "$"
  }

  return (
    <div className="max-w-7xl space-y-8">
      <h1 className="text-3xl font-bold text-white">Watchlist</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <form onSubmit={handleAdd} className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              placeholder="Inserisci simbolo (es. NVDA)"
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus size={20} /> Aggiungi
          </button>
        </form>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Caricamento...</div>
        ) : (
          <div className="space-y-2">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-12 gap-2 px-6 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-3">Titolo</div>
              <div className="col-span-2 text-right">Prezzo</div>
              <div className="col-span-1 text-right">P/E</div>
              <div className="col-span-1 text-right">P/B</div>
              <div className="col-span-1 text-right">Div%</div>
              <div className="col-span-1 text-right">Mkt Cap</div>
              <div className="col-span-1 text-right">PEG</div>
              <div className="col-span-2"></div>
            </div>

            {stocks.map((stock) => (
              <div key={stock.symbol} className="group p-2 bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors grid grid-cols-1 md:grid-cols-12 gap-2 items-center">

                {/* Symbol & Name */}
                <div className="md:col-span-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {stock.symbol.substring(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white truncate">{stock.symbol}</div>
                    <div className="text-xs text-gray-400 truncate">{stock.name}</div>
                  </div>
                </div>

                {/* Price */}
                <div className="md:col-span-2 flex items-center justify-between md:block md:text-right">
                  <span className="md:hidden text-gray-500 text-sm">Prezzo</span>
                  <div>
                    <div className="font-bold text-white">{getCurrencySymbol(stock.currency)}{stock.price.toFixed(2)}</div>
                    <div className={`flex items-center md:justify-end gap-1 text-xs ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stock.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {stock.change.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="md:col-span-1 flex justify-between md:block md:text-right">
                  <span className="md:hidden text-gray-500 text-sm">P/E</span>
                  <div className="text-sm text-gray-300">{stock.pe ? stock.pe.toFixed(2) : "-"}</div>
                </div>
                <div className="md:col-span-1 flex justify-between md:block md:text-right">
                  <span className="md:hidden text-gray-500 text-sm">P/B</span>
                  <div className="text-sm text-gray-300">{stock.pb ? stock.pb.toFixed(2) : "-"}</div>
                </div>
                <div className="md:col-span-1 flex justify-between md:block md:text-right">
                  <span className="md:hidden text-gray-500 text-sm">Div%</span>
                  <div className="text-sm text-gray-300">{stock.divYield ? stock.divYield.toFixed(2) + "%" : "-"}</div>
                </div>
                <div className="md:col-span-1 flex justify-between md:block md:text-right">
                  <span className="md:hidden text-gray-500 text-sm">Mkt Cap</span>
                  <div className="text-sm text-gray-300">{formatLargeNumber(stock.marketCap)}</div>
                </div>
                <div className="md:col-span-1 flex justify-between md:block md:text-right">
                  <span className="md:hidden text-gray-500 text-sm">PEG</span>
                  <div className="text-sm text-gray-300">{stock.peg ? stock.peg.toFixed(2) : "-"}</div>
                </div>

                {/* Actions */}
                <div className="md:col-span-2 flex justify-end">
                  <button
                    onClick={() => handleRemove(stock.symbol)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors opacity-100 md:opacity-0 group-hover:opacity-100"
                    title="Rimuovi dalla watchlist"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {stocks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                La tua watchlist è vuota.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
