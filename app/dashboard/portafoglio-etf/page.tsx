"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts"
import { AlertTriangle, Loader2, PieChart as PieChartIcon, RefreshCw, TrendingUp, DollarSign, Briefcase, BarChart3 } from "lucide-react"

export default function ETFPortfolioPage() {
    const [assetsData, setAssetsData] = useState<any[]>([])
    const [etfData, setEtfData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isPrivate, setIsPrivate] = useState(false)

    // Main Asset Allocation GID (Sheet 1 / gid=0)
    const ASSETS_GID = '0'
    // ETF GID (gid=449934496)
    const ETF_GID = '449934496'
    // Performance GID (gid=680500086)
    const PERF_GID = '680500086'

    const [perfData, setPerfData] = useState<any[]>([])

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        setIsPrivate(false)
        try {
            const [assetsRes, etfRes, perfRes] = await Promise.all([
                fetch("/api/etf-portfolio/data?gid=" + ASSETS_GID),
                fetch("/api/etf-portfolio/data?gid=" + ETF_GID),
                fetch("/api/etf-portfolio/data?gid=" + PERF_GID)
            ])

            if (assetsRes.status === 403 || etfRes.status === 403 || perfRes.status === 403) {
                setIsPrivate(true)
                setLoading(false)
                return
            }

            if (!assetsRes.ok || !etfRes.ok) throw new Error('Failed to fetch data')

            const assetsJson = await assetsRes.json()
            const etfJson = await etfRes.json()
            const perfJson = await perfRes.json()

            if (assetsJson.error === 'SHEET_PRIVATE' || etfJson.error === 'SHEET_PRIVATE') {
                setIsPrivate(true)
                setLoading(false)
                return
            }

            setAssetsData(assetsJson.data || assetsJson)
            setEtfData(etfJson.data || etfJson)
            setPerfData(perfJson.data || perfJson)
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
                <p className="text-gray-400">Caricamento Portafoglio ETF...</p>
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
    const assetKey = headers[0] || 'ASSET'

    // Find total row
    const totalRow = assetsData.find(row => {
        const val = row[assetKey]
        return val && typeof val === 'string' && val.toUpperCase() === 'TOTALE'
    })

    // Filter out total row and header rows
    const filteredAssets = assetsData.filter(row => {
        const val = row[assetKey]
        if (!val) return false
        if (typeof val === 'string' && val.toUpperCase() === 'TOTALE') return false
        if (typeof val === 'string' && val.toLowerCase().includes('unità')) return false
        return true
    })

    // Totals for KPI
    let totalValue = 0
    let totalPL = 0
    let totalPLPercent = 0

    if (totalRow) {
        totalValue = parseItNum(totalRow['Valore Finale'] || totalRow['Valore'] || Object.values(totalRow)[3])
        totalPL = parseItNum(totalRow['Profit Loss'] || totalRow['PL Euro'] || Object.values(totalRow)[5])
        totalPLPercent = parseItNum(totalRow['PL'] || totalRow['PL %'] || Object.values(totalRow)[6])
    } else {
        totalValue = filteredAssets.reduce((acc, curr) => acc + parseItNum(curr['Valore Finale'] || curr['Valore'] || Object.values(curr)[3]), 0)
    }

    // Chart Data
    const chartData = filteredAssets.map((item, index) => {
        const name = item[assetKey] || 'Unknown'
        const valKey = 'Valore Finale' in item ? 'Valore Finale' : ('Valore' in item ? 'Valore' : headers[3])
        const value = parseItNum(item[valKey])
        return { name, value, color: COLORS[index % COLORS.length] }
    }).filter(item => item.value > 0)

    // Exclude 'Unnamed' columns
    const allowedHeaders = headers.filter((h) => h && !h.startsWith('Unnamed'))

    // Prepare Performance Data
    const chartPerfData = perfData.map(row => {
        const values = Object.values(row)
        const date = values[0] as string // Column A
        const valStr = values[5] as string // Column F (0-indexed 5)

        if (!date || !valStr) return null

        const cleanVal = typeof valStr === 'string' ? valStr.replace(/[€\s]/g, '').replace(/\./g, '').replace(',', '.') : valStr
        const val = parseFloat(cleanVal as string)

        if (isNaN(val)) return null

        return { date, value: val }
    }).filter(d => d !== null)

    return (
        <div className="p-6 space-y-8 min-h-screen bg-[#0a0a0a] text-gray-100">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Briefcase className="w-8 h-8 text-blue-500" />
                        Portafoglio ETF
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Analisi asset allocation del portafoglio ETF.
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" /> Aggiorna Dati
                </button>
            </div>

            {/* STRATEGY & CHART SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* YTD CHART */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            Andamento Anno in Corso
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full">
                            {chartPerfData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartPerfData}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#9ca3af"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            minTickGap={30}
                                        />
                                        <YAxis
                                            hide={true}
                                            domain={['auto', 'auto']}
                                        />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                            formatter={(value: any) => [`€ ${value.toLocaleString('it-IT')}`, 'Valore']}
                                            labelStyle={{ color: '#9ca3af' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorValue)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                                    Dati grafico non disponibili
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* STRATEGY TEXT */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-purple-500" />
                            Strategia del Portafoglio
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-300 leading-relaxed text-sm font-medium">
                            Portafoglio focalizzato su investimenti in ETF ed ETC con alto rendimento e rischio minimo basato sulla massimizzazione dello Sharpe Ratio:
                        </p>
                        <div className="space-y-4 mt-2">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                                <div>
                                    <span className="text-white font-medium text-sm block mb-1">Fondi:</span>
                                    <span className="text-gray-400 text-sm leading-relaxed">
                                        Selezione di ETF di indici azionari mondiali, Obbligazioni, Materie Prime e Criptovalute con Target al 100%
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0"></div>
                                <div>
                                    <span className="text-white font-medium text-sm block mb-1">Liquidità ed Equivalenti:</span>
                                    <span className="text-gray-400 text-sm leading-relaxed">
                                        Derivante da vendita ETF.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Valore Totale</CardTitle>
                        <DollarSign className="w-4 h-4 text-blue-500" />
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
                                        <Cell key={`cell-${index}`} fill={entry.color} />
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

            {/* ETF SECTION */}
            {
                etfData.length > 0 && (() => {
                    const etfHeaders = Object.keys(etfData[0])
                    const etfCodeKey = etfHeaders.find(h => h.toLowerCase().includes('codice')) || etfHeaders[0]
                    const settoreKey = etfHeaders.find(h => h.toLowerCase().includes('settore')) || etfHeaders[1]
                    const vmKey = etfHeaders.find(h => h.toLowerCase().includes('valore mercato')) || etfHeaders.find(h => h.toLowerCase().includes('vm')) || etfHeaders[7]
                    const vmPercentKey = etfHeaders.find(h => h === 'VM %') || etfHeaders[8]

                    // Filter out TOTALE row
                    const etfFiltered = etfData.filter(row => {
                        const codeVal = row[etfCodeKey]
                        if (!codeVal) return false
                        if (typeof codeVal === 'string' && codeVal.toUpperCase() === 'TOTALE') return false
                        return true
                    })



                    // Chart data using settore (sector) for better visualization
                    const ETF_COLORS = ['#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#ef4444', '#6366f1', '#14b8a6']
                    const etfChartData = etfFiltered.map((item, index) => {
                        const name = item[settoreKey] || item[etfCodeKey] || 'Unknown'
                        const value = parseItNum(item[vmKey] || Object.values(item)[7])
                        return { name, value, color: ETF_COLORS[index % ETF_COLORS.length] }
                    }).filter(item => item.value > 0)

                    // Allowed headers for table (exclude Unnamed columns)
                    const etfAllowedHeaders = etfHeaders.filter(h => h && !h.startsWith('Unnamed'))

                    return (
                        <>


                            {/* ETF CHART AND TABLE */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* ETF CHART */}
                                <Card className="bg-gray-900 border-gray-800 lg:col-span-1">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                                            <PieChartIcon className="w-5 h-5 text-amber-500" />
                                            ETF Allocation
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="h-[350px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={etfChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {etfChartData.map((entry, index) => (
                                                        <Cell key={`etf-cell-${index}`} fill={entry.color} />
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

                                {/* ETF TABLE */}
                                <Card className="bg-gray-900 border-gray-800 lg:col-span-2">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5 text-amber-500" />
                                            Dettaglio ETF
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left text-gray-400">
                                                <thead className="text-xs text-gray-500 uppercase bg-gray-800/50">
                                                    <tr>
                                                        {etfAllowedHeaders.map((header) => (
                                                            <th key={header} className="px-4 py-3 whitespace-nowrap">{header.split(' ')[0]}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {etfFiltered.map((row, index) => (
                                                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/20">
                                                            {Object.keys(row).map((key, i) => {
                                                                if (!etfAllowedHeaders.includes(key)) return null
                                                                const value = row[key]
                                                                const isProfit = key.toLowerCase().includes('profit') || key.toLowerCase().includes('pl')
                                                                const isChange = key.toLowerCase().includes('delta') || key.toLowerCase().includes('change')
                                                                let colorClass = 'text-gray-300'

                                                                if ((isProfit || isChange) && typeof value === 'string') {
                                                                    const numValue = parseItNum(value)
                                                                    if (numValue > 0) colorClass = 'text-green-500'
                                                                    else if (numValue < 0) colorClass = 'text-red-500'
                                                                }

                                                                return (
                                                                    <td key={i} className={`px-4 py-4 font-medium whitespace-nowrap ${colorClass}`}>
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
                    )
                })()
            }
        </div >
    )
}
