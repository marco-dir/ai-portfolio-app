"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Loader2, RefreshCw, Search, Star } from "lucide-react"

export default function WatchlistDiramcoPage() {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isPrivate, setIsPrivate] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        setIsPrivate(false)
        try {
            const response = await fetch("/api/lista-titoli-diramco")

            if (response.status === 403) {
                setIsPrivate(true)
                setLoading(false)
                return
            }

            if (!response.ok) throw new Error('Failed to fetch data')

            const json = await response.json()

            if (json.error === 'SHEET_PRIVATE') {
                setIsPrivate(true)
                setLoading(false)
                return
            }

            setData(json.data || json)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const headers = data.length > 0 ? Object.keys(data[0]) : []
    // Columns B (index 1) to N (index 13) roughly, but depends on CSV parsing keys. 
    // We filter headers to include only B-N range based on request.
    // Assuming CSV headers are unique and ordered as in the sheet.
    // Let's filter by index if headers are consistent, or just show all non-empty headers.

    // Filtered data based on search term (Column D - typically 'Name' or similar)
    const filteredData = data.filter(row => {
        const values = Object.values(row)
        const name = values[3] as string // Column D (index 3)
        if (!name || typeof name !== 'string') return false
        return name.toLowerCase().includes(searchTerm.toLowerCase())
    })

    // Excluded columns: Q, Industry, 6 Mesi, Giudizio
    // We filter out columns whose names match these exclusions (case-insensitive check)
    const excludeColumns = ["q", "industry", "6 mesi", "giudizio"]

    const displayHeaders = headers.slice(1, 14).filter(h => !excludeColumns.includes(h.toLowerCase()))

    // Helper for conditional formatting
    const getCellColor = (header: string, val: any) => {
        const cleanVal = typeof val === 'string' ? parseFloat(val.replace(/[€%\s]/g, '').replace(',', '.')) : val
        const h = header.toLowerCase()

        // 1. ChangePct formatting
        if (h.includes('changepct') || h.includes('variazione')) {
            if (cleanVal > 0) return 'text-green-500'
            if (cleanVal < 0) return 'text-red-500'
        }

        if (h.includes('valutazione')) {
            if (cleanVal > 9) return 'text-green-400 font-bold' // Intense Green
            if (cleanVal > 8) return 'text-green-500' // Green
            if (cleanVal >= 6 && cleanVal <= 7) return 'text-yellow-500' // Yellow
            if (cleanVal < 6) return 'text-red-500'   // Red
        }

        // 3. -5% ALERT formatting
        if (h.includes('-5%') && typeof val === 'string' && val.includes('ALERT')) {
            return 'text-red-500 font-bold'
        }

        return 'text-gray-300'
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-400">Caricamento Watchlist DIRAMCO...</p>
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

    return (
        <div className="p-6 space-y-8 min-h-screen bg-[#0a0a0a] text-gray-100">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Star className="w-8 h-8 text-yellow-500" />
                        Watchlist DIRAMCO
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Elenco titoli sotto osservazione.
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" /> Aggiorna Dati
                </button>
            </div>

            {/* SEARCH AND TABLE */}
            <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <CardTitle className="text-lg font-medium text-white">Titoli</CardTitle>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cerca titolo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-950 border border-gray-800 text-gray-200 text-sm rounded-md pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-800/50">
                                <tr>
                                    {displayHeaders.map((header) => (
                                        <th key={header} className="px-6 py-3 whitespace-nowrap">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((row, index) => (
                                    <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/20">
                                        {displayHeaders.map((header, i) => {
                                            const value = row[header]
                                            const colorClass = getCellColor(header, value)
                                            return (
                                                <td key={i} className={`px-6 py-4 font-medium whitespace-nowrap ${colorClass}`}>
                                                    {value}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredData.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                Nessun titolo trovato.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
