
import { getProfile, getETFHolders, getETFSectorWeight, getETFCountryWeight } from "@/lib/fmp"
import { ETFSearch } from "@/components/etf/etf-search"
import { formatCurrency, formatNumber } from "@/lib/format-utils"
import { PieChart, Globe, Layers, ArrowUpRight, Info, Loader2 } from "lucide-react"
import { AddToWatchlistButton } from "@/components/fundamental-analysis/add-to-watchlist-button"

export default async function ETFPage({ searchParams }: { searchParams: Promise<{ ticker?: string }> }) {
    const params = await searchParams
    const ticker = params.ticker

    let profile = null
    let holders = null
    let sectors = null
    let countries = null

    if (ticker) {
        try {
            const results = await Promise.allSettled([
                getProfile(ticker),
                getETFHolders(ticker),
                getETFSectorWeight(ticker),
                getETFCountryWeight(ticker)
            ])

            const profileData = results[0].status === 'fulfilled' ? results[0].value : null
            profile = Array.isArray(profileData) ? profileData[0] : profileData
            holders = results[1].status === 'fulfilled' ? results[1].value : null
            sectors = results[2].status === 'fulfilled' ? results[2].value : null
            countries = results[3].status === 'fulfilled' ? results[3].value : null

        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header / Search Hero */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Analisi ETF</h1>
                    <p className="text-gray-400">Esplora la composizione e i dettagli dei fondi ETF.</p>
                </div>
                <ETFSearch initialTicker={ticker} />
            </div>

            {ticker && profile ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* ETF Overview Card */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <Layers size={120} className="text-blue-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="bg-white p-2 rounded-lg">
                                    <img
                                        src={`https://images.financialmodelingprep.com/symbol/${ticker}.png`}
                                        alt={ticker || 'ETF'}
                                        className="w-16 h-16 object-contain"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-2xl font-bold text-white">{profile.companyName}</h2>
                                        <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs font-bold border border-blue-500/20">ETF</span>
                                        <AddToWatchlistButton ticker={ticker} />
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                                        <span>{profile.exchangeShortName}</span>
                                        <span>•</span>
                                        <span>{profile.currency}</span>
                                    </div>
                                    <div className="text-4xl font-bold text-white flex items-end gap-2">
                                        {formatCurrency(profile.price, profile.currency)}
                                        <span className={`text-lg font-medium mb-1 ${profile.changes >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {profile.changes >= 0 ? '+' : ''}{profile.changes} ({((profile.changes / profile.price) * 100).toFixed(2)}%)
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p className="mt-6 text-gray-300 leading-relaxed max-w-4xl">
                                {profile.description}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Holdings */}
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                    <Layers size={20} />
                                </div>
                                <h3 className="text-lg font-semibold text-white">Top 10 Holdings</h3>
                            </div>

                            {holders && holders.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-800">
                                                <th className="pb-3 text-sm font-medium text-gray-400">Asset</th>
                                                <th className="pb-3 text-sm font-medium text-gray-400 text-right">Peso %</th>
                                                <th className="pb-3 text-sm font-medium text-gray-400 text-right">Valore</th>
                                                <th className="pb-3 text-sm font-medium text-gray-400 text-right">Azioni</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {holders.slice(0, 10).map((h: any, i: number) => (
                                                <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                                                    <td className="py-3 text-sm text-white font-medium">
                                                        <div className="flex flex-col">
                                                            <span>{h.asset}</span>
                                                            <span className="text-xs text-gray-500 truncate max-w-[150px]">{h.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 text-sm text-white text-right font-bold">
                                                        {h.weightPercentage?.toFixed(2)}%
                                                    </td>
                                                    <td className="py-3 text-sm text-gray-400 text-right">
                                                        {formatNumber(h.marketValue)}
                                                    </td>
                                                    <td className="py-3 text-sm text-gray-400 text-right">
                                                        {formatNumber(h.sharesNumber)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">Dati holdings non disponibili.</p>
                            )}
                        </div>

                        {/* Sector Allocation */}
                        <div className="space-y-6">
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                                        <PieChart size={20} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">Allocazione Settoriale</h3>
                                </div>
                                {sectors && sectors.length > 0 ? (
                                    <div className="space-y-3">
                                        {sectors.slice(0, 8).map((s: any, i: number) => (
                                            <div key={i} className="group">
                                                <div className="flex justify-between text-sm mb-1 text-gray-300">
                                                    <span>{s.sector}</span>
                                                    <span className="font-medium">{parseFloat(s.weightPercentage).toFixed(2)}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500/60 group-hover:bg-green-500 transition-all duration-500"
                                                        style={{ width: `${s.weightPercentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">Dati settoriali non disponibili.</p>
                                )}
                            </div>

                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
                                        <Globe size={20} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">Esposizione Geografica</h3>
                                </div>
                                {countries && countries.length > 0 ? (
                                    <div className="space-y-3">
                                        {countries.filter((c: any) => c.country).slice(0, 5).map((c: any, i: number) => (
                                            <div key={i} className="group">
                                                <div className="flex justify-between text-sm mb-1 text-gray-300">
                                                    <span>{c.country}</span>
                                                    <span className="font-medium">{parseFloat(c.weightPercentage).toFixed(2)}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-orange-500/60 group-hover:bg-orange-500 transition-all duration-500"
                                                        style={{ width: `${c.weightPercentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">Dati geografici non disponibili.</p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            ) : ticker ? (
                <div className="text-center py-20 text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                    <p>Caricamento dati ETF...</p>
                    <p className="text-xs mt-2">Se il caricamento persiste, verifica che il simbolo sia corretto.</p>
                </div>
            ) : (
                <div className="text-center py-20 text-gray-500 border border-dashed border-gray-800 rounded-xl bg-gray-900/50">
                    <Info className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-bold text-white mb-2">Seleziona un ETF</h3>
                    <p>Utilizza la barra di ricerca in alto per trovare e analizzare un ETF.</p>
                </div>
            )}
        </div>
    )
}
