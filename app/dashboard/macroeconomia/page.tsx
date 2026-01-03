import { getEconomicIndicator, getTreasuryRates, getQuote } from "@/lib/fmp"
import { formatNumber } from "@/lib/format-utils"
import { TrendingUp, Activity, DollarSign, Percent, Globe, Landmark } from "lucide-react"
import { MacroChart } from "@/components/macro/macro-chart"
import { MacroSidebar } from "@/components/macro/macro-sidebar"

export default async function MacroPage() {
    // Fetch data in parallel
    const [gdpData, cpiData, unemploymentData, treasuryRates, euIndices, asianIndices, forexData, fedFundsRateData] = await Promise.all([
        getEconomicIndicator('GDP'), // Annual or quarterly
        getEconomicIndicator('CPI'),
        getEconomicIndicator('unemploymentRate'),
        getTreasuryRates(),
        getQuote('^STOXX50E,^GDAXI,^FCHI,FTSEMIB.MI,^FTSE'),
        getQuote('^N225,^HSI,000001.SS,^NSEI'), // Asian Indices
        getQuote('EURUSD'),
        getEconomicIndicator('fedFundsRate')
    ])

    // Helper to get latest value
    const getLatest = (data: any[]) => data && data.length > 0 ? data[0] : null

    const latestGDP = getLatest(gdpData)
    const latestCPI = getLatest(cpiData)
    const latestUnemployment = getLatest(unemploymentData)
    const latest10Y = treasuryRates && treasuryRates.length > 0 ? treasuryRates[0].year10 : null

    // EU Data
    const stoxx50 = euIndices?.find((i: any) => i.symbol === '^STOXX50E')
    const dax = euIndices?.find((i: any) => i.symbol === '^GDAXI')
    const cac40 = euIndices?.find((i: any) => i.symbol === '^FCHI')
    const ftseMib = euIndices?.find((i: any) => i.symbol === 'FTSEMIB.MI')
    const ftse100 = euIndices?.find((i: any) => i.symbol === '^FTSE')
    const eurUsd = forexData && forexData.length > 0 ? forexData[0] : null

    // Asian Data
    const nikkei = asianIndices?.find((i: any) => i.symbol === '^N225')
    const hangSeng = asianIndices?.find((i: any) => i.symbol === '^HSI')
    const shanghai = asianIndices?.find((i: any) => i.symbol === '000001.SS')
    const nifty = asianIndices?.find((i: any) => i.symbol === '^NSEI')

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Macroeconomia</h1>
                    <p className="text-gray-400">Panoramica dei principali indicatori economici globali.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Main Content - Left Side */}
                <div className="xl:col-span-3 space-y-8">

                    {/* USA Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <span className="text-lg">🇺🇸</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Stati Uniti</h2>
                                <p className="text-sm text-gray-400">Indicatori Economici Chiave</p>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* GDP Card */}
                            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-5 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
                                <div className="relative">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2.5 bg-blue-500/15 rounded-xl text-blue-400">
                                            <Activity size={20} />
                                        </div>
                                        <p className="text-sm font-medium text-gray-400">GDP (PIL)</p>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-1">
                                        {latestGDP ? formatNumber(latestGDP.value) : 'N/A'}
                                    </h3>
                                    {latestGDP && (
                                        <p className="text-xs text-gray-500">Aggiornato: {latestGDP.date}</p>
                                    )}
                                </div>
                            </div>

                            {/* CPI Card */}
                            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-5 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
                                <div className="relative">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2.5 bg-purple-500/15 rounded-xl text-purple-400">
                                            <TrendingUp size={20} />
                                        </div>
                                        <p className="text-sm font-medium text-gray-400">CPI (Inflazione)</p>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-1">
                                        {latestCPI ? latestCPI.value.toFixed(2) : 'N/A'}
                                    </h3>
                                    {latestCPI && (
                                        <p className="text-xs text-gray-500">Aggiornato: {latestCPI.date}</p>
                                    )}
                                </div>
                            </div>

                            {/* Unemployment Card */}
                            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-5 hover:border-red-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all" />
                                <div className="relative">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2.5 bg-red-500/15 rounded-xl text-red-400">
                                            <UsersIcon className="w-5 h-5" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-400">Disoccupazione</p>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-1">
                                        {latestUnemployment ? `${latestUnemployment.value}%` : 'N/A'}
                                    </h3>
                                    {latestUnemployment && (
                                        <p className="text-xs text-gray-500">Aggiornato: {latestUnemployment.date}</p>
                                    )}
                                </div>
                            </div>

                            {/* Treasury Card */}
                            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-5 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all" />
                                <div className="relative">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2.5 bg-green-500/15 rounded-xl text-green-400">
                                            <Landmark size={20} />
                                        </div>
                                        <p className="text-sm font-medium text-gray-400">Treasury 10Y</p>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-1">
                                        {latest10Y ? `${latest10Y.toFixed(2)}%` : 'N/A'}
                                    </h3>
                                    {treasuryRates && treasuryRates[0] && (
                                        <p className="text-xs text-gray-500">Aggiornato: {treasuryRates[0].date}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <MacroChart
                                data={gdpData ? [...gdpData].slice(0, 50).reverse() : []}
                                dataKey="value"
                                color="#3b82f6"
                                unit="B"
                                title="GDP (Prodotto Interno Lordo)"
                                description="Andamento trimestrale USA"
                            />
                            <MacroChart
                                data={cpiData ? [...cpiData].slice(0, 50).reverse() : []}
                                dataKey="value"
                                color="#8b5cf6"
                                unit=""
                                title="CPI (Inflazione)"
                                description="Indice dei prezzi al consumo"
                            />
                        </div>
                    </div>

                    {/* Europe Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <span className="text-lg">🇪🇺</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Mercati Europei</h2>
                                <p className="text-sm text-gray-400">Principali indici e valute</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Euro Stoxx 50 */}
                            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-5 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
                                <div className="relative">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2.5 bg-indigo-500/15 rounded-xl text-indigo-400">
                                            <Globe size={20} />
                                        </div>
                                        <p className="text-sm font-medium text-gray-400">Euro Stoxx 50</p>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-1">
                                        {stoxx50 ? formatNumber(stoxx50.price) : 'N/A'}
                                    </h3>
                                    {stoxx50 && (
                                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${stoxx50.changesPercentage >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {stoxx50.changesPercentage >= 0 ? '+' : ''}{stoxx50.changesPercentage?.toFixed(2)}%
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* FTSE MIB */}
                            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-5 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all" />
                                <div className="relative">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2.5 bg-green-500/15 rounded-xl text-green-400">
                                            <Globe size={20} />
                                        </div>
                                        <p className="text-sm font-medium text-gray-400">FTSE MIB 🇮🇹</p>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-1">
                                        {ftseMib ? formatNumber(ftseMib.price) : 'N/A'}
                                    </h3>
                                    {ftseMib && (
                                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ftseMib.changesPercentage >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {ftseMib.changesPercentage >= 0 ? '+' : ''}{ftseMib.changesPercentage?.toFixed(2)}%
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* FTSE 100 */}
                            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-5 hover:border-red-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all" />
                                <div className="relative">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2.5 bg-red-500/15 rounded-xl text-red-400">
                                            <Globe size={20} />
                                        </div>
                                        <p className="text-sm font-medium text-gray-400">FTSE 100 🇬🇧</p>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-1">
                                        {ftse100 ? formatNumber(ftse100.price) : 'N/A'}
                                    </h3>
                                    {ftse100 && (
                                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ftse100.changesPercentage >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {ftse100.changesPercentage >= 0 ? '+' : ''}{ftse100.changesPercentage?.toFixed(2)}%
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* EUR/USD */}
                            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-5 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-full blur-2xl group-hover:bg-yellow-500/20 transition-all" />
                                <div className="relative">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2.5 bg-yellow-500/15 rounded-xl text-yellow-400">
                                            <DollarSign size={20} />
                                        </div>
                                        <p className="text-sm font-medium text-gray-400">EUR/USD</p>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-1">
                                        {eurUsd ? eurUsd.price.toFixed(4) : 'N/A'}
                                    </h3>
                                    {eurUsd && (
                                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${eurUsd.changesPercentage >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {eurUsd.changesPercentage >= 0 ? '+' : ''}{eurUsd.changesPercentage?.toFixed(2)}%
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Asia Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                                <span className="text-lg">🌏</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Mercati Asiatici</h2>
                                <p className="text-sm text-gray-400">Principali indici del Pacifico</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Nikkei 225 */}
                            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-5 hover:border-red-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all" />
                                <div className="relative">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2.5 bg-red-500/15 rounded-xl text-red-400">
                                            <Globe size={20} />
                                        </div>
                                        <p className="text-sm font-medium text-gray-400">Nikkei 225 🇯🇵</p>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-1">
                                        {nikkei ? formatNumber(nikkei.price) : 'N/A'}
                                    </h3>
                                    {nikkei && (
                                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${nikkei.changesPercentage >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {nikkei.changesPercentage >= 0 ? '+' : ''}{nikkei.changesPercentage?.toFixed(2)}%
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Hang Seng */}
                            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-5 hover:border-red-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all" />
                                <div className="relative">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2.5 bg-red-500/15 rounded-xl text-red-400">
                                            <Globe size={20} />
                                        </div>
                                        <p className="text-sm font-medium text-gray-400">Hang Seng 🇭🇰</p>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-1">
                                        {hangSeng ? formatNumber(hangSeng.price) : 'N/A'}
                                    </h3>
                                    {hangSeng && (
                                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${hangSeng.changesPercentage >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {hangSeng.changesPercentage >= 0 ? '+' : ''}{hangSeng.changesPercentage?.toFixed(2)}%
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Shanghai */}
                            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-5 hover:border-red-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all" />
                                <div className="relative">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2.5 bg-red-500/15 rounded-xl text-red-400">
                                            <Globe size={20} />
                                        </div>
                                        <p className="text-sm font-medium text-gray-400">Shanghai 🇨🇳</p>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-1">
                                        {shanghai ? formatNumber(shanghai.price) : 'N/A'}
                                    </h3>
                                    {shanghai && (
                                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${shanghai.changesPercentage >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {shanghai.changesPercentage >= 0 ? '+' : ''}{shanghai.changesPercentage?.toFixed(2)}%
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Nifty 50 */}
                            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-5 hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all" />
                                <div className="relative">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2.5 bg-orange-500/15 rounded-xl text-orange-400">
                                            <Globe size={20} />
                                        </div>
                                        <p className="text-sm font-medium text-gray-400">Nifty 50 🇮🇳</p>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-1">
                                        {nifty ? formatNumber(nifty.price) : 'N/A'}
                                    </h3>
                                    {nifty && (
                                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${nifty.changesPercentage >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {nifty.changesPercentage >= 0 ? '+' : ''}{nifty.changesPercentage?.toFixed(2)}%
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Right Side */}
                <div className="xl:col-span-1">
                    <MacroSidebar />
                </div>
            </div>
        </div>
    )
}

function UsersIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
