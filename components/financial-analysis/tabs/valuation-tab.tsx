"use client"

import { useState, useMemo } from "react"
import {
    calculateDCF,
    calculateDDM,
    calculateGrahamNumber,
    calculatePEMultipleValuation
} from "@/lib/valuation"
import { formatCurrency } from "@/lib/format-utils"
import { Info } from "lucide-react"

export function ValuationTab({
    quote,
    income,
    balance,
    cashflow,
    ratios,
    profile
}: any) {
    // State for interactive assumptions
    const [wacc, setWacc] = useState(10.0)
    const [growthRate, setGrowthRate] = useState(5.0) // FCF Growth
    const [terminalGrowth, setTerminalGrowth] = useState(2.5)

    // Extract required data
    const currentPrice = quote.price || 0
    const currency = profile.currency || "USD"

    const latestCashflow = cashflow[0] || {}
    const latestBalance = balance[0] || {}
    const latestIncome = income[0] || {}
    const latestRatios = ratios[0] || {}

    // Calculation Inputs
    const fcfCurrent = latestCashflow.freeCashFlow || 0
    const cash = latestBalance.cashAndCashEquivalents || 0
    const debt = latestBalance.totalDebt || 0
    const shares = latestIncome.weightedAverageShsOutDil || latestIncome.weightedAverageShsOut || 0
    const eps = latestIncome.eps || 0
    const bvps = (latestBalance.totalStockholdersEquity || 0) / shares
    const divPerShare = latestRatios.dividendYield ? (latestRatios.dividendYield * currentPrice) : 0
    const peRatio = latestRatios.priceEarningsRatio || 15 // simplified fallback

    // Perform Calculations
    const dcfValue = useMemo(() => {
        return calculateDCF(fcfCurrent, growthRate, wacc, terminalGrowth, 5, cash, debt, shares)
    }, [fcfCurrent, growthRate, wacc, terminalGrowth, cash, debt, shares])

    const grahamValue = useMemo(() => {
        return calculateGrahamNumber(eps, bvps)
    }, [eps, bvps])

    const ddmValue = useMemo(() => {
        // Assume dividend growth is somewhat related to terminal growth for simplicity here, or slightly higher
        // Since we don't have a separate input for div growth yet, let's reuse terminalGrowth or make it an input.
        // For now, let's use terminalGrowth as dividend growth (conservative)
        return calculateDDM(divPerShare, terminalGrowth, wacc)
    }, [divPerShare, terminalGrowth, wacc])

    const peValue = useMemo(() => {
        // Using current PE might just give back price. Usually we want historical avg PE. 
        // Let's assume 15 generic or avg if we had it.
        // For now let's use the actual PE from ratios if reasonable, else 20.
        // A better approach: EPS * Industry PE? 
        // Let's use a standard 20x or 15x multiplier as a "Fair PE" reference if user wants to check?
        // Or better: Let's skip PE Valuation if we don't have historical data here to avg.
        // Let's just do a simple "Earnings Power Value" -> EPS / (WACC - Growth)? No.
        // Let's stick to the lib function: calculatePEMultipleValuation(eps, historicalPE)
        // We only have current PE. Let's use 20 as "Market Average" for reference.
        return calculatePEMultipleValuation(eps, 20)
    }, [eps])

    const models = [
        { name: "DCF (Discounted Cash Flow)", value: dcfValue, color: "#3b82f6", desc: "Basato sui flussi di cassa futuri." },
        { name: "Graham Number", value: grahamValue, color: "#22c55e", desc: "Metrica di value investing conservativa." },
        { name: "Dividend Discount Model", value: ddmValue, color: "#eab308", desc: "Basato sui dividendi attesi." },
        { name: "Multiplo P/E (20x)", value: peValue, color: "#a855f7", desc: "Basato su 20x Utili." },
    ]

    // Calculate average valuation and assessment
    const validModels = models.filter(m => m.value && m.value > 0)
    const avgValuation = validModels.length > 0
        ? validModels.reduce((sum, m) => sum + m.value, 0) / validModels.length
        : null

    const getValuationAssessment = () => {
        if (!avgValuation || !currentPrice) return null

        const diff = ((currentPrice - avgValuation) / avgValuation) * 100

        if (diff > 20) {
            return { text: "Sopravvalutato", color: "text-red-400", bgColor: "bg-red-900/20", borderColor: "border-red-900" }
        } else if (diff > 5) {
            return { text: "Leggermente Sopravvalutato", color: "text-orange-400", bgColor: "bg-orange-900/20", borderColor: "border-orange-900" }
        } else if (diff < -20) {
            return { text: "Sottovalutato", color: "text-green-400", bgColor: "bg-green-900/20", borderColor: "border-green-900" }
        } else if (diff < -5) {
            return { text: "Leggermente Sottovalutato", color: "text-blue-400", bgColor: "bg-blue-900/20", borderColor: "border-blue-900" }
        } else {
            return { text: "Valutazione Equa", color: "text-gray-400", bgColor: "bg-gray-900/20", borderColor: "border-gray-800" }
        }
    }

    const assessment = getValuationAssessment()

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Inputs */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-fit">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Info size={16} /> Ipotesi (Assumptions)
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Tasso di Sconto (WACC) %</label>
                            <input
                                type="number"
                                value={wacc}
                                onChange={e => setWacc(parseFloat(e.target.value))}
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                                step="0.1"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Crescita FCF %</label>
                            <input
                                type="number"
                                value={growthRate}
                                onChange={e => setGrowthRate(parseFloat(e.target.value))}
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                                step="0.1"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Crescita Terminale %</label>
                            <input
                                type="number"
                                value={terminalGrowth}
                                onChange={e => setTerminalGrowth(parseFloat(e.target.value))}
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                                step="0.1"
                            />
                        </div>
                    </div>
                </div>

                {/* Results Main Card */}
                <div className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Stime Valore Intrinseco</h3>

                    <div className="space-y-6">
                        {/* Current Price Reference */}
                        <div className="relative pt-6 pb-2">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                                    <div className="text-sm text-gray-400 mb-1">Prezzo Attuale</div>
                                    <div className="text-2xl font-bold text-white">{formatCurrency(currentPrice, currency)}</div>
                                </div>

                                {avgValuation && (
                                    <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                                        <div className="text-sm text-gray-400 mb-1">Media Valutazioni</div>
                                        <div className="text-2xl font-bold text-white">{formatCurrency(avgValuation, currency)}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {validModels.length} modelli
                                        </div>
                                    </div>
                                )}

                                {assessment && (
                                    <div className={`text-center p-4 rounded-lg border ${assessment.bgColor} ${assessment.borderColor}`}>
                                        <div className="text-sm text-gray-400 mb-1">Giudizio</div>
                                        <div className={`text-xl font-bold ${assessment.color}`}>{assessment.text}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {((currentPrice - avgValuation!) / avgValuation! * 100).toFixed(1)}% vs media
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full w-full bg-gray-700"></div>
                            </div>
                        </div>

                        {models.map((model) => {
                            if (model.value <= 0) return null; // Skip invalid models

                            const upside = ((model.value - currentPrice) / currentPrice) * 100
                            const maxVal = Math.max(currentPrice, ...models.map(m => m.value)) * 1.2
                            const widthPercent = Math.min((model.value / maxVal) * 100, 100)

                            return (
                                <div key={model.name} className="relative">
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <span className="text-white font-medium block">{model.name}</span>
                                            <span className="text-xs text-gray-500">{model.desc}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-white font-bold text-lg">{formatCurrency(model.value, currency)}</div>
                                            <div className={`text-xs font-medium ${upside >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {upside >= 0 ? '+' : ''}{upside.toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mt-2">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${widthPercent}%`, backgroundColor: model.color }}
                                        ></div>
                                    </div>
                                </div>
                            )
                        })}

                        {models.every(m => m.value <= 0) && (
                            <div className="text-center text-gray-500 py-8">
                                Dati insufficienti per calcolare i modelli di valutazione.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="text-xs text-gray-500 italic mt-4">
                Disclaimer: Questi modelli di valutazione sono stime teoriche basate su dati storici e ipotesi dell'utente. Non costituiscono consulenza finanziaria.
            </div>
        </div>
    )
}
