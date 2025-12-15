"use client"

import { useState } from "react"
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react"

interface AIAnalysisProps {
    ticker: string
    companyName: string
}

export function AIAnalysis({ ticker, companyName }: AIAnalysisProps) {
    const [analysis, setAnalysis] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchAnalysis = async () => {
        if (analysis) {
            setIsExpanded(!isExpanded)
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/ai-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ symbol: ticker, companyName })
            })

            if (!response.ok) {
                throw new Error('Failed to fetch AI analysis')
            }

            const data = await response.json()
            setAnalysis(data.analysis)
            setIsExpanded(true)
        } catch (err) {
            setError('Impossibile recuperare l\'analisi AI. Verifica che la chiave API Perplexity sia configurata.')
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <button
                onClick={fetchAnalysis}
                disabled={isLoading}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    <div className="text-left">
                        <h3 className="text-xl font-bold text-white">
                            Analisi News AI
                        </h3>
                        <p className="text-sm text-gray-400">
                            Ultimi risultati finanziari e sentiment di mercato
                        </p>
                    </div>
                </div>
                {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
                ) : isExpanded ? (
                    <ChevronUp className="w-6 h-6 text-gray-400" />
                ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                )}
            </button>

            {isExpanded && (
                <div className="px-6 pb-6 border-t border-gray-800">
                    {error ? (
                        <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-lg">
                            <p className="text-red-400">{error}</p>
                        </div>
                    ) : analysis ? (
                        <div className="mt-4 prose prose-invert max-w-none">
                            <div className="text-gray-300 whitespace-pre-wrap">
                                {analysis}
                            </div>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    )
}
