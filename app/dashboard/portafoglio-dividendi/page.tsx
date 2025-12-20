"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, CartesianGrid, XAxis, YAxis, BarChart, Bar, AreaChart, Area } from "recharts"
import { AlertTriangle, Loader2, PieChart as PieChartIcon, RefreshCw, TrendingUp, DollarSign } from "lucide-react"

export default function DividendPortfolioPage() {
    const [assetsData, setAssetsData] = useState<any[]>([])
    const [stocksData, setStocksData] = useState<any[]>([])
    const [dividendsData, setDividendsData] = useState<any[]>([])
    const [trendData, setTrendData] = useState<any[]>([])
    const [movementsData, setMovementsData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isPrivate, setIsPrivate] = useState(false)

    // Main Asset Allocation GID (Sheet 1 / gid=0)
    const ASSETS_GID = '0'
    // Stocks GID
    const STOCKS_GID = '891644766'
    // Dividends GID
    const DIVIDENDS_GID = '1291537086'
    // Trend GID
    const TREND_GID = '1638542434'
    // Movements GID
    const MOVEMENTS_GID = '1166378610'

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        setIsPrivate(false)
        try {
            // Core data fetch
            const [assetsRes, stocksRes, dividendsRes, trendRes] = await Promise.all([
                fetch("/api/dividend-portfolio/data?gid=" + ASSETS_GID),
                fetch("/api/dividend-portfolio/data?gid=" + STOCKS_GID),
                fetch("/api/dividend-portfolio/data?gid=" + DIVIDENDS_GID),
                fetch("/api/dividend-portfolio/data?gid=" + TREND_GID)
            ])

            if (assetsRes.status === 403 || stocksRes.status === 403 || dividendsRes.status === 403 || trendRes.status === 403) {
                setIsPrivate(true)
                setLoading(false)
                return
            }

            if (!assetsRes.ok || !stocksRes.ok || !dividendsRes.ok || !trendRes.ok) throw new Error('Failed to fetch data')

            const assetsJson = await assetsRes.json()
            const stocksJson = await stocksRes.json()
            const dividendsJson = await dividendsRes.json()
            const trendJson = await trendRes.json()

            if (assetsJson.error === 'SHEET_PRIVATE' || stocksJson.error === 'SHEET_PRIVATE' || dividendsJson.error === 'SHEET_PRIVATE' || trendJson.error === 'SHEET_PRIVATE') {
                setIsPrivate(true)
                setLoading(false)
                return
            }

            setAssetsData(assetsJson.data || assetsJson)
            setStocksData(stocksJson.data || stocksJson)
            setDividendsData(dividendsJson.data || dividendsJson)
            setTrendData(trendJson.data || trendJson)

            // Optional: Movements fetch (don't fail if this errors)
            try {
                const movementsRes = await fetch("/api/dividend-portfolio/data?gid=" + MOVEMENTS_GID)
                if (movementsRes.ok) {
                    const movementsJson = await movementsRes.json()
                    if (!movementsJson.error) {
                        setMovementsData(movementsJson.data || movementsJson)
                    }
                }
            } catch {
                // Silently ignore movements errors
            }
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
                <p className="text-gray-400">Caricamento portafoglio dividendi...</p>
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
                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" /> Riprova
                </button>
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
    const parseItNum = (val: any) => {
        if (typeof val !== 'string') return 0
        const clean = val.replace(/[€%\s]/g, '').replace(/\./g, '').replace(',', '.')
        return parseFloat(clean) || 0
    }

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6']

    const headers = assetsData.length > 0 ? Object.keys(assetsData[0]) : []
    // Assume header "ASSET" for name, and implicit total row.
    // Try to filter out total row and known empty headers if any.

    // Note: Adjust column names based on actual CSV. 
    // Usually: 'Asset Class' or similar as key 0.
    const assetKey = headers[0] || 'Asset'

    // Check for row starting with 'TOTALE'
    const totalRow = assetsData.find(row => {
        const val = row[assetKey]
        return val && typeof val === 'string' && val.toUpperCase() === 'TOTALE'
    })

    const filteredAssets = assetsData.filter(row => {
        const val = row[assetKey]
        return !val || (typeof val === 'string' && val.toUpperCase() !== 'TOTALE')
    })

    // Totals for KPI
    let totalValue = 0
    let totalPL = 0
    let totalPLPercent = 0

    if (totalRow) {
        // Heuristics based on other portfolios: 
        // Valore Finale (idx ~3?), PL (idx ~5?)
        // We will look for explicit headers if possible, or fallbacks
        totalValue = parseItNum(totalRow['Valore Finale'] || totalRow['Valore'] || Object.values(totalRow)[3])
        totalPL = parseItNum(totalRow['Profit Loss'] || totalRow['PL Euro'] || Object.values(totalRow)[5])
        totalPLPercent = parseItNum(totalRow['PL'] || totalRow['PL %'] || Object.values(totalRow)[6])
    } else {
        // Sum up if no total row
        totalValue = filteredAssets.reduce((acc, curr) => acc + parseItNum(curr['Valore Finale'] || curr['Valore'] || Object.values(curr)[3]), 0)
    }

    // Chart Data
    const chartData = filteredAssets.map(item => {
        const name = item[assetKey] || 'Unknown'
        // Try to find value column.
        const valKey = 'Valore Finale' in item ? 'Valore Finale' : ('Valore' in item ? 'Valore' : headers[3])
        const value = parseItNum(item[valKey])
        return { name, value }
    }).filter(item => item.value > 0)

    // Exclude 'Unnamed' columns and Column I (Index 8)
    const allowedHeaders = headers.filter((h, index) => h && !h.startsWith('Unnamed') && index !== 8)

    // --- STOCKS PARSING ---
    const stocksList = stocksData.filter((row: any) => {
        const firstVal = Object.values(row)[0] as string
        return firstVal && firstVal !== 'Codice' && firstVal.toUpperCase() !== 'TOTALE'
    })

    const stocksBySector: Record<string, number> = {}
    const stocksByCountry: Record<string, number> = {}

    stocksList.forEach((stock: any) => {
        // Assumptions for columns based on typical format or finding headers:
        // Sector usually index ~2, Country ~3
        // If headers exist:
        const sector = stock['Settore'] || Object.values(stock)[2] || 'Altro'
        const country = stock['Paese'] || Object.values(stock)[3] || 'Altro'

        // Priority: Valore Mercato
        let val = 0
        if (stock['Valore Mercato']) val = parseItNum(stock['Valore Mercato'])
        else if (stock['Valore Finale']) val = parseItNum(stock['Valore Finale'])
        else if (stock['Valore']) val = parseItNum(stock['Valore'])
        else {
            // Fallback: look for EUR symbol
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
    // Exclude Column E (index 4) and Column P (index 15)
    // Also exclude unnamed
    const allowedStocksHeaders = stocksHeaders.filter((h, i) => h && !h.startsWith('Unnamed') && i !== 4 && i !== 15)

    // --- DIVIDENDS PARSING ---
    const dividendsHeaders = dividendsData.length > 0 ? Object.keys(dividendsData[0]) : []

    // Filter rows (exclude header row if exists and TOTALE)
    const dividendsList = dividendsData.filter((row: any) => {
        const firstVal = Object.values(row)[0] as string
        return firstVal && firstVal.toUpperCase() !== 'TOTALE' && !firstVal.toLowerCase().includes('ticker')
    })

    // Columns A (0), B (1), C (2), L (11) to AA (26)
    // Table headers: indices 0, 1, 2, 11-26
    const allowedDividendsTableIndices = [0, 1, 2, ...Array.from({ length: 16 }, (_, i) => 11 + i)] // 0,1,2, 11-26
    const allowedDividendsHeaders = dividendsHeaders.filter((_, i) => allowedDividendsTableIndices.includes(i) && dividendsHeaders[i])

    // Chart data: columns L (11) to W (22) - 12 months of data
    // We need to aggregate monthly totals across all stocks
    const monthlyDividends: number[] = Array(12).fill(0)
    const chartColumnIndices = Array.from({ length: 12 }, (_, i) => 11 + i) // L=11 to W=22

    dividendsList.forEach((row: any) => {
        chartColumnIndices.forEach((colIndex, monthIndex) => {
            const value = Object.values(row)[colIndex]
            const numValue = parseItNum(value as string)
            monthlyDividends[monthIndex] += numValue
        })
    })

    const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
    const dividendsChartData = monthlyDividends.map((value, i) => ({
        name: monthNames[i],
        month: i + 1,
        value: value,
        fill: '#10b981'
    }))

    // --- TREND PARSING ---
    // Expect columns A (date) and G (value) - skipping header if present
    const trendChartData = trendData.length > 1 ? trendData.slice(1).map((row: any) => {
        const values = Object.values(row)
        const date = values[0] as string
        const valueRaw = values[6] as string
        const value = parseItNum(valueRaw)

        if (!date || isNaN(value)) return null
        return { date, value }
    }).filter(Boolean) as { date: string, value: number }[] : []

    // --- MOVEMENTS PARSING ---
    // Column A only - show latest movements
    const movementsList = movementsData.length > 0
        ? movementsData.slice(0, 10).map((row: any) => Object.values(row)[0] as string).filter(Boolean)
        : []

    return (
        <div className="p-6 space-y-8 min-h-screen bg-[#0a0a0a] text-gray-100">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-green-500" />
                        Portafoglio Dividendi
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Analisi asset allocation titoli da dividendo.
                    </p>
                </div>
            </div>

            {/* TREND CHART + STRATEGY + MOVEMENTS */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* TREND CHART */}
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
                                    <linearGradient id="colorTrendDiv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                                    formatter={(value: any) => [`€ ${value.toLocaleString('it-IT')}`, 'Valore']}
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                    labelStyle={{ color: '#9ca3af' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fill="url(#colorTrendDiv)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* STRATEGY CARD */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                            <PieChartIcon className="w-5 h-5 text-green-500" />
                            Strategia del Portafoglio
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-300 leading-relaxed text-sm">
                            Portafoglio con rischio elevato focalizzato su investimenti in Azioni con un rendimento sul Dividendo medio alto in crescita negli anni:
                        </p>
                        <div className="space-y-3 mt-4">
                            <div className="flex items-start gap-3">
                                <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                                <div>
                                    <span className="text-white font-medium text-sm">Azioni:</span>
                                    <span className="text-gray-400 ml-2 text-sm">Azioni area Euro e USA con Target al 100%</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                                <div>
                                    <span className="text-white font-medium text-sm">Liquidità ed Equivalenti:</span>
                                    <span className="text-gray-400 ml-2 text-sm">derivante da vendita o Dividendi</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* MOVEMENTS CARD */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 text-yellow-500" />
                            Ultimi Movimenti
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {movementsList.length > 0 ? (
                            <ul className="space-y-2 text-sm">
                                {movementsList.map((movement, i) => (
                                    <li key={i} className="text-gray-300 border-b border-gray-800 pb-2 last:border-0">
                                        {movement}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm">Nessun movimento recente</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Valore Totale</CardTitle>
                        <DollarSign className="w-4 h-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">€ {totalValue.toLocaleString('it-IT')}</div>
                        <p className="text-xs text-gray-500 mt-1">Valore attuale mercato</p>
                    </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">P/L Totale €</CardTitle>
                        <TrendingUp className={`w-4 h-4 ${totalPL >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${totalPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {totalPL >= 0 ? '+' : ''}€ {totalPL.toLocaleString('it-IT')}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Guadagno/Perdita nominale</p>
                    </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">P/L Totale %</CardTitle>
                        <TrendingUp className={`w-4 h-4 ${totalPLPercent >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${totalPLPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {totalPLPercent >= 0 ? '+' : ''}{totalPLPercent.toFixed(2)}%
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Performance percentuale</p>
                    </CardContent>
                </Card>
            </div>

            {/* CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* CHART */}
                <Card className="bg-gray-900 border-gray-800 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                            <PieChartIcon className="w-5 h-5 text-purple-500" />
                            Asset Allocation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value: any) => `€ ${value.toLocaleString('it-IT')}`}
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* TABLE */}
                <Card className="bg-gray-900 border-gray-800 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium text-white">Dettaglio Asset</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-800/50">
                                    <tr>
                                        {allowedHeaders.map((header) => (
                                            <th key={header} className="px-6 py-3">{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAssets.map((row, index) => (
                                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/20">
                                            {Object.keys(row).map((key, i) => {
                                                if (!allowedHeaders.includes(key)) return null
                                                const value = row[key]
                                                const isProfit = key.toLowerCase().includes('profit') || key.toLowerCase().includes('pl')
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

            {/* STOCKS SECTION */}
            <div className="space-y-6 pt-6 border-t border-gray-800">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-blue-500" />
                    Dettaglio Azioni
                </h2>

                {/* STOCKS CHARTS (Sector & Country) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium text-white">Allocazione per Settore</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={stocksSectorChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {stocksSectorChartData.map((entry, index) => (
                                            <Cell key={`cell-sector-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(value: any) => `€ ${value.toLocaleString('it-IT')}`} contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium text-white">Allocazione per Paese</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={stocksCountryChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {stocksCountryChartData.map((entry, index) => (
                                            <Cell key={`cell-country-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(value: any) => `€ ${value.toLocaleString('it-IT')}`} contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* STOCKS TABLE */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium text-white">Lista Azioni</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-800/50">
                                    <tr>
                                        {allowedStocksHeaders.map((header) => (
                                            <th key={header} className="px-6 py-3 whitespace-nowrap">{header}</th>
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
                                                    <td key={i} className={`px-6 py-4 whitespace-nowrap font-medium ${colorClass}`}>
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

            {/* DIVIDENDS SECTION */}
            <div className="space-y-6 pt-6 border-t border-gray-800">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-green-500" />
                    Dettaglio Dividendi
                </h2>

                {/* DIVIDENDS CHART */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium text-white">Dividendi Mensili</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dividendsChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <RechartsTooltip
                                    formatter={(value: any) => `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                />
                                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* DIVIDENDS TABLE */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium text-white">Lista Dividendi per Azione</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-800/50">
                                    <tr>
                                        {allowedDividendsHeaders.map((header) => (
                                            <th key={header} className="px-6 py-3 whitespace-nowrap">{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {dividendsList.map((row: any, index: number) => (
                                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/20">
                                            {Object.keys(row).map((key, i) => {
                                                if (!allowedDividendsHeaders.includes(key)) return null
                                                const value = row[key]
                                                let colorClass = 'text-gray-300'

                                                // Color numeric values
                                                if (typeof value === 'string' && i >= 3) {
                                                    const numValue = parseItNum(value)
                                                    if (numValue > 0) colorClass = 'text-green-500'
                                                }

                                                return (
                                                    <td key={i} className={`px-6 py-4 whitespace-nowrap font-medium ${colorClass}`}>
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
        </div>
    )
}
