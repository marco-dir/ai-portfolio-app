"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts"
import { ArrowUpRight, DollarSign, PieChart as PieChartIcon, Loader2, AlertTriangle, ExternalLink, RefreshCw, TrendingUp, Briefcase, Landmark } from "lucide-react"

export default function DiramcoPortfolioPage() {
    const [assetsData, setAssetsData] = useState<any[]>([])
    const [fundsData, setFundsData] = useState<any[]>([])
    const [stocksData, setStocksData] = useState<any[]>([])
    const [bondsData, setBondsData] = useState<any[]>([])
    const [historyData, setHistoryData] = useState<any[]>([])
    const [movementsData, setMovementsData] = useState<any[]>([])
    const [cashFlowData, setCashFlowData] = useState<any[]>([])
    const [dividendsYearsData, setDividendsYearsData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isPrivate, setIsPrivate] = useState(false)

    const ASSETS_GID = '719610474'
    const FUNDS_GID = '612372293'
    const STOCKS_GID = '933823560'
    const BONDS_GID = '96512829'
    const HISTORY_GID = '437553469'
    const MOVEMENTS_GID = '1551404658'
    const CASH_FLOW_GID = '2105866920'
    const DIVIDENDI_YEARS_GID = '1507666277'

    // Helper to parse Italian number format (1.000,00)
    const parseItNum = (val: any) => {
        if (typeof val !== 'string') return 0
        const clean = val.replace(/[€%\s]/g, '').replace(/\./g, '').replace(',', '.')
        return parseFloat(clean) || 0
    }

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        setIsPrivate(false)
        try {
            // Fetch all sheets in parallel
            const [assetsRes, fundsRes, stocksRes, bondsRes, historyRes, movementsRes, cashFlowRes, dividendsYearsRes] = await Promise.all([
                fetch(`/api/diramco-portfolio/data?gid=${ASSETS_GID}`),
                fetch(`/api/diramco-portfolio/data?gid=${FUNDS_GID}`),
                fetch(`/api/diramco-portfolio/data?gid=${STOCKS_GID}`),
                fetch(`/api/diramco-portfolio/data?gid=${BONDS_GID}`),
                fetch(`/api/diramco-portfolio/data?gid=${HISTORY_GID}`),
                fetch(`/api/diramco-portfolio/data?gid=${MOVEMENTS_GID}`),
                fetch(`/api/diramco-portfolio/data?gid=${CASH_FLOW_GID}`),
                fetch(`/api/diramco-portfolio/data?gid=${DIVIDENDI_YEARS_GID}`)
            ])

            const assetsJson = await assetsRes.json()
            const fundsJson = await fundsRes.json()
            const stocksJson = await stocksRes.json()
            const bondsJson = await bondsRes.json()
            const historyJson = await historyRes.json()
            const movementsJson = await movementsRes.json()
            const cashFlowJson = await cashFlowRes.json()
            const dividendsYearsJson = await dividendsYearsRes.json()

            if (assetsJson.error === 'SHEET_PRIVATE' || fundsJson.error === 'SHEET_PRIVATE' || stocksJson.error === 'SHEET_PRIVATE' || bondsJson.error === 'SHEET_PRIVATE' || historyJson.error === 'SHEET_PRIVATE' || movementsJson.error === 'SHEET_PRIVATE') {
                setIsPrivate(true)
                setLoading(false)
                return
            }

            if (!assetsRes.ok || !fundsRes.ok || !stocksRes.ok || !bondsRes.ok || !historyRes.ok || !movementsRes.ok) {
                throw new Error('Failed to fetch data from one or more sheets')
            }

            setAssetsData(assetsJson.data)
            setFundsData(fundsJson.data)
            setStocksData(stocksJson.data)
            setBondsData(bondsJson.data)
            setHistoryData(historyJson.data)
            setMovementsData(movementsJson.data)
            setCashFlowData(cashFlowJson.data)

            // SPECIAL PARSING FOR DIVIDENDI YEARS (Col A & Col H) AND CAPITALE (Col A & Col B)
            // Col A has empty header -> COL_0, Col B is "Capitale", Col H is "Totale"
            let parsedDividendsYears: any[] = []
            if (dividendsYearsJson.data && dividendsYearsJson.data.length > 0) {
                parsedDividendsYears = dividendsYearsJson.data
                    .map((row: any) => ({
                        year: row['COL_0'], // Column A (empty header -> COL_0)
                        capitale: parseItNum(row['Capitale']), // Column B
                        dividendi: parseItNum(row['Totale']) // Column H
                    }))
                    .filter((d: any) => d.year && d.year.trim()) // Filter rows without a year
            }
            setDividendsYearsData(parsedDividendsYears)
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
                <p className="text-gray-400">Caricamento dati dal Foglio Google...</p>
            </div>
        )
    }

    if (isPrivate) {
        return (
            <div className="max-w-3xl mx-auto mt-12 p-8 bg-yellow-900/20 border border-yellow-900/50 rounded-xl text-center">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Accesso Negato al Foglio</h2>
                <p className="text-gray-300 mb-6">
                    Il foglio Google è privato. Per permettere alla dashboard di leggere i dati, devi renderlo accessibile a "Chiunque abbia il link".
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
                <p className="text-sm text-gray-500">{error}</p>
                <button onClick={fetchData} className="mt-4 text-blue-400 hover:underline">Riprova</button>
            </div>
        )
    }

    // --- Parsing Logic ---
    // Note: parseItNum is defined at the top of the component

    // 1. Assets Data parsing
    const parsedAssets = assetsData
        .filter((row: any) => row.ASSET && row.ASSET !== 'Unità' && row.ASSET !== 'TOTALE')
        .map((row: any) => ({
            name: row.ASSET,
            initialValue: parseItNum(row['Valore Iniziale']),
            finalValue: parseItNum(row['Valore Finale']),
            target: parseItNum(row['TARGET']),
            plEuro: parseItNum(row['PL']),
            plPercent: parseItNum(row['Profit Loss'])
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
        .filter(row => row.Codice !== 'Codice' && row.Codice && row.Codice.toLowerCase() !== 'totale') // Filter header, empty, and Total rows
        .map((row) => {
            const quantita = parseItNum(row['Quantità'])
            const valCarico = parseItNum(row['Valore Carico'])
            let pCarico = parseItNum(row['P carico'])

            // Fallback: calculate P.Carico if missing but we have Value and Quantity
            if ((!pCarico || pCarico === 0) && quantita > 0) {
                pCarico = valCarico / quantita
            }

            return {
                codice: row.Codice,
                settore: row.Settore,
                quantita: quantita,
                pCarico: pCarico,
                valCarico: valCarico,
                pMercato: parseItNum(row['P mercato']),
                valMercato: parseItNum(row['Valore Mercato']),
                vmPercent: parseItNum(row['VM']),
                plEuro: parseItNum(row['Profit Loss']),
                plPercent: parseItNum(row['PL'])
            }
        })
        .filter(fund => fund.valMercato > 0)

    // Chart Data Funds
    const fundsChartData = parsedFunds.map((fund, index) => ({
        name: fund.codice,
        value: fund.valMercato,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f97316'][index % 8] || '#9ca3af'
    }))

    // 3. Stocks Data Parsing
    const parsedStocks = stocksData
        .filter(row => row.Codice !== 'Codice' && row.Codice && row.Codice.toLowerCase() !== 'totale')
        .map(row => {
            const quantita = parseItNum(row['Quantità'])
            const valCarico = parseItNum(row['Valore Carico'])
            let pCarico = parseItNum(row['P carico'])

            if ((!pCarico || pCarico === 0) && quantita > 0) {
                pCarico = valCarico / quantita
            }

            return {
                codice: row.Codice,
                nome: row.Nome,
                paese: row.Paese,
                settore: row.Settore,
                quantita: quantita,
                pCarico: pCarico,
                valCarico: valCarico,
                pMercato: parseItNum(row['P mercato']),
                valMercato: parseItNum(row['Valore Mercato']),
                vmPercent: parseItNum(row['VM']),
                plEuro: parseItNum(row['Profit Loss']),
                plPercent: parseItNum(row['PL'])
            }
        })
        .filter(stock => stock.valMercato > 0)


    // Chart Data Stocks
    const stocksChartData = parsedStocks.map((stock, index) => ({
        name: stock.codice,
        value: stock.valMercato,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f97316'][index % 8] || '#9ca3af'
    }))

    // Calculate Stocks by Country
    const stocksByCountry = parsedStocks.reduce((acc, stock) => {
        const country = stock.paese || 'N/A'
        acc[country] = (acc[country] || 0) + stock.valMercato
        return acc
    }, {} as Record<string, number>)

    const stocksByCountryData = Object.entries(stocksByCountry).map(([name, value], index) => ({
        name,
        value,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][index % 5] || '#9ca3af'
    }))

    // Calculate Stocks by Sector
    const stocksBySector = parsedStocks.reduce((acc, stock) => {
        const sector = stock.settore || 'N/A'
        acc[sector] = (acc[sector] || 0) + stock.valMercato
        return acc
    }, {} as Record<string, number>)

    const stocksBySectorData = Object.entries(stocksBySector).map(([name, value], index) => ({
        name,
        value,
        color: ['#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#3b82f6'][index % 5] || '#9ca3af'
    }))

    // 4. Bonds Data Parsing
    const parsedBonds = bondsData
        .filter(row => row.ISIN && row.ISIN !== 'ISIN' && row.Strumento && row.Strumento.toLowerCase() !== 'totale')
        .map(row => ({
            strumento: row.Strumento,
            isin: row.ISIN,
            titolo: row.Titolo,
            rating: row.Rating,
            scadenza: row['Scadenza'], // Keys are now trimmed by the API parser
            cedola: row['cedola netta'], // Keys are now trimmed by the API parser
            rendimento: row['Rendimento Netto'],
            prezzo: parseItNum(row.Prezzo),
            valore: parseItNum(row.Valore),
            percent: parseItNum(row['%'])
        }))
        .filter(bond => bond.valore > 0)

    // Chart Data Bonds
    const bondsChartData = parsedBonds.map((bond, index) => ({
        name: bond.strumento,
        value: bond.valore,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f97316'][index % 8] || '#9ca3af'
    }))

    // Calculate Bonds by Country (Titolo)
    const bondsByCountry = parsedBonds.reduce((acc, bond) => {
        const country = bond.titolo || 'N/A'
        acc[country] = (acc[country] || 0) + bond.valore
        return acc
    }, {} as Record<string, number>)

    const bondsByCountryData = Object.entries(bondsByCountry).map(([name, value], index) => ({
        name,
        value,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][index % 5] || '#9ca3af'
    }))

    // Calculate Bonds by Rating
    const bondsByRating = parsedBonds.reduce((acc, bond) => {
        const rating = bond.rating || 'N/A'
        acc[rating] = (acc[rating] || 0) + bond.valore
        return acc
    }, {} as Record<string, number>)

    const bondsByRatingData = Object.entries(bondsByRating).map(([name, value], index) => ({
        name,
        value,
        color: ['#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#3b82f6'][index % 5] || '#9ca3af'
    }))

    // 5. History Data Parsing
    const parsedHistory = historyData
        .filter(row => row.Data && row['TOTALE EURO'])
        .map(row => {
            // Attempt to parse date in dd/mm/yyyy format just for sorting/validity if needed, 
            // but keeping string for XAxis is usually fine if format is consistent "dd/mm/yyyy".
            // However, sorting might be needed.
            // Let's assume input is dd/mm/yyyy
            const dateParts = row.Data.split('/')
            let dateObj = new Date()
            if (dateParts.length === 3) {
                dateObj = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`) // yyyy-mm-dd
            }

            return {
                dateStr: row.Data,
                dateObj: dateObj,
                value: parseItNum(row['TOTALE EURO'])
            }
        })
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())

    // 6. Movements Data Parsing
    const parsedMovements = movementsData
        .filter((row: any) => row.MOVIMENTI)
        .map((row: any) => row.MOVIMENTI)
        .slice(0, 10)

    return (
        <div className="w-full px-6 space-y-12 pb-12">

            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                            Portafoglio DIRAMCO
                        </h1>
                        <p className="text-gray-400">
                            Asset Allocation e Performance
                        </p>
                    </div>

                </div>
            </div>

            {/* --- SECTION 0: HISTORICAL CHART & STRATEGY & MOVEMENTS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Chart - Takes up 2 columns */}
                <Card className="bg-gray-900 border-gray-800 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium text-white">Andamento Storico (Anno Corrente)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        {parsedHistory.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={parsedHistory}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis
                                        dataKey="dateStr"
                                        stroke="#9ca3af"
                                        tick={{ fontSize: 12 }}
                                        tickMargin={10}
                                        minTickGap={30}
                                    />
                                    <YAxis
                                        stroke="#9ca3af"
                                        tickFormatter={(val) => `€ ${(val / 1000).toFixed(0)}k`}
                                        domain={['auto', 'auto']}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                        formatter={(value: any) => [`€ ${value.toLocaleString('it-IT', { maximumFractionDigits: 0 })}`, 'Valore Totale']}
                                        labelStyle={{ color: '#9ca3af' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#3b82f6"
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                        strokeWidth={2}
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

                {/* Strategy Description - Takes up 1 column */}
                <Card className="bg-gray-900 border-gray-800 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium text-white">Strategia Portafoglio</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 text-sm text-gray-400">
                            <p>
                                Portafoglio focalizzato su investimenti ad alto rischio, con una forte componente di Azioni,
                                una componente intermedia di Obbligazioni e una componente minima di Fondi e Liquidità.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex gap-2">
                                    <div className="min-w-[4px] bg-blue-500 rounded-full h-auto self-stretch"></div>
                                    <div>
                                        <strong className="text-white block">Fondi</strong>
                                        ETF azionari mondiali, materie prime e cryptovalute con Target inferiore al 5%.
                                    </div>
                                </li>
                                <li className="flex gap-2">
                                    <div className="min-w-[4px] bg-purple-500 rounded-full h-auto self-stretch"></div>
                                    <div>
                                        <strong className="text-white block">Azioni</strong>
                                        Azioni area Euro, Cina e USA con Target variabile tra 50% e 80%.
                                    </div>
                                </li>
                                <li className="flex gap-2">
                                    <div className="min-w-[4px] bg-orange-500 rounded-full h-auto self-stretch"></div>
                                    <div>
                                        <strong className="text-white block">Obbligazioni</strong>
                                        Titoli di Stato e Corporate area Euro con Target tra 20% e 40%.
                                    </div>
                                </li>
                                <li className="flex gap-2">
                                    <div className="min-w-[4px] bg-emerald-500 rounded-full h-auto self-stretch"></div>
                                    <div>
                                        <strong className="text-white block">Liquidità</strong>
                                        Variabile in base alle condizioni di mercato, dividendi e interessi maturati.
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Movements - Takes up 1 column */}
                <Card className="bg-gray-900 border-gray-800 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium text-white">Ultimi Movimenti</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {parsedMovements.length > 0 ? (
                                <ul className="space-y-3">
                                    {parsedMovements.map((movement: string, index: number) => (
                                        <li key={index} className="flex gap-3 text-sm border-b border-gray-800 pb-2 last:border-0 last:pb-0">
                                            <div className="min-w-[4px] bg-gray-600 rounded-full h-auto self-stretch"></div>
                                            <span className="text-gray-300">{movement}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">Nessun movimento recente.</p>
                            )}
                        </div>
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

            {/* --- CASH FLOW & HISTORICAL CHARTS --- */}
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Historical Capital Chart - FIRST */}
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium text-white">Capitale Storico (€)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            {(() => {
                                if (!dividendsYearsData || dividendsYearsData.length === 0) {
                                    return <div className="flex items-center justify-center h-full text-gray-500">Nessun dato Storico</div>
                                }

                                return (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={dividendsYearsData}>
                                            <defs>
                                                <linearGradient id="colorCapitale" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                            <XAxis dataKey="year" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                            <YAxis
                                                stroke="#9ca3af"
                                                tick={{ fontSize: 12 }}
                                                tickFormatter={(val) => `€${(val / 1000).toFixed(0)}k`}
                                            />
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                                formatter={(value: any) => [`€ ${value.toLocaleString('it-IT')}`, 'Capitale']}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="capitale"
                                                stroke="#8b5cf6"
                                                fillOpacity={1}
                                                fill="url(#colorCapitale)"
                                                strokeWidth={2}
                                                name="Capitale (€)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )
                            })()}
                        </CardContent>
                    </Card>

                    {/* Monthly Cash Flow Chart - SECOND */}
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium text-white">Cash Flow Mensile (Dividendi & Interessi)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            {(() => {
                                const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

                                const dividendsRow = cashFlowData.find((r: any) => r['Cash Flow'] && r['Cash Flow'].trim() === 'Dividendi')
                                const interestsRow = cashFlowData.find((r: any) => r['Cash Flow'] && r['Cash Flow'].trim() === 'Interessi')

                                if (!dividendsRow || !interestsRow) return <div className="flex items-center justify-center h-full text-gray-500">Nessun dato Cash Flow</div>

                                const chartData = months.map((month, index) => {
                                    const colIndex = (index + 1).toString()
                                    const divVal = parseItNum(dividendsRow[colIndex])
                                    const intVal = parseItNum(interestsRow[colIndex])
                                    return {
                                        month,
                                        Dividendi: divVal,
                                        Interessi: intVal,
                                    }
                                })

                                return (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                            <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                            <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} tickFormatter={(val) => `€${val}`} />
                                            <RechartsTooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                                formatter={(value: any) => [`€ ${value.toLocaleString('it-IT')}`]}
                                            />
                                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                            <Bar dataKey="Dividendi" stackId="a" fill="#10b981" />
                                            <Bar dataKey="Interessi" stackId="a" fill="#3b82f6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )
                            })()}
                        </CardContent>
                    </Card>

                    {/* Yearly Dividends Chart - THIRD */}
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium text-white">Dividendi Annuali (Storico)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            {(() => {
                                if (!dividendsYearsData || dividendsYearsData.length === 0) {
                                    return <div className="flex items-center justify-center h-full text-gray-500">Nessun dato Storico</div>
                                }

                                return (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={dividendsYearsData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                            <XAxis dataKey="year" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                            <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} tickFormatter={(val) => `€${val}`} />
                                            <RechartsTooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                                formatter={(value: any) => [`€ ${value.toLocaleString('it-IT')}`]}
                                            />
                                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                            <Bar dataKey="dividendi" fill="#10b981" name="Dividendi (€)" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )
                            })()}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* --- SECTION 2: FUNDS --- */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="text-purple-400" size={24} />
                    <h2 className="text-2xl font-bold text-white">Focus Fondi</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Funds Chart */}
                    <Card className="bg-gray-900 border-gray-800 lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium text-white">Composizione Fondi</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            {parsedFunds.length > 0 ? (
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
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    Nessun dato
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Funds Table */}
                    <Card className="bg-gray-900 border-gray-800 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium text-white">Dettaglio Titoli</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-400 uppercase bg-gray-950/50 text-nowrap">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Codice</th>
                                            <th className="px-6 py-4 font-semibold">Settore</th>
                                            <th className="px-6 py-4 font-semibold text-right">Quantità</th>
                                            <th className="px-6 py-4 font-semibold text-right">P. Carico</th>
                                            <th className="px-6 py-4 font-semibold text-right">Val. Carico</th>
                                            <th className="px-6 py-4 font-semibold text-right">P. Mercato</th>
                                            <th className="px-6 py-4 font-semibold text-right">Val. Mercato</th>
                                            <th className="px-6 py-4 font-semibold text-right">% Port.</th>
                                            <th className="px-6 py-4 font-semibold text-right">P/L €</th>
                                            <th className="px-6 py-4 font-semibold text-right">P/L %</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {parsedFunds.map((row, i) => (
                                            <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-white">{row.codice}</td>
                                                <td className="px-6 py-4 text-gray-400">{row.settore}</td>
                                                <td className="px-6 py-4 text-right text-gray-300">{row.quantita}</td>
                                                <td className="px-6 py-4 text-right text-gray-400">€ {row.pCarico.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td className="px-6 py-4 text-right text-gray-400">€ {row.valCarico.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</td>
                                                <td className="px-6 py-4 text-right text-white font-medium">€ {row.pMercato.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td className="px-6 py-4 text-right text-white font-bold">€ {row.valMercato.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</td>
                                                <td className="px-6 py-4 text-right text-gray-400">{row.vmPercent.toFixed(2)}%</td>
                                                <td className={`px-6 py-4 text-right font-medium ${row.plEuro >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {row.plEuro > 0 ? '+' : ''}€ {row.plEuro.toLocaleString('it-IT')}
                                                </td>
                                                <td className={`px-6 py-4 text-right font-medium ${row.plPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {row.plPercent > 0 ? '+' : ''}{row.plPercent.toFixed(2)}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {parsedFunds.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    Nessun dato trovato per i Fondi.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* --- SECTION 3: STOCKS (AZIONI) --- */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <Briefcase className="text-blue-400" size={24} />
                    <h2 className="text-2xl font-bold text-white">Focus Azioni</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Stocks Charts Column */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* 1. Main Composition */}
                        <Card className="bg-gray-900 border-gray-800">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium text-white">Composizione Azioni</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                {parsedStocks.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stocksChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={70}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {stocksChartData.map((entry, index) => (
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
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        Nessun dato
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 2. Country Allocation */}
                        <Card className="bg-gray-900 border-gray-800">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium text-white">Allocazione per Paese</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                {stocksByCountryData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stocksByCountryData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={70}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {stocksByCountryData.map((entry, index) => (
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
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        Nessun dato Paese
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 3. Sector Allocation */}
                        <Card className="bg-gray-900 border-gray-800">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium text-white">Allocazione per Settore</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                {stocksBySectorData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stocksBySectorData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={70}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {stocksBySectorData.map((entry, index) => (
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
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        Nessun dato Settore
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Stocks Table */}
                    <Card className="bg-gray-900 border-gray-800 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium text-white">Dettaglio Azioni</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-400 uppercase bg-gray-950/50 text-nowrap">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Codice</th>
                                            <th className="px-6 py-4 font-semibold">Nome</th>
                                            <th className="px-6 py-4 font-semibold">Paese</th>
                                            <th className="px-6 py-4 font-semibold">Settore</th>
                                            <th className="px-6 py-4 font-semibold text-right">Quantità</th>
                                            <th className="px-6 py-4 font-semibold text-right">P. Carico</th>
                                            <th className="px-6 py-4 font-semibold text-right">Val. Carico</th>
                                            <th className="px-6 py-4 font-semibold text-right">P. Mercato</th>
                                            <th className="px-6 py-4 font-semibold text-right">Val. Mercato</th>
                                            <th className="px-6 py-4 font-semibold text-right">% Port.</th>
                                            <th className="px-6 py-4 font-semibold text-right">P/L €</th>
                                            <th className="px-6 py-4 font-semibold text-right">P/L %</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {parsedStocks.map((row, i) => (
                                            <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-white">{row.codice}</td>
                                                <td className="px-6 py-4 text-gray-400">{row.nome}</td>
                                                <td className="px-6 py-4 text-gray-400">{row.paese}</td>
                                                <td className="px-6 py-4 text-gray-400">{row.settore}</td>
                                                <td className="px-6 py-4 text-right text-gray-300">{row.quantita}</td>
                                                <td className="px-6 py-4 text-right text-gray-400">€ {row.pCarico.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td className="px-6 py-4 text-right text-gray-400">€ {row.valCarico.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</td>
                                                <td className="px-6 py-4 text-right text-white font-medium">€ {row.pMercato.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td className="px-6 py-4 text-right text-white font-bold">€ {row.valMercato.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</td>
                                                <td className="px-6 py-4 text-right text-gray-400">{row.vmPercent.toFixed(2)}%</td>
                                                <td className={`px-6 py-4 text-right font-medium ${row.plEuro >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {row.plEuro > 0 ? '+' : ''}€ {row.plEuro.toLocaleString('it-IT')}
                                                </td>
                                                <td className={`px-6 py-4 text-right font-medium ${row.plPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {row.plPercent > 0 ? '+' : ''}{row.plPercent.toFixed(2)}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {parsedStocks.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    Nessun dato trovato per i Fondi.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Profit/Loss Bar Chart */}
                <Card className="bg-gray-900 border-gray-800 mt-6">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium text-white">Profit / Loss per Azione</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        {parsedStocks.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={parsedStocks.map(s => ({
                                        name: s.codice,
                                        pl: s.plPercent,
                                        fill: s.plPercent >= 0 ? '#10b981' : '#ef4444'
                                    }))}
                                    margin={{ top: 10, right: 30, left: 10, bottom: 60 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={true} vertical={false} />
                                    <XAxis
                                        type="category"
                                        dataKey="name"
                                        stroke="#9ca3af"
                                        tick={{ fontSize: 10 }}
                                        interval={0}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis
                                        type="number"
                                        stroke="#9ca3af"
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(val) => `${val.toFixed(0)}%`}
                                    />
                                    <RechartsTooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                        formatter={(value: any) => [`${value.toFixed(2)}%`, 'Profit/Loss']}
                                    />
                                    <Bar
                                        dataKey="pl"
                                        name="Profit/Loss %"
                                    >
                                        {parsedStocks.map((stock, index) => (
                                            <Cell key={`cell-${index}`} fill={stock.plPercent >= 0 ? '#10b981' : '#ef4444'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                Nessun dato disponibile
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* --- SECTION 4: BONDS (OBBLIGAZIONI) --- */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <Landmark className="text-orange-400" size={24} />
                    <h2 className="text-2xl font-bold text-white">Focus Obbligazioni</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Bonds Chart Container */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* 1. Main Bond Composition */}
                        <Card className="bg-gray-900 border-gray-800">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium text-white">Composizione Obbligazioni</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                {parsedBonds.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={bondsChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {bondsChartData.map((entry, index) => (
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
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        Nessun dato
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 2. Country Allocation (Titolo) */}
                        <Card className="bg-gray-900 border-gray-800">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium text-white">Allocazione per Paese</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                {bondsByCountryData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={bondsByCountryData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {bondsByCountryData.map((entry, index) => (
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
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        Nessun dato Paese
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 3. Rating Allocation */}
                        <Card className="bg-gray-900 border-gray-800">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium text-white">Allocazione per Rating</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                {bondsByRatingData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={bondsByRatingData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {bondsByRatingData.map((entry, index) => (
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
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        Nessun dato Rating
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Bonds Table */}
                    <Card className="bg-gray-900 border-gray-800 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium text-white">Dettaglio Obbligazioni</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-400 uppercase bg-gray-950/50 text-nowrap">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Strumento</th>
                                            <th className="px-6 py-4 font-semibold">ISIN</th>
                                            <th className="px-6 py-4 font-semibold">Titolo</th>
                                            <th className="px-6 py-4 font-semibold">Rating</th>
                                            <th className="px-6 py-4 font-semibold text-right">Scadenza</th>
                                            <th className="px-6 py-4 font-semibold text-right">Cedola</th>
                                            <th className="px-6 py-4 font-semibold text-right">Rendimento</th>
                                            <th className="px-6 py-4 font-semibold text-right">Prezzo</th>
                                            <th className="px-6 py-4 font-semibold text-right">Valore</th>
                                            <th className="px-6 py-4 font-semibold text-right">% Port.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {parsedBonds.map((row, i) => (
                                            <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-white">{row.strumento}</td>
                                                <td className="px-6 py-4 text-gray-400 text-xs">{row.isin}</td>
                                                <td className="px-6 py-4 text-gray-300">{row.titolo}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-xs text-gray-300">
                                                        {row.rating}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-gray-400">{row.scadenza}</td>
                                                <td className="px-6 py-4 text-right text-green-400">{row.cedola}</td>
                                                <td className="px-6 py-4 text-right text-green-400 font-bold">{row.rendimento}</td>
                                                <td className="px-6 py-4 text-right text-gray-300">€ {row.prezzo.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</td>
                                                <td className="px-6 py-4 text-right text-white font-bold">€ {row.valore.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</td>
                                                <td className="px-6 py-4 text-right text-gray-400">{row.percent.toFixed(2)}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {parsedBonds.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    Nessun dato trovato per le Obbligazioni.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

        </div>
    )
}
