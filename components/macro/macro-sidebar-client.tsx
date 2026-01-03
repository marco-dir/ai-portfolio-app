"use client"

import { useState } from "react"
import { AlertTriangle, TrendingDown, TrendingUp, Activity, HelpCircle, CheckCircle, Globe, Flag } from "lucide-react"

interface MacroSidebarProps {
    usaData: {
        cpi: number | null
        sentiment: number | null
        unemployment: number | null
        treasury10Y: number | null
        treasury2Y: number | null
        vix: number | null
    }
    euData: {
        inflation: number | null
        unemployment: number | null
        sentiment: number | null
        bond10Y: number | null // German Bund equivalent
        stoxx50: number | null
        eurUsd: number | null
    }
}

export function MacroSidebar({ usaData, euData }: MacroSidebarProps) {
    const [activeTab, setActiveTab] = useState<'USA' | 'EU'>('USA')

    // --- USA Logic ---
    const usaInflationAlert = (usaData.cpi ?? 0) > 3 ? 'high' : ((usaData.cpi ?? 0) < 0 ? 'deflation' : 'normal')
    const startUsaRecessionSignal = (usaData.treasury10Y && usaData.treasury2Y && usaData.treasury10Y < usaData.treasury2Y) || (usaData.unemployment && usaData.unemployment > 4.5) // Simplified Rule

    // --- EU Logic ---
    // Using static thresholds or passed data
    const euInflationAlert = (euData.inflation ?? 0) > 2.5 ? 'high' : ((euData.inflation ?? 0) < 0 ? 'deflation' : 'normal')
    const euRecessionSignal = (euData.bond10Y && euData.bond10Y < 2.0) || (euData.unemployment && euData.unemployment > 7.0) // Hypothetical thresholds

    const currentAlert = activeTab === 'USA' ? usaInflationAlert : euInflationAlert
    const isRecessionRisk = activeTab === 'USA' ? startUsaRecessionSignal : euRecessionSignal

    // Determine displayed values based on tab
    const metrics = activeTab === 'USA' ? [
        { label: "CPI (Inflazione)", value: usaData.cpi ? `${usaData.cpi.toFixed(2)}%` : 'N/A' },
        { label: "Tasso Disoccupazione", value: usaData.unemployment ? `${usaData.unemployment}%` : 'N/A' },
        { label: "Sentiment (UMich)", value: usaData.sentiment ? usaData.sentiment.toFixed(1) : 'N/A' },
        { label: "VIX (Volatilità)", value: usaData.vix ? usaData.vix.toFixed(2) : 'N/A' },
        { label: "Treasury 10Y", value: usaData.treasury10Y ? `${usaData.treasury10Y.toFixed(2)}%` : 'N/A' },
        { label: "Treasury 2Y", value: usaData.treasury2Y ? `${usaData.treasury2Y.toFixed(2)}%` : 'N/A' },
    ] : [
        { label: "HICP (Inflazione EU)", value: euData.inflation ? `${euData.inflation.toFixed(1)}%` : '2.4% (Est.)' }, // Fallback to estimated if null
        { label: "Disoccupazione EU", value: euData.unemployment ? `${euData.unemployment}%` : '6.4% (Est.)' },
        { label: "Sentiment (ZEW)", value: euData.sentiment ? euData.sentiment.toFixed(1) : '-14.7 (Est.)' },
        { label: "Euro Stoxx 50", value: euData.stoxx50 ? euData.stoxx50.toFixed(0) : 'N/A' },
        { label: "Bund 10Y (Germania)", value: euData.bond10Y ? `${euData.bond10Y.toFixed(2)}%` : '2.35% (Est.)' },
        { label: "EUR/USD", value: euData.eurUsd ? euData.eurUsd.toFixed(4) : 'N/A' },
    ]

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex p-1 bg-gray-900 border border-gray-800 rounded-xl">
                <button
                    onClick={() => setActiveTab('USA')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'USA' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                >
                    <Flag size={16} /> USA
                </button>
                <button
                    onClick={() => setActiveTab('EU')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'EU' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                >
                    <Globe size={16} /> Europa
                </button>
            </div>

            {/* Legend / Info Box */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <HelpCircle size={18} className="text-blue-400" />
                    Legenda {activeTab}
                </h3>
                <div className="space-y-3 text-sm text-gray-400">
                    <p><strong className="text-white">Inflazione &gt; {activeTab === 'USA' ? '3%' : '2.5%'}:</strong> Alta</p>
                    <div className="pt-2 border-t border-gray-800">
                        <p className="font-semibold text-white mb-1">Rischio Recessione:</p>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div> Basso
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div> Alto ({activeTab === 'USA' ? 'Yield Invertito' : 'Bassa Crescita'})
                        </div>
                    </div>
                </div>
            </div>

            {/* Inflation Alert */}
            <div className={`border rounded-xl p-4 ${currentAlert === 'high' ? 'bg-red-500/10 border-red-500/50' : (currentAlert === 'deflation' ? 'bg-orange-500/10 border-orange-500/50' : 'bg-green-500/10 border-green-500/50')}`}>
                <h4 className={`font-bold mb-2 flex items-center gap-2 ${currentAlert === 'normal' ? 'text-green-400' : 'text-red-400'}`}>
                    {currentAlert === 'normal' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    Alert Inflazione
                </h4>
                <p className="text-sm text-gray-300">
                    {currentAlert === 'high' ? 'Inflazione elevata. Possibili rialzi tassi.' :
                        currentAlert === 'deflation' ? 'Rischio deflazione. Economia debole.' :
                            'Inflazione sotto controllo.'}
                </p>
            </div>

            {/* Recession Alert */}
            <div className={`border rounded-xl p-4 ${isRecessionRisk ? 'bg-red-500/10 border-red-500/50' : 'bg-green-500/10 border-green-500/50'}`}>
                <h4 className={`font-bold mb-2 flex items-center gap-2 ${!isRecessionRisk ? 'text-green-400' : 'text-red-400'}`}>
                    {!isRecessionRisk ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    Rischio Recessione
                </h4>
                <p className="text-sm text-gray-300">
                    {isRecessionRisk ? 'Segnali di contrazione economica rilevati.' : 'Nessun segnale imminente di recessione.'}
                </p>
            </div>

            {/* Key Metrics Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Activity size={18} className="text-purple-400" />
                        Metriche {activeTab}
                    </h3>
                </div>
                <div className="divide-y divide-gray-800">
                    {metrics.map((m, i) => (
                        <MetricRow key={i} label={m.label} value={m.value} />
                    ))}
                </div>
            </div>
        </div>
    )
}

function MetricRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="px-6 py-3 flex justify-between items-center hover:bg-gray-800/30 transition-colors">
            <span className="text-sm text-gray-400">{label}</span>
            <span className="text-sm font-medium text-white">{value}</span>
        </div>
    )
}
