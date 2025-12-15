"use client"

interface IndicatorRowProps {
    label: string
    value: string | number
    isGood: boolean
    tooltip: string
}

function IndicatorRow({ label, value, isGood, tooltip }: IndicatorRowProps) {
    const displayValue = typeof value === 'number' ? value.toFixed(2) : value

    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
            <div>
                <div className="text-white font-medium">{label}</div>
                <div className="text-gray-500 text-sm">{tooltip}</div>
            </div>
            <div className="text-right">
                {value === 'N/A' || value === 0 ? (
                    <span className="text-gray-500">N/A</span>
                ) : isGood ? (
                    <span className="text-green-400 font-semibold">✅ {displayValue}</span>
                ) : (
                    <span className="text-white font-semibold">{displayValue}</span>
                )}
            </div>
        </div>
    )
}

interface FinancialIndicatorsProps {
    pe: number | null
    pb: number | null
    ps: number | null
    peg: number | null
    roe: number | null
    roa: number | null
    roic: number | null
    debtEquity: number | null
    currentRatio: number | null
    quickRatio: number | null
    beta: number | null
    grossMargin: number | null
    operatingMargin: number | null
    profitMargin: number | null
}

export function FinancialIndicators({
    pe,
    pb,
    ps,
    peg,
    roe,
    roa,
    roic,
    debtEquity,
    currentRatio,
    quickRatio,
    beta,
    grossMargin,
    operatingMargin,
    profitMargin
}: FinancialIndicatorsProps) {

    // Helper functions for determining if values are good
    const isPEGood = (val: number | null) => val !== null && val > 0 && val <= 15
    const isPBGood = (val: number | null) => val !== null && val > 0 && val <= 1.5
    const isPSGood = (val: number | null) => val !== null && val > 0 && val <= 2
    const isPEGGood = (val: number | null) => val !== null && val >= 0 && val <= 2
    const isROEGood = (val: number | null) => val !== null && val > 0.15
    const isROAGood = (val: number | null) => val !== null && val > 0.10
    const isROICGood = (val: number | null) => val !== null && val > 0.10
    const isDebtEquityGood = (val: number | null) => val !== null && val < 1
    const isCurrentRatioGood = (val: number | null) => val !== null && val >= 1.5
    const isQuickRatioGood = (val: number | null) => val !== null && val >= 1.0
    const isBetaGood = (val: number | null) => val !== null && val >= 0.5 && val <= 1.5
    const isMarginGood = (val: number | null) => val !== null && val > 0.10

    return (
        <div className="space-y-6">
            {/* Price and Performance Indicators Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Price Indicators */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Indicatori di Prezzo</h3>
                    <div>
                        <IndicatorRow
                            label="P/E Ratio"
                            value={pe ?? 'N/A'}
                            isGood={isPEGood(pe)}
                            tooltip="Prezzo/Utili - Quanto si paga per 1 unità di utili"
                        />
                        <IndicatorRow
                            label="P/B Ratio"
                            value={pb ?? 'N/A'}
                            isGood={isPBGood(pb)}
                            tooltip="Prezzo/Valore Contabile - Rapporto con patrimonio netto"
                        />
                        <IndicatorRow
                            label="P/S Ratio"
                            value={ps ?? 'N/A'}
                            isGood={isPSGood(ps)}
                            tooltip="Prezzo/Ricavi - Valutazione basata sui ricavi"
                        />
                        <IndicatorRow
                            label="PEG Ratio"
                            value={peg ?? 'N/A'}
                            isGood={isPEGGood(peg)}
                            tooltip="P/E / EPS Growth - Valuta P/E rispetto alla crescita utili"
                        />
                    </div>
                </div>

                {/* Performance Indicators */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Indicatori di Performance</h3>
                    <div>
                        <IndicatorRow
                            label="ROE"
                            value={roe !== null ? `${(roe * 100).toFixed(2)}%` : 'N/A'}
                            isGood={isROEGood(roe)}
                            tooltip="Return on Equity - Redditività del capitale proprio"
                        />
                        <IndicatorRow
                            label="ROA"
                            value={roa !== null ? `${(roa * 100).toFixed(2)}%` : 'N/A'}
                            isGood={isROAGood(roa)}
                            tooltip="Return on Assets - Efficienza nell'uso degli asset"
                        />
                        <IndicatorRow
                            label="ROIC"
                            value={roic !== null ? `${(roic * 100).toFixed(2)}%` : 'N/A'}
                            isGood={isROICGood(roic)}
                            tooltip="Return on Invested Capital - Redditività capitale investito"
                        />
                        <IndicatorRow
                            label="Debt/Equity"
                            value={debtEquity !== null ? `${(debtEquity * 100).toFixed(2)}%` : 'N/A'}
                            isGood={isDebtEquityGood(debtEquity)}
                            tooltip="Rapporto Debito/Equity - Leva finanziaria"
                        />
                    </div>
                </div>
            </div>

            {/* Margins and Liquidity */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Margini di Redditività</h3>
                    <div>
                        <IndicatorRow
                            label="Margine Lordo"
                            value={grossMargin !== null ? `${(grossMargin * 100).toFixed(2)}%` : 'N/A'}
                            isGood={isMarginGood(grossMargin)}
                            tooltip="Ricavi - Costi diretti / Ricavi"
                        />
                        <IndicatorRow
                            label="Margine Operativo"
                            value={operatingMargin !== null ? `${(operatingMargin * 100).toFixed(2)}%` : 'N/A'}
                            isGood={isMarginGood(operatingMargin)}
                            tooltip="Utile operativo / Ricavi"
                        />
                        <IndicatorRow
                            label="Margine Netto"
                            value={profitMargin !== null ? `${(profitMargin * 100).toFixed(2)}%` : 'N/A'}
                            isGood={isMarginGood(profitMargin)}
                            tooltip="Utile netto / Ricavi"
                        />
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Indicatori di Liquidità</h3>
                    <div>
                        <IndicatorRow
                            label="Current Ratio"
                            value={currentRatio ?? 'N/A'}
                            isGood={isCurrentRatioGood(currentRatio)}
                            tooltip="Attività correnti / Passività correnti"
                        />
                        <IndicatorRow
                            label="Quick Ratio"
                            value={quickRatio ?? 'N/A'}
                            isGood={isQuickRatioGood(quickRatio)}
                            tooltip="(Liquidità + Crediti) / Passività correnti"
                        />
                        <IndicatorRow
                            label="Beta"
                            value={beta ?? 'N/A'}
                            isGood={isBetaGood(beta)}
                            tooltip="Volatilità rispetto al mercato"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
