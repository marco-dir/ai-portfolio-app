
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts"
import { ArrowUpRight, DollarSign, PieChart as PieChartIcon, Loader2, AlertTriangle, RefreshCw } from "lucide-react"

export default function ModeratePortfolioPage() {
    const [assetsData, setAssetsData] = useState<any[]>([])
    const [fundsData, setFundsData] = useState<any[]>([])
    const [stocksData, setStocksData] = useState<any[]>([])
    const [bondsData, setBondsData] = useState<any[]>([])
    const [currentYearData, setCurrentYearData] = useState<any[]>([])
    const [movementsData, setMovementsData] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isPrivate, setIsPrivate] = useState(false)

    // Main Asset Allocation GID for Moderate Portfolio (Sheet 1)
    const ASSETS_GID = '0'
    // Funds GID for Moderate Portfolio
    const FUNDS_GID = '2128694464'
    // Stocks GID for Moderate Portfolio
    const STOCKS_GID = '891644766'
    // Bonds GID for Moderate Portfolio
    const BONDS_GID = '973887992'
    // Current Year Trend GID
    const CURRENT_YEAR_GID = '66856670'
    // Latest Movements GID
    const MOVEMENTS_GID = '181850621'

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        setIsPrivate(false)
        try {
            const [assetsRes, fundsRes, stocksRes, bondsRes, currentYearRes, movementsRes] = await Promise.all([
                fetch("/api/moderate-portfolio/data?gid=" + ASSETS_GID),
                fetch("/api/moderate-portfolio/data?gid=" + FUNDS_GID),
                fetch("/api/moderate-portfolio/data?gid=" + STOCKS_GID),
                fetch("/api/moderate-portfolio/data?gid=" + BONDS_GID),
                fetch("/api/moderate-portfolio/data?gid=" + CURRENT_YEAR_GID),
                fetch("/api/moderate-portfolio/data?gid=" + MOVEMENTS_GID)
            ])

            if (assetsRes.status === 403 || fundsRes.status === 403 || stocksRes.status === 403 || bondsRes.status === 403 || currentYearRes.status === 403) {
                setIsPrivate(true)
                setLoading(false)
                return
            }

            if (!assetsRes.ok || !fundsRes.ok || !stocksRes.ok || !bondsRes.ok || !currentYearRes.ok) {
                throw new Error('Failed to fetch data')
            }

            const assetsJson = await assetsRes.json()
            const fundsJson = await fundsRes.json()
            const stocksJson = await stocksRes.json()
            const bondsJson = await bondsRes.json()
            const currentYearJson = await currentYearRes.json()

            if (assetsJson.error === 'SHEET_PRIVATE' || fundsJson.error === 'SHEET_PRIVATE' || stocksJson.error === 'SHEET_PRIVATE' || bondsJson.error === 'SHEET_PRIVATE' || currentYearJson.error === 'SHEET_PRIVATE' || (!movementsRes.ok && movementsRes.status === 403)) { // Check movements implicitly or add explict check if json available
                // Note: logic simplified for brevity, assume similar error handling or robust check
                setIsPrivate(true)
                setLoading(false)
                return
            }

            // Re-fetch movements json if check passed or assume valid
            const movementsJson = await movementsRes.json()

            if (movementsJson.error === 'SHEET_PRIVATE') {
                setIsPrivate(true)
                return
            }

            setAssetsData(assetsJson.data || assetsJson) // Handle potential data wrapping
            setFundsData(fundsJson.data || fundsJson)
            setStocksData(stocksJson.data || stocksJson)
            setBondsData(bondsJson.data || bondsJson)
            setCurrentYearData(currentYearJson.data || currentYearJson)

            // Parse movements: take column A
            const movementsList = Array.isArray(movementsJson) ? movementsJson : (movementsJson.data || [])
            const parsedMovements = movementsList
                .map((row: any) => row['A'] || row[0])
                .filter((item: any) => item && typeof item === 'string' && item.trim() !== '')

            setMovementsData(parsedMovements)
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
                <p className="text-gray-400">Caricamento dati Portafoglio Moderato...</p>
            </div>
        )
    }

    if (isPrivate) {
        return (
            <div className="max-w-3xl mx-auto mt-12 p-8 bg-yellow-900/20 border border-yellow-900/50 rounded-xl text-center">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Accesso Negato al Foglio</h2>
                <p className="text-gray-300 mb-6">
                    Il foglio Google è privato. Per permettere alla dashboard di leggere i dati, devi renderlo accessibile a "Chiunque abbia il link" (Viewer access).
                </p>
                <button
                    onClick={fetchData}
                    className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                >
                    <RefreshCw size={20} />
                    Riprova
                </button>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center p-12">
                <p className="text-red-400">Si è verificato un errore: {error}</p>
                <button onClick={fetchData} className="mt-4 text-blue-400 hover:underline">Riprova</button>
            </div>
        )
    }

    // --- Parsing Logic ---

    // Helper to parse Italian number format (1.000,00)
    const parseItNum = (val: any) => {
        if (typeof val !== 'string') return 0
        // Remove currency symbols, remove dots (thousands), replace comma with dot
        const clean = val.replace(/[€%\s]/g, '').replace(/\./g, '').replace(',', '.')
        return parseFloat(clean) || 0
    }

    // 1. Assets Data parsing
    const parsedAssets = assetsData
        .filter((row: any) => row.ASSET && row.ASSET !== 'Unità' && row.ASSET !== 'TOTALE')
        .map((row: any) => ({
            name: row.ASSET,
            initialValue: parseItNum(row['Valore Iniziale']),
            finalValue: parseItNum(row['Valore Finale']),
            target: parseItNum(row['TARGET']),
            plEuro: parseItNum(row['Profit Loss']),
            plPercent: parseItNum(row['PL'])
        }))
        .filter(asset => asset.finalValue > 0 || asset.initialValue > 0)

    // Calculate Asset Totals
    const totalValue = parsedAssets.reduce((sum, asset) => sum + asset.finalValue, 0)
    const totalInvested = parsedAssets.reduce((sum, asset) => sum + asset.initialValue, 0)
    const totalGain = totalValue - totalInvested
    const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0

    // Chart Data Assets
    const assetsChartData = parsedAssets.map((asset, index) => ({
        name: asset.name,
        value: asset.finalValue,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][index % 5] || '#9ca3af'
    }))

    // 2. Funds Data Parsing
    const parsedFunds = fundsData
        .filter((row: any) => row['Codice'] && row['Codice'] !== 'Codice' && row['Codice'] !== 'TOTALE')
        .map((row: any) => ({
            code: row['Codice'],
            sector: row['Settore'],
            // Column C and D exclusions: We simply don't map them here for display if we don't need them.
            // Assuming C is 'Delta giornaliero' and D is 'P carico'
            quantity: parseItNum(row['Quantità']),
            priceMarket: parseItNum(row['P mercato']),
            valueMarket: parseItNum(row['Valore Mercato']),
            plEuro: parseItNum(row['Profit Loss']),
            plPercent: parseItNum(row['PL'])
        }))
        .filter(fund => fund.valueMarket > 0)

    // Funds Sector Allocation
    const fundsBySector: Record<string, number> = {}
    parsedFunds.forEach(fund => {
        const sector = fund.sector || 'Altro'
        fundsBySector[sector] = (fundsBySector[sector] || 0) + fund.valueMarket
    })

    const fundsSectorChartData = Object.keys(fundsBySector).map((sector, index) => ({
        name: sector,
        value: fundsBySector[sector],
        color: ['#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f472b6', '#9ca3af'][index % 6]
    }))

    // 3. Stocks Data Parsing
    const parsedStocks = stocksData
        .filter((row: any) => row['Codice'] && row['Codice'] !== 'Codice' && row['Codice'] !== 'TOTALE')
        .map((row: any) => ({
            code: row['Codice'],
            sector: row['Settore'],
            country: row['Paese'], // Added Country parsing
            quantity: parseItNum(row['Quantità']),
            priceMarket: parseItNum(row['P mercato']),
            valueMarket: parseItNum(row['Valore Mercato']),
            plEuro: parseItNum(row['Profit Loss']),
            plPercent: parseItNum(row['PL'])
        }))
        .filter(stock => stock.valueMarket > 0)

    // Stocks Sector Allocation
    const stocksBySector: Record<string, number> = {}
    parsedStocks.forEach(stock => {
        const sector = stock.sector || 'Altro'
        stocksBySector[sector] = (stocksBySector[sector] || 0) + stock.valueMarket
    })

    const stocksSectorChartData = Object.keys(stocksBySector).map((sector, index) => ({
        name: sector,
        value: stocksBySector[sector],
        color: ['#f87171', '#fb923c', '#4ade80', '#2dd4bf', '#818cf8', '#a78bfa'][index % 6] || '#9ca3af'
    }))

    // Stocks Country Allocation
    const stocksByCountry: Record<string, number> = {}
    parsedStocks.forEach(stock => {
        const country = stock.country || 'Altro'
        stocksByCountry[country] = (stocksByCountry[country] || 0) + stock.valueMarket
    })

    const stocksCountryChartData = Object.keys(stocksByCountry).map((country, index) => ({
        name: country,
        value: stocksByCountry[country],
        color: ['#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f472b6', '#9ca3af'][index % 6] || '#9ca3af'
    }))

    // 4. Bonds Data Parsing
    const parsedBonds = bondsData
        .filter((row: any) => row['ISIN'] && row['ISIN'] !== 'ISIN' && row['ISin'] !== 'TOTALE') // Check ISIN
        .map((row: any) => {
            const quantity = parseItNum(row['Valore'])
            const price = parseItNum(row['Prezzo'])
            // Bonds are typically quoted as percentage of par, so Value = Nominal * Price / 100
            const valueMarket = (quantity * price) / 100

            return {
                code: row['ISIN'],
                country: row['Titolo'], // Column C
                rating: row['Rating'], // Column D
                quantity: quantity,
                priceMarket: price,
                valueMarket: valueMarket,
                plEuro: parseItNum(row['Totale']), // Assuming Totale is P/L €
                plPercent: parseItNum(row['%'])
            }
        })
        .filter(bond => bond.valueMarket > 0)

    // Bonds Country Allocation
    const bondsByCountry: Record<string, number> = {}
    parsedBonds.forEach(bond => {
        const country = bond.country || 'Altro'
        bondsByCountry[country] = (bondsByCountry[country] || 0) + bond.valueMarket
    })

    const bondsCountryChartData = Object.keys(bondsByCountry).map((country, index) => ({
        name: country,
        value: bondsByCountry[country],
        color: ['#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f472b6', '#9ca3af'][index % 6] || '#9ca3af'
    }))

    // Bonds Rating Allocation
    const bondsByRating: Record<string, number> = {}
    parsedBonds.forEach(bond => {
        const rating = bond.rating || 'N/A'
        bondsByRating[rating] = (bondsByRating[rating] || 0) + bond.valueMarket
    })

    const bondsRatingChartData = Object.keys(bondsByRating).map((rating, index) => ({
        name: rating,
        value: bondsByRating[rating],
        color: ['#f87171', '#fb923c', '#4ade80', '#2dd4bf', '#818cf8', '#a78bfa'][index % 6] || '#9ca3af'
    }))

    // 5. Current Year Data Parsing
    const parsedCurrentYear = currentYearData
        .filter((row: any) => row['Data'] && row['TOTALE EURO'])
        .map((row: any) => ({
            date: row['Data'],
            value: parseItNum(row['TOTALE EURO'])
        }))
    // Sort by date assuming date format is DD/MM/YYYY. If simple sort fails, need manual parse.
    // Usually, the sheet is ordered, but let's be safe later if needed. For now assuming sheet order is chronological.

    return (
        <div className="w-full px-6 space-y-12 pb-12">

            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">
                            Portafoglio Moderato
                        </h1>
                        <p className="text-gray-400">
                            Asset Allocation e Performance
                        </p>
                    </div>
                </div>
            </div>

            {/* --- SECTION 0: CURRENT YEAR TREND & STRATEGY --- */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* CHART */}
                <Card className="bg-gray-900 border-gray-800 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium text-white">Andamento Anno in Corso</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {parsedCurrentYear.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={parsedCurrentYear}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#9ca3af"
                                        tick={{ fill: '#9ca3af' }}
                                        tickLine={{ stroke: '#9ca3af' }}
                                        tickFormatter={(value) => {
                                            if (typeof value === 'string') {
                                                const parts = value.split(/[/-]/)
                                                if (parts.length >= 2) {
                                                    return `${parts[0]}/${parts[1]}`
                                                }
                                            }
                                            return value
                                        }}
                                    />
                                    <YAxis
                                        stroke="#9ca3af"
                                        tick={{ fill: '#9ca3af' }}
                                        tickLine={{ stroke: '#9ca3af' }}
                                        tickFormatter={(value) => `€ ${(value / 1000).toFixed(0)}k`}
                                        domain={['auto', 'auto']}
                                    />
                                    <RechartsTooltip
                                        formatter={(value: any) => `€ ${value.toLocaleString('it-IT')}`}
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#818cf8"
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                Nessun dato storico disponibile
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* STRATEGY DESCRIPTION */}
                <Card className="bg-gray-900 border-gray-800 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium text-white">Strategia Portafoglio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-gray-300 text-sm">
                        <p>
                            Portafoglio focalizzato su investimenti a medio rischio, con una componente equilibrata di Azioni e Obbligazioni e strumenti a reddito fisso.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-start justify-between border-b border-gray-800 pb-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                                    <span className="font-medium text-white">Fondi</span>
                                </div>
                                <span className="text-right text-gray-400">ETF azionario mondiale (Target 10%)</span>
                            </li>
                            <li className="flex items-start justify-between border-b border-gray-800 pb-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                                    <span className="font-medium text-white">Azioni</span>
                                </div>
                                <span className="text-right text-gray-400">Area Euro e USA (Target 40%)</span>
                            </li>
                            <li className="flex items-start justify-between border-b border-gray-800 pb-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                                    <span className="font-medium text-white">Obbligazioni</span>
                                </div>
                                <span className="text-right text-gray-400">Titoli di Stato e Corporate (Target 40%)</span>
                            </li>
                            <li className="flex items-start justify-between border-b border-gray-800 pb-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                                    <span className="font-medium text-white">Cash</span>
                                </div>
                                <span className="text-right text-gray-400">Conto Deposito o Risparmio (Target 10%)</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                {/* LATEST MOVEMENTS */}
                <Card className="bg-gray-900 border-gray-800 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium text-white">Ultimi Movimenti</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {movementsData.length > 0 ? (
                            <ul className="space-y-2">
                                {movementsData.map((movement, idx) => (
                                    <li key={idx} className="text-sm text-gray-300 border-b border-gray-800 pb-1 last:border-0">
                                        {movement}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500 italic">Nessun movimento recente</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* --- SECTION 1: ASSET ALLOCATION --- */}
            <div className="space-y-6">

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400">Valore Attuale</CardTitle>
                            <DollarSign className="text-green-500" size={20} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">
                                € {totalValue.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Investito: € {totalInvested.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400">Profitto / Perdita</CardTitle>
                            <ArrowUpRight className={totalGain >= 0 ? "text-green-500" : "text-red-500"} size={20} />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-3xl font-bold ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'} `}>
                                {totalGain >= 0 ? '+' : ''}€ {totalGain.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                            </div>
                            <p className={`text-sm mt-1 ${totalGainPercent >= 0 ? 'text-green-500/80' : 'text-red-500/80'} `}>
                                {totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400">Asset Classes</CardTitle>
                            <PieChartIcon className="text-blue-500" size={20} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">
                                {parsedAssets.length}
                            </div>
                            <p className="text-sm text-gray-400 mt-1">Macro Categorie</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts & Table */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Chart */}
                    <Card className="bg-gray-900 border-gray-800 lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium text-white">Allocazione Asset</CardTitle>
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
                                            <Cell key={`cell-${index} `} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={(value: any) => `€ ${value.toLocaleString('it-IT')} `}
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Table */}
                    <Card className="bg-gray-900 border-gray-800 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium text-white">Dettaglio Asset</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-400 uppercase bg-gray-950/50">
                                        <tr>
                                            <th className="px-4 py-3 rounded-l-lg">Asset</th>
                                            <th className="px-4 py-3 text-right">Iniziale</th>
                                            <th className="px-4 py-3 text-right">Attuale</th>
                                            <th className="px-4 py-3 text-right">Target</th>
                                            <th className="px-4 py-3 text-right">P/L €</th>
                                            <th className="px-4 py-3 rounded-r-lg text-right">P/L %</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {parsedAssets.map((asset) => (
                                            <tr key={asset.name} className="hover:bg-gray-800/50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-white">{asset.name}</td>
                                                <td className="px-4 py-3 text-right text-gray-400">€ {asset.initialValue.toLocaleString('it-IT')}</td>
                                                <td className="px-4 py-3 text-right text-white font-bold">€ {asset.finalValue.toLocaleString('it-IT')}</td>
                                                <td className="px-4 py-3 text-right text-gray-400">{asset.target}%</td>
                                                <td className={`px-4 py-3 text-right font-medium ${asset.plEuro >= 0 ? 'text-green-400' : 'text-red-400'} `}>
                                                    {asset.plEuro > 0 ? '+' : ''}€ {asset.plEuro.toLocaleString('it-IT')}
                                                </td>
                                                <td className={`px-4 py-3 text-right font-medium ${asset.plPercent >= 0 ? 'text-green-400' : 'text-red-400'} `}>
                                                    {asset.plPercent > 0 ? '+' : ''}{asset.plPercent.toFixed(2)}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* --- SECTION 2: FOCUS FONDI --- */}
            {parsedFunds.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        Focus Fondi <span className="text-sm font-normal text-gray-500 bg-gray-900 px-2 py-1 rounded-full">{parsedFunds.length} ETF</span>
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Chart: Sector Allocation */}
                        <Card className="bg-gray-900 border-gray-800 lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium text-white">Allocazione Settoriale</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={fundsSectorChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {fundsSectorChartData.map((entry, index) => (
                                                <Cell key={`cell-${index} `} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value: any) => `€ ${value.toLocaleString('it-IT')} `}
                                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Table: Details */}
                        <Card className="bg-gray-900 border-gray-800 lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium text-white">Dettaglio Fondi</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-400 uppercase bg-gray-950/50">
                                            <tr>
                                                <th className="px-4 py-3 rounded-l-lg">Codice</th>
                                                <th className="px-4 py-3">Settore</th>
                                                {/* Excluded columns C and D (Delta, P carico) */}
                                                <th className="px-4 py-3 text-right">Qta</th>
                                                <th className="px-4 py-3 text-right">Prezzo M.</th>
                                                <th className="px-4 py-3 text-right">Valore Tot</th>
                                                <th className="px-4 py-3 text-right">P/L €</th>
                                                <th className="px-4 py-3 rounded-r-lg text-right">P/L %</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {parsedFunds.map((fund: any) => (
                                                <tr key={fund.code} className="hover:bg-gray-800/50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-white">{fund.code}</td>
                                                    <td className="px-4 py-3 text-gray-400">{fund.sector}</td>
                                                    {/* Excluded columns C and D */}
                                                    <td className="px-4 py-3 text-right text-gray-300">{fund.quantity}</td>
                                                    <td className="px-4 py-3 text-right text-gray-400">€ {fund.priceMarket.toLocaleString('it-IT')}</td>
                                                    <td className="px-4 py-3 text-right text-white font-bold">€ {fund.valueMarket.toLocaleString('it-IT')}</td>
                                                    <td className={`px-4 py-3 text-right font-medium ${fund.plEuro >= 0 ? 'text-green-400' : 'text-red-400'} `}>
                                                        {fund.plEuro > 0 ? '+' : ''}€ {fund.plEuro.toLocaleString('it-IT')}
                                                    </td>
                                                    <td className={`px-4 py-3 text-right font-medium ${fund.plPercent >= 0 ? 'text-green-400' : 'text-red-400'} `}>
                                                        {fund.plPercent > 0 ? '+' : ''}{fund.plPercent.toFixed(2)}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* --- SECTION 3: FOCUS AZIONI --- */}
            {parsedStocks.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        Focus Azioni <span className="text-sm font-normal text-gray-500 bg-gray-900 px-2 py-1 rounded-full">{parsedStocks.length} Stock</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Chart 1: Sector Allocation */}
                        <Card className="bg-gray-900 border-gray-800">
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
                                                <Cell key={`cell-${index} `} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value: any) => `€ ${value.toLocaleString('it-IT')} `}
                                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Chart 2: Country Allocation */}
                        <Card className="bg-gray-900 border-gray-800">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium text-white">Allocazione Paese</CardTitle>
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
                                                <Cell key={`cell-${index} `} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value: any) => `€ ${value.toLocaleString('it-IT')} `}
                                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Table: Details */}
                        <Card className="bg-gray-900 border-gray-800 lg:col-span-3">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium text-white">Dettaglio Azioni</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-400 uppercase bg-gray-950/50">
                                            <tr>
                                                <th className="px-4 py-3 rounded-l-lg">Codice</th>
                                                <th className="px-4 py-3">Settore</th>
                                                <th className="px-4 py-3">Paese</th>
                                                <th className="px-4 py-3 text-right">Qta</th>
                                                <th className="px-4 py-3 text-right">Prezzo M.</th>
                                                <th className="px-4 py-3 text-right">Valore Tot</th>
                                                <th className="px-4 py-3 text-right">P/L €</th>
                                                <th className="px-4 py-3 rounded-r-lg text-right">P/L %</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {parsedStocks.map((stock: any) => (
                                                <tr key={stock.code} className="hover:bg-gray-800/50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-white">{stock.code}</td>
                                                    <td className="px-4 py-3 text-gray-400">{stock.sector}</td>
                                                    <td className="px-4 py-3 text-gray-400">{stock.country}</td>
                                                    <td className="px-4 py-3 text-right text-gray-300">{stock.quantity}</td>
                                                    <td className="px-4 py-3 text-right text-gray-400">€ {stock.priceMarket.toLocaleString('it-IT')}</td>
                                                    <td className="px-4 py-3 text-right text-white font-bold">€ {stock.valueMarket.toLocaleString('it-IT')}</td>
                                                    <td className={`px-4 py-3 text-right font-medium ${stock.plEuro >= 0 ? 'text-green-400' : 'text-red-400'} `}>
                                                        {stock.plEuro > 0 ? '+' : ''}€ {stock.plEuro.toLocaleString('it-IT')}
                                                    </td>
                                                    <td className={`px-4 py-3 text-right font-medium ${stock.plPercent >= 0 ? 'text-green-400' : 'text-red-400'} `}>
                                                        {stock.plPercent > 0 ? '+' : ''}{stock.plPercent.toFixed(2)}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* --- SECTION 4: FOCUS OBBLIGAZIONI --- */}
            {parsedBonds.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        Focus Obbligazioni <span className="text-sm font-normal text-gray-500 bg-gray-900 px-2 py-1 rounded-full">{parsedBonds.length} Bond</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Chart 1: Country Allocation */}
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
                                                <Cell key={`cell-${index} `} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value: any) => `€ ${value.toLocaleString('it-IT')} `}
                                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Chart 2: Rating Allocation */}
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
                                                <Cell key={`cell-${index} `} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value: any) => `€ ${value.toLocaleString('it-IT')} `}
                                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Table: Details */}
                        <Card className="bg-gray-900 border-gray-800 lg:col-span-3">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium text-white">Dettaglio Obbligazioni</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-400 uppercase bg-gray-950/50">
                                            <tr>
                                                <th className="px-4 py-3 rounded-l-lg">Codice</th>
                                                <th className="px-4 py-3">Paese</th>
                                                <th className="px-4 py-3">Rating</th>
                                                <th className="px-4 py-3 text-right">Qta</th>
                                                <th className="px-4 py-3 text-right">Prezzo M.</th>
                                                <th className="px-4 py-3 text-right">Valore Tot</th>
                                                <th className="px-4 py-3 text-right">P/L €</th>
                                                <th className="px-4 py-3 rounded-r-lg text-right">P/L %</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {parsedBonds.map((bond: any) => (
                                                <tr key={bond.code} className="hover:bg-gray-800/50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-white">{bond.code}</td>
                                                    <td className="px-4 py-3 text-gray-400">{bond.country}</td>
                                                    <td className="px-4 py-3 text-gray-400">{bond.rating}</td>
                                                    <td className="px-4 py-3 text-right text-gray-300">{bond.quantity}</td>
                                                    <td className="px-4 py-3 text-right text-gray-400">€ {bond.priceMarket.toLocaleString('it-IT')}</td>
                                                    <td className="px-4 py-3 text-right text-white font-bold">€ {bond.valueMarket.toLocaleString('it-IT')}</td>
                                                    <td className={`px-4 py-3 text-right font-medium ${bond.plEuro >= 0 ? 'text-green-400' : 'text-red-400'} `}>
                                                        {bond.plEuro > 0 ? '+' : ''}€ {bond.plEuro.toLocaleString('it-IT')}
                                                    </td>
                                                    <td className={`px-4 py-3 text-right font-medium ${bond.plPercent >= 0 ? 'text-green-400' : 'text-red-400'} `}>
                                                        {bond.plPercent > 0 ? '+' : ''}{bond.plPercent.toFixed(2)}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    )
}
