"use client"

import { PortfolioMetrics, Recommendation } from "@/lib/portfolio-analytics"
import { AlertTriangle, TrendingUp, Shield, Activity, Info, Zap } from "lucide-react"

interface PortfolioAnalyticsProps {
    metrics: PortfolioMetrics
    recommendations: Recommendation[]
}

export function PortfolioAnalytics({ metrics, recommendations }: PortfolioAnalyticsProps) {
    if (!metrics) return null

    const getRiskColor = (level: string) => {
        switch (level) {
            case "Basso": return "text-green-400"
            case "Medio": return "text-yellow-400"
            case "Alto": return "text-red-400"
            default: return "text-gray-400"
        }
    }

    const getRecIcon = (type: string) => {
        switch (type) {
            case "warning": return <AlertTriangle className="text-yellow-500" size={20} />
            case "risk": return <Zap className="text-red-500" size={20} />
            case "alert": return <TrendingUp className="text-red-400" size={20} /> // Down trend implication
            case "info": return <Info className="text-blue-400" size={20} />
            default: return <Info size={20} />
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Shield className="text-blue-500" size={24} />
                <h2 className="text-2xl font-bold text-white">Analisi Avanzata (Algoritmo IA)</h2>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Risk Score */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <div className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                        <Activity size={16} /> Punteggio di Rischio
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-white">{metrics.riskScore.toFixed(0)}</span>
                        <span className="text-gray-500 text-sm mb-1">/ 100</span>
                    </div>
                    <div className={`text-sm mt-2 font-medium ${getRiskColor(metrics.riskLevel)}`}>
                        Livello: {metrics.riskLevel}
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-gray-800 rounded-full mt-3 overflow-hidden">
                        <div
                            className={`h-full rounded-full ${metrics.riskLevel === 'Alto' ? 'bg-red-500' : metrics.riskLevel === 'Medio' ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${metrics.riskScore}%` }}
                        ></div>
                    </div>
                </div>

                {/* Diversification */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <div className="text-gray-400 text-sm mb-2">Diversificazione</div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-white">{metrics.diversificationScore.toFixed(0)}</span>
                        <span className="text-gray-500 text-sm mb-1">%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Basato su indice Herfindahl
                    </p>
                </div>

                {/* Weighted Beta */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <div className="text-gray-400 text-sm mb-2">Beta Ponderato</div>
                    <div className="text-3xl font-bold text-white">{metrics.weightedBeta.toFixed(2)}</div>
                    <p className="text-xs text-gray-500 mt-2">
                        Volatilità rispetto al mercato
                    </p>
                </div>

                {/* Volatility */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <div className="text-gray-400 text-sm mb-2">Volatilità Attesa</div>
                    <div className="text-3xl font-bold text-white">{metrics.weightedVolatility.toFixed(1)}%</div>
                    <p className="text-xs text-gray-500 mt-2">
                        Annualizzata (1Y storico)
                    </p>
                </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Suggerimenti & Avvisi</h3>
                    <div className="space-y-4">
                        {recommendations.map((rec, i) => (
                            <div key={i} className="flex gap-4 items-start p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                                <div className="mt-1 flex-shrink-0">
                                    {getRecIcon(rec.type)}
                                </div>
                                <div>
                                    <p className="text-gray-300 text-sm">{rec.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
