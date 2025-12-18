"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, Line, LineChart, Area, AreaChart, XAxis, YAxis, CartesianGrid } from "recharts" // Added Area-related imports
import { AlertTriangle, Loader2, PieChart as PieChartIcon, RefreshCw, TrendingUp } from "lucide-react"

export default function AggressivePortfolioPage() {
    const [assetsData, setAssetsData] = useState<any[]>([])
    const [fundsData, setFundsData] = useState<any[]>([])
    const [stocksData, setStocksData] = useState<any[]>([])
    const [bondsData, setBondsData] = useState<any[]>([])
    const [trendData, setTrendData] = useState<any[]>([])
    const [movementsData, setMovementsData] = useState<any[]>([]) // New state
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isPrivate, setIsPrivate] = useState(false)

    // Main Asset Allocation GID (Sheet 1 / gid=0)
    const ASSETS_GID = '0'
    // Funds GID
    const FUNDS_GID = '2128694464'
    // Stocks GID
    const STOCKS_GID = '891644766'
    // Bonds GID
    const BONDS_GID = '973887992'
    // Trend GID
    const TREND_GID = '253102702'
    // Movements GID
    const MOVEMENTS_GID = '1928467527'

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        setIsPrivate(false)
        try {
            const [assetsRes, fundsRes, stocksRes, bondsRes, trendRes, movementsRes] = await Promise.all([
                fetch("/api/aggressive-portfolio/data?gid=" + ASSETS_GID),
                fetch("/api/aggressive-portfolio/data?gid=" + FUNDS_GID),
                fetch("/api/aggressive-portfolio/data?gid=" + STOCKS_GID),
                fetch("/api/aggressive-portfolio/data?gid=" + BONDS_GID),
                fetch("/api/aggressive-portfolio/data?gid=" + TREND_GID),
                fetch("/api/aggressive-portfolio/data?gid=" + MOVEMENTS_GID)
            ])

            if (assetsRes.status === 403 || fundsRes.status === 403 || stocksRes.status === 403 || bondsRes.status === 403 || trendRes.status === 403 || movementsRes.status === 403) {
                setIsPrivate(true)
                setLoading(false)
                return
            }

            if (!assetsRes.ok || !fundsRes.ok || !stocksRes.ok || !bondsRes.ok || !trendRes.ok || !movementsRes.ok) {
                throw new Error('Failed to fetch data')
            }

            const assetsJson = await assetsRes.json()
            const fundsJson = await fundsRes.json()
            const stocksJson = await stocksRes.json()
            const bondsJson = await bondsRes.json()
            const trendJson = await trendRes.json()
            const movementsJson = await movementsRes.json()

            if (assetsJson.error === 'SHEET_PRIVATE' || fundsJson.error === 'SHEET_PRIVATE' || stocksJson.error === 'SHEET_PRIVATE' || bondsJson.error === 'SHEET_PRIVATE' || trendJson.error === 'SHEET_PRIVATE' || movementsJson.error === 'SHEET_PRIVATE') {
                setIsPrivate(true)
                setLoading(false)
                return
            }

            setAssetsData(assetsJson.data || assetsJson)
            setFundsData(fundsJson.data || fundsJson)
            setStocksData(stocksJson.data || stocksJson)
            setBondsData(bondsJson.data || bondsJson)
            setTrendData(trendJson.data || trendJson)
            setMovementsData(movementsJson.data || movementsJson)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-400">Caricamento portafoglio aggressivo...</p>
            </div>
        )
    }

    if (isPrivate) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Accesso Negato</h2>
                <p className="text-gray-400 max-w-md mb-6">
                    Il foglio Google sembra essere privato. Assicurati che le impostazioni di condivisione siano su "Chiunque abbia il link" può visualizzare.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => window.open('https://docs.google.com/spreadsheets/d/1lPjBmL0g2Og_L1IJ36vvOmYSO5vg6bMjNYpp9j580TE/edit?gid=0#gid=0', '_blank')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    >
                        Apri Foglio
                    </button>
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" /> Riprova
                    </button>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-red-400 mb-4">Errore: {error}</p>
                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
                >
                    Riprova
                </button>
            </div>
        )
    }

    // --- PARSING LOGIC ---

    // 1. Helpers
    const parseItNum = (val: any) => {
        if (typeof val !== 'string') return 0
        const clean = val.replace(/[€%\s]/g, '').replace(/\./g, '').replace(',', '.')
        return parseFloat(clean) || 0
    }

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6']

    // 2. ASSETS Parsing (Separate Total Row)
    const assetKey = assetsData.length > 0 ? Object.keys(assetsData[0])[0] : 'ASSET'

    // Find row where first column is "TOTALE"
    const totalRow = assetsData.find(row => {
        const val = row[assetKey]
        return val && typeof val === 'string' && val.toUpperCase() === 'TOTALE'
    })

    const filteredAssets = assetsData.filter(row => {
        const val = row[assetKey]
        return !val || (typeof val === 'string' && val.toUpperCase() !== 'TOTALE')
    })

    // Extract Totals for KPI
    let totalValue = 0
    let totalPL = 0
    let totalPLPercent = 0

    if (totalRow) {
        // Heuristics: Valore Finale (idx 3), PL Euro (idx 5), PL % (idx 6)
        totalValue = parseItNum(totalRow['Valore Finale'] || totalRow['Value'] || Object.values(totalRow)[3])
        totalPL = parseItNum(totalRow['Profit Loss'] || totalRow['PL Euro'] || Object.values(totalRow)[5])
        totalPLPercent = parseItNum(totalRow['PL'] || totalRow['PL %'] || Object.values(totalRow)[6])
    }

    // Prepare Assets Chart Data
    const assetsChartData = filteredAssets.map(item => {
        const name = item[assetKey] || 'Unknown'
        const valueRaw = item['Valore Finale'] || item['Value'] || Object.values(item)[3] || '0'
        const value = parseItNum(valueRaw)
        return { name, value, rawValue: valueRaw }
    }).filter(item => item.value > 0)

    // 3. FUNDS Parsing
    const fundsList = fundsData.filter((row: any) => {
        const firstVal = Object.values(row)[0] as string
        return firstVal && firstVal !== 'Codice' && firstVal.toUpperCase() !== 'TOTALE'
    })

    const fundsBySector: Record<string, number> = {}
    fundsList.forEach((fund: any) => {
        const sector = fund['Settore'] || Object.values(fund)[1] || 'Altro'
        // Priority: Valore Mercato
        let val = 0
        if (fund['Valore Mercato']) val = parseItNum(fund['Valore Mercato'])
        else if (fund['Valore ad oggi']) val = parseItNum(fund['Valore ad oggi'])
        else if (fund['Valore']) val = parseItNum(fund['Valore'])
        else {
            const valKey = Object.keys(fund).find(k => typeof fund[k] === 'string' && fund[k].includes('€'))
            if (valKey) val = parseItNum(fund[valKey])
        }

        if (typeof sector === 'string') {
            fundsBySector[sector] = (fundsBySector[sector] || 0) + val
        }
    })

    const fundsChartData = Object.keys(fundsBySector).map((sector, index) => ({
        name: sector,
        value: fundsBySector[sector],
        color: COLORS[index % COLORS.length]
    }))

    const fundsHeaders = fundsData.length > 0 ? Object.keys(fundsData[0]) : []
    const allowedFundsHeaders = fundsHeaders.filter((_, i) => i !== 2 && i !== 3)

    // 4. STOCKS Parsing
    const stocksList = stocksData.filter((row: any) => {
        const firstVal = Object.values(row)[0] as string
        return firstVal && firstVal !== 'Codice' && firstVal.toUpperCase() !== 'TOTALE'
    })

    const stocksBySector: Record<string, number> = {}
    const stocksByCountry: Record<string, number> = {}

    stocksList.forEach((stock: any) => {
        const sector = stock['Settore'] || Object.values(stock)[2] || 'Altro'
        const country = stock['Paese'] || Object.values(stock)[3] || 'Altro'

        // Priority: Valore Mercato
        let val = 0
        if (stock['Valore Mercato']) val = parseItNum(stock['Valore Mercato'])
        else if (stock['Valore Finale']) val = parseItNum(stock['Valore Finale'])
        else if (stock['Valore']) val = parseItNum(stock['Valore'])
        else {
            const valKey = Object.keys(stock).find(k => typeof stock[k] === 'string' && stock[k].includes('€'))
            if (valKey) val = parseItNum(stock[valKey])
        }

        if (typeof sector === 'string') stocksBySector[sector] = (stocksBySector[sector] || 0) + val
        if (typeof country === 'string') stocksByCountry[country] = (stocksByCountry[country] || 0) + val
    })

    const stocksSectorChartData = Object.keys(stocksBySector).map((k, i) => ({
        name: k, value: stocksBySector[k], color: COLORS[i % COLORS.length]
    }))
    const stocksCountryChartData = Object.keys(stocksByCountry).map((k, i) => ({
        name: k, value: stocksByCountry[k], color: COLORS[(i + 4) % COLORS.length]
    }))

    const stocksHeaders = stocksData.length > 0 ? Object.keys(stocksData[0]) : []
    const allowedStocksHeaders = stocksHeaders.filter((_, i) => i !== 4 && i !== 15)

    // 5. BONDS Parsing
    const bondsList = bondsData.filter((row: any) => {
        const firstVal = Object.values(row)[0] as string
        return firstVal && firstVal !== 'Codice' && firstVal.toUpperCase() !== 'TOTALE'
    })

    const bondsByCountry: Record<string, number> = {}
    const bondsByRating: Record<string, number> = {}

    bondsList.forEach((bond: any) => {
        // 'Titolo' implies Country/Issuer (e.g. ITALIA, GERMANIA)
        const country = bond['Titolo'] || bond['Country'] || Object.values(bond)[2] || 'Altro'
        const rating = bond['Rating'] || Object.values(bond)[3] || 'Altro'

        // Priority: Valore Mercato
        let val = 0
        if (bond['Valore Mercato']) val = parseItNum(bond['Valore Mercato'])
        else if (bond['Valore Finale']) val = parseItNum(bond['Valore Finale'])
        else if (bond['Valore']) val = parseItNum(bond['Valore'])
        else {
            const valKey = Object.keys(bond).find(k => typeof bond[k] === 'string' && bond[k].includes('€'))
            if (valKey) val = parseItNum(bond[valKey])
        }

        if (typeof country === 'string') bondsByCountry[country] = (bondsByCountry[country] || 0) + val
        if (typeof rating === 'string') bondsByRating[rating] = (bondsByRating[rating] || 0) + val
    })

    const bondsCountryChartData = Object.keys(bondsByCountry).map((k, i) => ({
        name: k, value: bondsByCountry[k], color: COLORS[i % COLORS.length]
    }))

    const bondsRatingChartData = Object.keys(bondsByRating).map((k, i) => ({
        name: k, value: bondsByRating[k], color: COLORS[(i + 4) % COLORS.length]
    }))

    const bondsHeaders = bondsData.length > 0 ? Object.keys(bondsData[0]) : []
    const allowedBondsHeaders = bondsHeaders.filter((_, i) => i !== 14 && i !== 15)

    // 6. TREND Parsing
    // Expect columns A (date) and G (value) - skipping header if present
    const trendChartData = trendData.length > 1 ? trendData.slice(1).map((row: any) => {
        // Handle array or object
        // If object from json with headers:
        //  row['Date'] or Object.values(row)[0]
        // If array of values: row[0]
        // The API likely returns array of objects labeled by header if headers exist.
        // Let's assume generic object values access:
        const values = Object.values(row)
        const date = values[0] as string
        const valueRaw = values[6] as string
        const value = parseItNum(valueRaw)

        if (!date || isNaN(value)) return null
        return { date, value }
    }).filter(Boolean) as { date: string, value: number }[] : []

    // 7. MOVEMENTS Parsing
    const latestMovements = movementsData.map(row => {
        // Assume Column A is index 0 or 'Movimento' if headers exist.
        // Likely API returns array of objects with header keys if header row exists.
        // If simply raw: Object.values(row)[0]
        return Object.values(row)[0] as string
    }).filter(val => val && typeof val === 'string' && val.length > 0).slice(0, 10) // Limit to 10?


    return (
        <div className="p-6 space-y-8 min-h-screen bg-[#0a0a0a] text-gray-100">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-red-500" />
                        Portafoglio Aggressivo
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Analisi asset allocation e performance strategia aggressiva.
                    </p>
                </div>
            </div>

            {/* TREND & STRATEGY & MOVEMENTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* TREND CHART (2 Cols) */}
                {trendChartData.length > 0 ? (
                    <Card className="bg-gray-900 border-gray-800 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-500" />
                                Andamento Anno in Corso
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendChartData}>
                                    <defs>
                                        <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#9ca3af"
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => {
                                            if (typeof value === 'string') {
                                                const parts = value.split('/')
                                                // Check if DD/MM/YYYY
                                                if (parts.length >= 2) return `${parts[0]}/${parts[1]}`
                                            }
                                            return value
                                        }}
                                        minTickGap={30}
                                    />
                                    <YAxis
                                        stroke="#9ca3af"
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                                    />
                                    <RechartsTooltip
                                        formatter={(value: number) => [`€ ${value.toLocaleString('it-IT')}`, 'Valore']}
                                        labelStyle={{ color: '#fff' }}
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorTrend)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                ) : null}

                {/* STRATEGY CARD (1 Col) */}
                <Card className="bg-gray-900 border-gray-800 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-500" />
                            Strategia Portafoglio
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-gray-300 text-sm"> {/* Reduced text size for better fit */}
                        <p>
                            Portafoglio focalizzato su investimenti ad alto rischio:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-1">
                            <li>
                                <span className="font-semibold text-white">Fondi (10%):</span> ETF indici azionari mondiali e materie prime.
                            </li>
                            <li>
                                <span className="font-semibold text-white">Azioni (80%):</span> Area Euro e USA.
                            </li>
                            <li>
                                <span className="font-semibold text-white">Obbligazioni (10%):</span> Titoli di Stato e Corporate Euro.
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                {/* MOVEMENTS CARD (1 Col) */}
                <Card className="bg-gray-900 border-gray-800 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 text-green-500" />
                            Ultimi Movimenti
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {latestMovements.length > 0 ? (
                                latestMovements.map((mov, i) => (
                                    <li key={i} className="text-sm text-gray-400 border-b border-gray-800 pb-2 last:border-0">
                                        {mov}
                                    </li>
                                ))
                            ) : (
                                <li className="text-sm text-gray-500">Nessun movimento recente.</li>
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* KPI CARDS (TOTALS) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Valore Totale</CardTitle>
                        <AlertTriangle className={`h-4 w-4 ${totalValue > 0 ? 'text-green-500' : 'text-gray-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">€ {totalValue.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                        <p className="text-xs text-gray-500">Valore attuale del portafoglio</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Profit/Loss Totale</CardTitle>
                        <TrendingUp className={`h-4 w-4 ${totalPL >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${totalPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {totalPL >= 0 ? '+' : ''}€ {totalPL.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                        <p className={`text-xs ${totalPLPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {totalPLPercent >= 0 ? '+' : ''}{totalPLPercent.toFixed(2)}%
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Asset Count</CardTitle>
                        <PieChartIcon className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{filteredAssets.length}</div>
                        <p className="text-xs text-gray-500">Classi di asset</p>
                    </CardContent>
                </Card>
            </div>


            {/* ASSET ALLOCATION SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-gray-900 border-gray-800 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                            <PieChartIcon className="w-5 h-5 text-blue-400" />
                            Asset Allocation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={assetsChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {assetsChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value: number) => `${value.toFixed(2)}%`}
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium text-white">Dettaglio Asset</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-800/50">
                                    <tr>
                                        {filteredAssets.length > 0 && Object.keys(filteredAssets[0]).map((header) => (
                                            <th key={header} className="px-6 py-3">{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAssets.map((row, index) => (
                                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/20">
                                            {Object.entries(row).map(([key, val]: [string, any], i) => {
                                                const isProfit = key.toLowerCase().includes('profit') || key.toLowerCase().includes('pl') || key.toLowerCase().includes('gain')
                                                let colorClass = 'text-gray-300'

                                                if (isProfit && typeof val === 'string') {
                                                    const numValue = parseItNum(val)
                                                    if (numValue > 0) colorClass = 'text-green-500'
                                                    else if (numValue < 0) colorClass = 'text-red-500'
                                                }

                                                return (
                                                    <td key={i} className={`px-6 py-4 font-medium ${colorClass}`}>
                                                        {val}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredAssets.length === 0 && (
                                <p className="text-center py-8 text-gray-500">Nessun dato disponibile.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* FUNDS SECTION */}
            {fundsList.length > 0 && (
                <>
                    <div className="flex items-center gap-2 mt-12 mb-4">
                        <TrendingUp className="w-6 h-6 text-green-500" />
                        <h2 className="text-2xl font-bold text-white">Fondi</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="bg-gray-900 border-gray-800 lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium text-white">Allocazione Settoriale</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={fundsChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {fundsChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value: number) => `€ ${value.toLocaleString('it-IT')}`}
                                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="bg-gray-900 border-gray-800 lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium text-white">Dettaglio Fondi</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-400">
                                        <thead className="text-xs text-gray-500 uppercase bg-gray-800/50">
                                            <tr>
                                                {allowedFundsHeaders.map((header) => (
                                                    <th key={header} className="px-6 py-3">{header}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {fundsList.map((row: any, index: number) => (
                                                <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/20">
                                                    {Object.keys(row).map((key, i) => {
                                                        if (!allowedFundsHeaders.includes(key)) return null
                                                        const value = row[key]
                                                        const isProfit = key.toLowerCase().includes('profit') || key.toLowerCase().includes('pl') || key.toLowerCase().includes('gain')
                                                        let colorClass = 'text-gray-300'

                                                        if (isProfit && typeof value === 'string') {
                                                            const numValue = parseItNum(value)
                                                            if (numValue > 0) colorClass = 'text-green-500'
                                                            else if (numValue < 0) colorClass = 'text-red-500'
                                                        }

                                                        return (
                                                            <td key={i} className={`px-6 py-4 font-medium ${colorClass}`}>
                                                                {value}
                                                            </td>
                                                        )
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {/* STOCKS SECTION */}
            {stocksList.length > 0 && (
                <>
                    <div className="flex items-center gap-2 mt-12 mb-4">
                        <TrendingUp className="w-6 h-6 text-purple-500" />
                        <h2 className="text-2xl font-bold text-white">Azioni</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* CHART 1: SECTOR */}
                        <Card className="bg-gray-900 border-gray-800 lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium text-white">Allocazione Settoriale</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stocksSectorChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {stocksSectorChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value: number) => `€ ${value.toLocaleString('it-IT')}`}
                                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* CHART 2: COUNTRY */}
                        <Card className="bg-gray-900 border-gray-800 lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium text-white">Allocazione Geografica</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stocksCountryChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {stocksCountryChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value: number) => `€ ${value.toLocaleString('it-IT')}`}
                                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>


                        {/* STOCKS TABLE */}
                        {/* Full width table */}
                    </div>

                    <div className="mt-6">
                        <Card className="bg-gray-900 border-gray-800 w-full">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium text-white">Dettaglio Azioni</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-400">
                                        <thead className="text-xs text-gray-500 uppercase bg-gray-800/50">
                                            <tr>
                                                {allowedStocksHeaders.map((header) => (
                                                    <th key={header} className="px-6 py-3">{header}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stocksList.map((row: any, index: number) => (
                                                <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/20">
                                                    {Object.keys(row).map((key, i) => {
                                                        if (!allowedStocksHeaders.includes(key)) return null
                                                        const value = row[key]
                                                        const isProfit = key.toLowerCase().includes('profit') || key.toLowerCase().includes('pl') || key.toLowerCase().includes('gain')
                                                        let colorClass = 'text-gray-300'

                                                        if (isProfit && typeof value === 'string') {
                                                            const numValue = parseItNum(value)
                                                            if (numValue > 0) colorClass = 'text-green-500'
                                                            else if (numValue < 0) colorClass = 'text-red-500'
                                                        }

                                                        return (
                                                            <td key={i} className={`px-6 py-4 font-medium ${colorClass}`}>
                                                                {value}
                                                            </td>
                                                        )
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {/* BONDS SECTION */}
            {bondsList.length > 0 && (
                <>
                    <div className="flex items-center gap-2 mt-12 mb-4">
                        <TrendingUp className="w-6 h-6 text-yellow-500" />
                        <h2 className="text-2xl font-bold text-white">Obbligazioni</h2>
                    </div>
                    {/* Charts Grid - 2 Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* CHART 1: Country */}
                        <Card className="bg-gray-900 border-gray-800">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium text-white">Allocazione Paese</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={bondsCountryChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {bondsCountryChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value: number) => `€ ${value.toLocaleString('it-IT')}`}
                                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* CHART 2: Rating */}
                        <Card className="bg-gray-900 border-gray-800">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium text-white">Allocazione Rating</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={bondsRatingChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {bondsRatingChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value: number) => `€ ${value.toLocaleString('it-IT')}`}
                                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* BONDS TABLE (Full Width) */}
                    <Card className="bg-gray-900 border-gray-800 w-full mb-8">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium text-white">Dettaglio Obbligazioni</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-400">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-800/50">
                                        <tr>
                                            {allowedBondsHeaders.map((header) => (
                                                <th key={header} className="px-6 py-3">{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bondsList.map((row: any, index: number) => (
                                            <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/20">
                                                {Object.keys(row).map((key, i) => {
                                                    if (!allowedBondsHeaders.includes(key)) return null
                                                    const value = row[key]
                                                    const isProfit = key.toLowerCase().includes('profit') || key.toLowerCase().includes('pl') || key.toLowerCase().includes('gain')
                                                    let colorClass = 'text-gray-300'

                                                    if (isProfit && typeof value === 'string') {
                                                        const numValue = parseItNum(value)
                                                        if (numValue > 0) colorClass = 'text-green-500'
                                                        else if (numValue < 0) colorClass = 'text-red-500'
                                                    }

                                                    return (
                                                        <td key={i} className={`px-6 py-4 font-medium ${colorClass}`}>
                                                            {value}
                                                        </td>
                                                    )
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
