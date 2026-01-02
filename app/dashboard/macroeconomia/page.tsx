import { getEconomicIndicator, getTreasuryRates, getQuote } from "@/lib/fmp"
import { formatNumber } from "@/lib/format-utils"
import { TrendingUp, Activity, DollarSign, Percent, Globe } from "lucide-react"
import { MacroChart } from "@/components/macro/macro-chart"

export default async function MacroeconomicsPage() {
    // Fetch data in parallel
    const [gdpData, cpiData, unemploymentData, treasuryData, euIndices, asianIndices, forexData] = await Promise.all([
        getEconomicIndicator('GDP'), // Annual or quarterly
        getEconomicIndicator('CPI'),
        getEconomicIndicator('unemploymentRate'),
        getTreasuryRates('2000-01-01', new Date().toISOString().split('T')[0]),
        getQuote('^STOXX50E,^GDAXI,^FCHI,FTSEMIB.MI,^FTSE'), // Added ^FTSE
        getQuote('^N225,^HSI,000001.SS,^NSEI'), // Asian Indices
        getQuote('EURUSD')
    ])

    // Helper to get latest value
    const getLatest = (data: any[]) => data && data.length > 0 ? data[0] : null

    const latestGDP = getLatest(gdpData)
    const latestCPI = getLatest(cpiData)
    const latestUnemployment = getLatest(unemploymentData)
    const latestTreasury = getLatest(treasuryData) ? treasuryData[0] : null

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
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Macroeconomia</h1>
                    <p className="text-gray-400">Indicatori economici globali e tassi di interesse.</p>
                </div>
            </div>

            {/* USA Section */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-blue-400">🇺🇸</span> Stati Uniti
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* GDP Card */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                                <Activity size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">USA GDP (PIL)</p>
                                <h3 className="text-xl font-bold text-white">
                                    {latestGDP ? formatNumber(latestGDP.value) : 'N/A'}
                                </h3>
                            </div>
                        </div>
                        {latestGDP && (
                            <p className="text-xs text-gray-500">Data: {latestGDP.date}</p>
                        )}
                    </div>

                    {/* CPI Card */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-red-500/10 rounded-lg text-red-400">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">USA CPI (Inflazione)</p>
                                <h3 className="text-xl font-bold text-white">
                                    {latestCPI ? formatNumber(latestCPI.value) : 'N/A'}
                                </h3>
                            </div>
                        </div>
                        {latestCPI && (
                            <p className="text-xs text-gray-500">Data: {latestCPI.date}</p>
                        )}
                    </div>

                    {/* Unemployment Card */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-orange-500/10 rounded-lg text-orange-400">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">USA Disoccupazione</p>
                                <h3 className="text-xl font-bold text-white">
                                    {latestUnemployment ? `${latestUnemployment.value}%` : 'N/A'}
                                </h3>
                            </div>
                        </div>
                        {latestUnemployment && (
                            <p className="text-xs text-gray-500">Data: {latestUnemployment.date}</p>
                        )}
                    </div>

                    {/* Treasury 10Y Card */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
                                <Percent size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">USA Treasury 10Y</p>
                                <h3 className="text-xl font-bold text-white">
                                    {latestTreasury ? `${latestTreasury.year10}%` : 'N/A'}
                                </h3>
                            </div>
                        </div>
                        {latestTreasury && (
                            <p className="text-xs text-gray-500">Data: {latestTreasury.date}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <MacroChart
                        title="Trend USA GDP"
                        data={gdpData?.slice(0, 50)}
                        dataKey="value"
                        color="#3B82F6"
                    />
                    <MacroChart
                        title="Trend USA CPI"
                        data={cpiData?.slice(0, 50)}
                        dataKey="value"
                        color="#EF4444"
                    />
                    <MacroChart
                        title="Trend USA Disoccupazione"
                        data={unemploymentData?.slice(0, 50)}
                        dataKey="value"
                        color="#F97316"
                        unit="%"
                    />
                    <MacroChart
                        title="Trend USA Treasury 10Y"
                        data={treasuryData?.slice(0, 50)}
                        dataKey="year10"
                        color="#22C55E"
                        unit="%"
                    />
                </div>
            </div>

            {/* Europe Section */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-blue-400">🇪🇺</span> Mercati Europei
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Euro Stoxx 50 */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
                                <Globe size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Euro Stoxx 50</p>
                                <h3 className="text-xl font-bold text-white">
                                    {stoxx50 ? formatNumber(stoxx50.price) : 'N/A'}
                                </h3>
                            </div>
                        </div>
                        {stoxx50 && (
                            <p className={`text-sm font-medium ${stoxx50.changesPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {stoxx50.changesPercentage >= 0 ? '+' : ''}{stoxx50.changesPercentage?.toFixed(2)}%
                            </p>
                        )}
                    </div>

                    {/* FTSE MIB (Italy) */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
                                <Globe size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">FTSE MIB (Italia)</p>
                                <h3 className="text-xl font-bold text-white">
                                    {ftseMib ? formatNumber(ftseMib.price) : 'N/A'}
                                </h3>
                            </div>
                        </div>
                        {ftseMib && (
                            <p className={`text-sm font-medium ${ftseMib.changesPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {ftseMib.changesPercentage >= 0 ? '+' : ''}{ftseMib.changesPercentage?.toFixed(2)}%
                            </p>
                        )}
                    </div>

                    {/* DAX (Germany) */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-400">
                                <Globe size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">DAX (Germania)</p>
                                <h3 className="text-xl font-bold text-white">
                                    {dax ? formatNumber(dax.price) : 'N/A'}
                                </h3>
                            </div>
                        </div>
                        {dax && (
                            <p className={`text-sm font-medium ${dax.changesPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {dax.changesPercentage >= 0 ? '+' : ''}{dax.changesPercentage?.toFixed(2)}%
                            </p>
                        )}
                    </div>

                    {/* CAC 40 (France) */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                                <Globe size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">CAC 40 (Francia)</p>
                                <h3 className="text-xl font-bold text-white">
                                    {cac40 ? formatNumber(cac40.price) : 'N/A'}
                                </h3>
                            </div>
                        </div>
                        {cac40 && (
                            <p className={`text-sm font-medium ${cac40.changesPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {cac40.changesPercentage >= 0 ? '+' : ''}{cac40.changesPercentage?.toFixed(2)}%
                            </p>
                        )}
                    </div>

                    {/* FTSE 100 (UK) */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-red-500/10 rounded-lg text-red-400">
                                <Globe size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">FTSE 100 (UK)</p>
                                <h3 className="text-xl font-bold text-white">
                                    {ftse100 ? formatNumber(ftse100.price) : 'N/A'}
                                </h3>
                            </div>
                        </div>
                        {ftse100 && (
                            <p className={`text-sm font-medium ${ftse100.changesPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {ftse100.changesPercentage >= 0 ? '+' : ''}{ftse100.changesPercentage?.toFixed(2)}%
                            </p>
                        )}
                    </div>

                    {/* EUR/USD */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">EUR/USD</p>
                                <h3 className="text-xl font-bold text-white">
                                    {eurUsd ? eurUsd.price?.toFixed(4) : 'N/A'}
                                </h3>
                            </div>
                        </div>
                        {eurUsd && (
                            <p className={`text-sm font-medium ${eurUsd.changesPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {eurUsd.changesPercentage >= 0 ? '+' : ''}{eurUsd.changesPercentage?.toFixed(2)}%
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Asia Section */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-red-500">🌏</span> Mercati Asiatici
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Nikkei 225 (Japan) */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-red-500/10 rounded-lg text-red-400">
                                <Globe size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Nikkei 225 (Giappone)</p>
                                <h3 className="text-xl font-bold text-white">
                                    {nikkei ? formatNumber(nikkei.price) : 'N/A'}
                                </h3>
                            </div>
                        </div>
                        {nikkei && (
                            <p className={`text-sm font-medium ${nikkei.changesPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {nikkei.changesPercentage >= 0 ? '+' : ''}{nikkei.changesPercentage?.toFixed(2)}%
                            </p>
                        )}
                    </div>

                    {/* Hang Seng (China/HK) */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-red-500/10 rounded-lg text-red-400">
                                <Globe size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Hang Seng (Hong Kong)</p>
                                <h3 className="text-xl font-bold text-white">
                                    {hangSeng ? formatNumber(hangSeng.price) : 'N/A'}
                                </h3>
                            </div>
                        </div>
                        {hangSeng && (
                            <p className={`text-sm font-medium ${hangSeng.changesPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {hangSeng.changesPercentage >= 0 ? '+' : ''}{hangSeng.changesPercentage?.toFixed(2)}%
                            </p>
                        )}
                    </div>

                    {/* Shanghai Composite */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-red-500/10 rounded-lg text-red-400">
                                <Globe size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Shanghai (Cina)</p>
                                <h3 className="text-xl font-bold text-white">
                                    {shanghai ? formatNumber(shanghai.price) : 'N/A'}
                                </h3>
                            </div>
                        </div>
                        {shanghai && (
                            <p className={`text-sm font-medium ${shanghai.changesPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {shanghai.changesPercentage >= 0 ? '+' : ''}{shanghai.changesPercentage?.toFixed(2)}%
                            </p>
                        )}
                    </div>

                    {/* Nifty 50 (India) */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-orange-500/10 rounded-lg text-orange-400">
                                <Globe size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Nifty 50 (India)</p>
                                <h3 className="text-xl font-bold text-white">
                                    {nifty ? formatNumber(nifty.price) : 'N/A'}
                                </h3>
                            </div>
                        </div>
                        {nifty && (
                            <p className={`text-sm font-medium ${nifty.changesPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {nifty.changesPercentage >= 0 ? '+' : ''}{nifty.changesPercentage?.toFixed(2)}%
                            </p>
                        )}
                    </div>
                </div>
            </div>

        </div>
    )
}
