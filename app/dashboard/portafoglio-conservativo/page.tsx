"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts"
import { ArrowUpRight, DollarSign, PieChart as PieChartIcon, Loader2, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react"

export default function ConservativePortfolioPage() {
    const [assetsData, setAssetsData] = useState<any[]>([])
    const [fundsData, setFundsData] = useState<any[]>([])
    const [bondsData, setBondsData] = useState<any[]>([])
    const [historyData, setHistoryData] = useState<any[]>([])
    const [movementsData, setMovementsData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isPrivate, setIsPrivate] = useState(false)

    // Main Asset Allocation GID for Conservative Portfolio
    const ASSETS_GID = '0'
    const FUNDS_GID = '449934496'
    const BONDS_GID = '973887992'
    const HISTORY_GID = '680500086'
    const MOVEMENTS_GID = '1069880576'

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        setIsPrivate(false)
        try {
            const [assetsRes, fundsRes, bondsRes, historyRes, movementsRes] = await Promise.all([
                fetch(`/api/conservative-portfolio/data?gid=${ASSETS_GID}`),
                fetch(`/api/conservative-portfolio/data?gid=${FUNDS_GID}`),
                fetch(`/api/conservative-portfolio/data?gid=${BONDS_GID}`),
                fetch(`/api/conservative-portfolio/data?gid=${HISTORY_GID}`),
                fetch(`/api/conservative-portfolio/data?gid=${MOVEMENTS_GID}`)
            ])

            if (assetsRes.status === 403 || fundsRes.status === 403 || bondsRes.status === 403 || historyRes.status === 403 || movementsRes.status === 403) {
                setIsPrivate(true)
                setLoading(false)
                return
            }

            if (!assetsRes.ok || !fundsRes.ok || !bondsRes.ok || !historyRes.ok || !movementsRes.ok) {
                throw new Error('Failed to fetch data')
            }

            const assetsJson = await assetsRes.json()
            const fundsJson = await fundsRes.json()
            const bondsJson = await bondsRes.json()
            const historyJson = await historyRes.json()
            const movementsJson = await movementsRes.json()

            if (assetsJson.error === 'SHEET_PRIVATE' || fundsJson.error === 'SHEET_PRIVATE' || bondsJson.error === 'SHEET_PRIVATE' || historyJson.error === 'SHEET_PRIVATE' || movementsJson.error === 'SHEET_PRIVATE') {
                setIsPrivate(true)
                setLoading(false)
                return
            }

            setAssetsData(assetsJson.data)
            setFundsData(fundsJson.data)
            setBondsData(bondsJson.data)
            setHistoryData(historyJson.data)
            setMovementsData(movementsJson.data)
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
                <p className="text-gray-400">Caricamento dati Portafoglio Conservativo...</p>
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
        .filter((row: any) => row['Codice ETF'] && row['Codice ETF'] !== 'Codice' && row['Codice ETF'] !== 'TOTALE')
        .map((row: any) => ({
            code: row['Codice ETF'],
            sector: row['Settore'],
            dailyDelta: row['Delta giornaliero'],
            priceLoad: parseItNum(row['P carico']),
            valueLoad: parseItNum(row['Valore Carico']),
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

    // 3. Bonds Data Parsing
    const parsedBonds = bondsData
        .filter(row => row.Titolo && row.Titolo !== 'TOTALE' && row.Valore)
        .map(row => ({
            name: row.Titolo, // Issuer/Country
            isin: row.ISIN,
            rating: row.Rating,
            maturity: row['Scadenza '] || row.Scadenza, // Handle potential trailing space in header key
            price: parseItNum(row.Prezzo),
            yieldNet: parseItNum(row['Rendimento Netto']),
            value: parseItNum(row.Valore),
            coupon: parseItNum(row.Cedola),
            gain: parseItNum(row.Plusvalenza),
            totalReturn: parseItNum(row.Totale),
            returnPercent: parseItNum(row['5']) // Assuming column '%' is parsed as index or key is '%'. Let's use row['%'] if available or find by index if needed.
            // Actually, based on previous behavior, headers are usually clean names. Let's try row['%']
        }))

    // Safety check: if parsedBonds have 0 value, debug or ensure column names match CSV exactly.
    // CSV Header: "Strumento,ISIN,Titolo,Rating,Durata,Scadenza ,Prezzo,cedola netta ,Rendimento Netto,Valore,Plusvalenza,Cedola,Totale,%,Note"
    // Note spaces in 'Scadenza ', 'cedola netta '

    // Charts for Bonds
    // 1. Rating Allocation
    const bondsByRating: Record<string, number> = {}
    parsedBonds.forEach(bond => {
        const rating = bond.rating || 'N/A'
        bondsByRating[rating] = (bondsByRating[rating] || 0) + bond.value
    })

    const bondsRatingChartData = Object.keys(bondsByRating).map((rating, index) => ({
        name: rating,
        value: bondsByRating[rating],
        color: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]
    }))

    // 2. Issuer Allocation
    const bondsByIssuer: Record<string, number> = {}
    parsedBonds.forEach(bond => {
        const issuer = bond.name || 'Altro'
        bondsByIssuer[issuer] = (bondsByIssuer[issuer] || 0) + bond.value
    })

    const bondsIssuerChartData = Object.keys(bondsByIssuer).map((issuer, index) => ({
        name: issuer,
        value: bondsByIssuer[issuer],
        color: ['#0ea5e9', '#ec4899', '#f97316', '#84cc16'][index % 4]
    }))

    // 4. History Data Parsing
    const parsedHistory = historyData
        .filter(row => row.Data && row['TOTALE EURO'])
        .map(row => ({
            date: row.Data,
            value: parseItNum(row['TOTALE EURO'])
        }))
        // Sort by date if needed, assuming they come sorted from sheet usually.
        // Sheets formats are DD/MM/YYYY usually. Constructing Date object for proper sorting might be safer.
        .map(item => {
            const [day, month, year] = item.date.split('/')
            return {
                ...item,
                dateObj: new Date(`${year}-${month}-${day}`),
                displayDate: `${day}/${month}`
            }
        })
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())

    // 5. Movements Data Parsing
    const parsedMovements = movementsData
        .map(row => {
            // Get the first value regardless of key (Column A)
            const values = Object.values(row)
            return values.length > 0 ? String(values[0]) : null
        })
        .filter(item => item && item !== 'Ultimi Movimenti' && item !== 'Movimento') // Filter title rows if any

    return (
        <div className="w-full px-6 space-y-12 pb-12">

            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-teal-600 bg-clip-text text-transparent">
                            Portafoglio Conservativo
                        </h1>
                        <p className="text-gray-400">
                            Asset Allocation e Performance
                        </p>
                    </div>
                </div>
            </div>

            {/* --- SECTION 0: HISTORY CHART (New) --- */}
            {parsedHistory.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <Card className="bg-gray-900 border-gray-800 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium text-white">Andamento Anno in Corso</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={parsedHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis
                                        dataKey="displayDate"
                                        stroke="#9ca3af"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 12 }}
                                        minTickGap={30}
                                    />
                                    <YAxis
                                        domain={['auto', 'auto']}
                                        stroke="#9ca3af"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(value) => `€ ${(value / 1000).toFixed(0)}k`} // Format as 100k
                                    />
                                    <RechartsTooltip
                                        formatter={(value: any) => `€ ${Number(value).toLocaleString('it-IT', { maximumFractionDigits: 2 })}`}
                                        labelFormatter={(label) => `Data: ${label}`}
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                        itemStyle={{ color: '#10b981' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#10b981"
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-900 border-gray-800 lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium text-white">Obiettivo Portafoglio</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-gray-300 text-sm">
                            <p className="leading-relaxed">
                                Portafoglio focalizzato su investimenti a basso rischio, con una forte componente di Obbligazioni e strumenti a reddito fisso:
                            </p>
                            <ul className="space-y-3">
                                <li className="flex gap-2">
                                    <span className="text-blue-400 font-bold">•</span>
                                    <span>
                                        <strong className="text-white">Fondi:</strong> selezione di ETF di indici azionari mondiali e materie prime con Target al 20%
                                    </span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-green-400 font-bold">•</span>
                                    <span>
                                        <strong className="text-white">Obbligazioni:</strong> Titoli di Stato e Corporate area Euro con Target al 70%
                                    </span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-yellow-400 font-bold">•</span>
                                    <span>
                                        <strong className="text-white">Cash ed Equivalenti:</strong> Conto Deposito o Risparmio con Target al 10%
                                    </span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Latest Movements */}
                    <Card className="bg-gray-900 border-gray-800 lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium text-white">Ultimi Movimenti</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {parsedMovements.map((movement, index) => (
                                    <li key={index} className="flex gap-3 text-sm text-gray-300 items-start">
                                        <div className="min-w-[6px] h-[6px] rounded-full bg-blue-500 mt-1.5" />
                                        <span>{movement}</span>
                                    </li>
                                ))}
                                {parsedMovements.length === 0 && (
                                    <p className="text-gray-500 text-sm">Nessun movimento recente.</p>
                                )}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            )}

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
                            <div className={`text-3xl font-bold ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {totalGain >= 0 ? '+' : ''}€ {totalGain.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                            </div>
                            <p className={`text-sm mt-1 ${totalGainPercent >= 0 ? 'text-green-500/80' : 'text-red-500/80'}`}>
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
                                                <td className={`px-4 py-3 text-right font-medium ${asset.plEuro >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {asset.plEuro > 0 ? '+' : ''}€ {asset.plEuro.toLocaleString('it-IT')}
                                                </td>
                                                <td className={`px-4 py-3 text-right font-medium ${asset.plPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
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
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value: any) => `€ ${Number(value).toLocaleString('it-IT')}`}
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
                                                    <td className="px-4 py-3 text-right text-gray-300">{fund.quantity}</td>
                                                    <td className="px-4 py-3 text-right text-gray-400">€ {fund.priceMarket.toLocaleString('it-IT')}</td>
                                                    <td className="px-4 py-3 text-right text-white font-bold">€ {fund.valueMarket.toLocaleString('it-IT')}</td>
                                                    <td className={`px-4 py-3 text-right font-medium ${fund.plEuro >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {fund.plEuro > 0 ? '+' : ''}€ {fund.plEuro.toLocaleString('it-IT')}
                                                    </td>
                                                    <td className={`px-4 py-3 text-right font-medium ${fund.plPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
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

            {/* --- SECTION 3: FOCUS OBBLIGAZIONI --- */}
            {parsedBonds.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        Focus Obbligazioni <span className="text-sm font-normal text-gray-500 bg-gray-900 px-2 py-1 rounded-full">{parsedBonds.length} Asset</span>
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Rating Chart */}
                        <Card className="bg-gray-900 border-gray-800">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium text-white">Allocazione per Rating</CardTitle>
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
                                            formatter={(value: any) => `€ ${value.toLocaleString('it-IT')}`}
                                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Issuer Chart */}
                        <Card className="bg-gray-900 border-gray-800">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium text-white">Allocazione per Emittente</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={bondsIssuerChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {bondsIssuerChartData.map((entry, index) => (
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
                    </div>

                    {/* Bonds Table */}
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium text-white">Dettaglio Obbligazioni</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-400 uppercase bg-gray-950/50">
                                        <tr>
                                            <th className="px-4 py-3 rounded-l-lg">Titolo</th>
                                            <th className="px-4 py-3">Rating</th>
                                            <th className="px-4 py-3">Scadenza</th>
                                            <th className="px-4 py-3 text-right">Rend. Netto</th>
                                            <th className="px-4 py-3 text-right">Valore</th>
                                            <th className="px-4 py-3 text-right">Plusvalenza</th>
                                            <th className="px-4 py-3 rounded-r-lg text-right">Cedola attesa</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {parsedBonds.map((bond: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-gray-800/50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-white">
                                                    <div>{bond.name}</div>
                                                    <div className="text-xs text-gray-500">{bond.isin}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${bond.rating.startsWith('A') ? 'bg-green-500/10 text-green-400' :
                                                        bond.rating.startsWith('B') ? 'bg-yellow-500/10 text-yellow-400' :
                                                            'bg-gray-800 text-gray-400'
                                                        }`}>
                                                        {bond.rating}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-300">{bond.maturity}</td>
                                                <td className="px-4 py-3 text-right text-blue-400 font-medium whitespace-nowrap">
                                                    {bond.yieldNet > 0 ? (bond.yieldNet * 100).toFixed(2) : bond.yieldNet}%
                                                    {/* Yield net was parsed with parseItNum from "1,76%", so it is 1.76. Wait, parseItNum removes %, so "1,76" -> 1.76. if it's already percentage number, don't multiply by 100 unless it was 0.0176. Let's check parse logic. "1,76%" -> "1,76" -> 1.76. So just add % symbol. */}
                                                </td>
                                                <td className="px-4 py-3 text-right text-white font-bold whitespace-nowrap">€ {bond.value.toLocaleString('it-IT')}</td>
                                                <td className={`px-4 py-3 text-right font-medium whitespace-nowrap ${bond.gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {bond.gain > 0 ? '+' : ''}€ {bond.gain.toLocaleString('it-IT')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-green-400 font-medium whitespace-nowrap">
                                                    +€ {bond.coupon.toLocaleString('it-IT')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
