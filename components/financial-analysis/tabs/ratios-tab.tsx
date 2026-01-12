import { useState, useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function KeyRatiosTab({ data, historicalPrice }: { data: any[], historicalPrice?: any[] }) {
    if (!data || data.length === 0) return <div className="p-4 text-gray-400">Nessun dato disponibile.</div>

    // Range Selector Logic
    const [range, setRange] = useState<"1Y" | "3Y" | "5Y" | "10Y" | "Max">("3Y")

    // Metric selection state - store selected metrics per group
    const [selectedMetrics, setSelectedMetrics] = useState<Record<string, string[]>>({})

    const processData = useMemo(() => {
        // Create safe array from historicalPrice which might be an object
        let priceArray: any[] = []
        if (Array.isArray(historicalPrice)) {
            priceArray = historicalPrice
        } else if (historicalPrice && typeof historicalPrice === 'object' && 'historical' in historicalPrice) {
            priceArray = (historicalPrice as any).historical || []
        }

        if (priceArray.length === 0) {
            return data
        }

        // Sort data by date ascending
        const sortedRatios = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        const sortedPrices = [...priceArray].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        // Generate monthly points
        const monthlyData: any[] = []

        // Start from the first available ratio date
        if (sortedRatios.length === 0) return []

        const startDate = new Date(sortedRatios[0].date)
        const endDate = new Date() // Today



        // Faster approach:
        // 1. Map all prices to YYYY-MM buckets, taking the last one of the month.
        const monthlyPrices = new Map<string, number>()
        sortedPrices.forEach(p => {
            const d = p.date.substring(0, 7) // YYYY-MM
            monthlyPrices.set(d, p.close) // Will overwrite with later dates, so last one sticks
        })

        // 2. Iterate months from start to end
        const result = []
        const monthCursor = new Date(startDate)
        monthCursor.setDate(1)

        const today = new Date()

        while (monthCursor <= today) {
            const year = monthCursor.getFullYear()
            const month = monthCursor.getMonth() + 1
            const monthStr = `${year}-${String(month).padStart(2, '0')}`
            const dateStr = monthCursor.toISOString().split('T')[0]

            // Get price for this month (end of month price)
            const price = monthlyPrices.get(monthStr)

            // Find most recent quarterly ratio report before or equal to this month
            // We look for ratio report date <= end of this month
            const endOfMonthDate = new Date(year, month, 0) // last day of month

            // Find last ratio where date <= endOfMonthDate
            let latestRatio = null
            for (let i = sortedRatios.length - 1; i >= 0; i--) {
                if (new Date(sortedRatios[i].date) <= endOfMonthDate) {
                    latestRatio = sortedRatios[i]
                    break
                }
            }

            if (latestRatio && price) {
                // Calculate derived metrics
                // P/E = Price / (PriceQuarterly / PEQuarterly) -> effectively Price / EPS_TTM
                // If PEQuarterly is null or 0, we can't recover EPS easily this way without income statement.
                // Alternative: We assume user wants granular Valuation.

                // Let's calculated EPS from the ratio if possible:
                const ratioPrice = latestRatio.priceEarningsRatio ? (latestRatio.priceEarningsRatio > 0 ? latestRatio.priceEarningsRatio : 0) : 0 // Wait, we don't know the price at ratio date inside the ratio object usually... FMP ratio object DOES include 'price' sometimes? No.
                // Actually FMP Ratios endpoint returns: { date, period, ... priceEarningsRatio, ... }
                // It does NOT strictly return the price used. 
                // But we can approximate implied EPS = Price(at ratio date) / PE. 
                // We verify if we have historical price at ratio date.

                // Simpler robust method:
                // We use the Quarterly Ratio as "Fundamental Truth" for non-price metrics.
                // For Price-based metrics, we scale them.
                // New PE = Old PE * (Current Price / Reference Price at Quarter)
                // We need Reference Price at Quarter. We can find it from historicalPrices using ratio.date

                // Let's try to get reference price for the ratio
                const ratioDateStr = latestRatio.date
                // Find price at ratioDateStr
                const refPriceObj = sortedPrices.find(p => p.date === ratioDateStr)
                    || sortedPrices.find(p => p.date >= ratioDateStr) // or closest after

                const refPrice = refPriceObj ? refPriceObj.close : null

                const newItem = { ...latestRatio, date: monthStr + "-01", originalDate: latestRatio.date } // clone

                if (refPrice && price) {
                    const priceFactor = price / refPrice

                    // Update Valuation Metrics
                    if (latestRatio.priceEarningsRatio) newItem.priceEarningsRatio = latestRatio.priceEarningsRatio * priceFactor
                    if (latestRatio.priceToBookRatio) newItem.priceToBookRatio = latestRatio.priceToBookRatio * priceFactor
                    if (latestRatio.priceToSalesRatio) newItem.priceToSalesRatio = latestRatio.priceToSalesRatio * priceFactor
                    if (latestRatio.priceToFreeCashFlowsRatio) newItem.priceToFreeCashFlowsRatio = latestRatio.priceToFreeCashFlowsRatio * priceFactor
                    if (latestRatio.enterpriseValueMultiple) newItem.enterpriseValueMultiple = latestRatio.enterpriseValueMultiple * priceFactor // EV changes roughly with price (Equity value changes)

                    // Dividend Yield inverses with price
                    if (latestRatio.dividendYield) newItem.dividendYield = latestRatio.dividendYield / priceFactor
                }

                // For Monthly chart we use the YYYY-MM label
                newItem.periodLabel = monthStr

                result.push(newItem)
            } else if (latestRatio) {
                // partial data (no price, e.g. recent month but no price data yet?), just use ratio flat
                // or skip
                const newItem = { ...latestRatio, date: monthStr + "-01", periodLabel: monthStr }
                result.push(newItem)
            }

            // Next month
            monthCursor.setMonth(monthCursor.getMonth() + 1)
        }

        return result.reverse() // Return descending for standard processing/usage if needed, but the original code did slice then map. 
        // Original code: filteredData.map...reverse(). 
        // My chartData map expects descending? 
        // Original: "const filteredData = getFilteredData(data) ... map ... .reverse()"
        // The original 'data' prop was likely descending (newest first).
        // My 'processData' result should probably mimic 'data' structure: Newest First.

    }, [data, historicalPrice])


    const getFilteredData = (processedData: any[]) => {
        if (range === "Max") return processedData

        // Months count
        const months = range === "1Y" ? 12 : range === "3Y" ? 36 : range === "5Y" ? 60 : range === "10Y" ? 120 : 9999
        return processedData.slice(0, months)
    }

    const filteredData = getFilteredData(processData)

    // Ratio Groups
    const ratioGroups = [
        {
            title: "Redditività",
            metrics: [
                { label: "ROE", key: "returnOnEquity", color: "#3b82f6" },
                { label: "ROA", key: "returnOnAssets", color: "#10b981" },
                { label: "ROIC", key: "returnOnCapitalEmployed", color: "#8b5cf6" },
                { label: "ROI", key: "returnOnInvestment", color: "#f59e0b" },
                { label: "Margine Netto", key: "netProfitMargin", color: "#ef4444" },
                { label: "Margine Operativo", key: "operatingProfitMargin", color: "#06b6d4" },
                { label: "Margine Lordo", key: "grossProfitMargin", color: "#ec4899" },
            ]
        },
        {
            title: "Valutazione",
            metrics: [
                { label: "P/E", key: "priceEarningsRatio", color: "#3b82f6" },
                { label: "P/B", key: "priceToBookRatio", color: "#10b981" },
                { label: "P/S", key: "priceToSalesRatio", color: "#8b5cf6" },
                { label: "PEG", key: "pegRatio", color: "#f59e0b" },
                { label: "EV/Sales", key: "enterpriseValueMultiple", color: "#ef4444" },
                { label: "P/FCF", key: "priceToFreeCashFlowsRatio", color: "#06b6d4" },
            ]
        },
        {
            title: "Salute Finanziaria",
            metrics: [
                { label: "Debt/Equity", key: "debtEquityRatio", color: "#ef4444" },
                { label: "Current Ratio", key: "currentRatio", color: "#10b981" },
                { label: "Quick Ratio", key: "quickRatio", color: "#3b82f6" },
                { label: "Cash Ratio", key: "cashRatio", color: "#8b5cf6" },
                { label: "Interest Coverage", key: "interestCoverage", color: "#f59e0b" },
            ]
        },
        {
            title: "Efficienza",
            metrics: [
                { label: "Asset Turnover", key: "assetTurnover", color: "#3b82f6" },
                { label: "Inventory Turnover", key: "inventoryTurnover", color: "#10b981" },
                { label: "Receivables Turnover", key: "receivablesTurnover", color: "#8b5cf6" },
                { label: "Days Sales Outstanding", key: "daysOfSalesOutstanding", color: "#f59e0b" },
                { label: "Days Inventory Outstanding", key: "daysOfInventoryOutstanding", color: "#ef4444" },
                { label: "Days Payables Outstanding", key: "daysOfPayablesOutstanding", color: "#06b6d4" },
                { label: "Cash Conversion Cycle", key: "cashConversionCycle", color: "#ec4899" },
                { label: "Dividend Yield", key: "dividendYield", color: "#14b8a6" },
            ]
        }
    ]

    // Get selected metrics for a group (with defaults)
    const getSelectedMetricsForGroup = (groupTitle: string, metrics: any[]) => {
        if (selectedMetrics[groupTitle]) {
            return selectedMetrics[groupTitle]
        }
        // Default: select first metric
        return [metrics[0].key]
    }

    // Toggle metric selection for a group
    const toggleMetricForGroup = (groupTitle: string, metricKey: string, allMetrics: any[]) => {
        const current = getSelectedMetricsForGroup(groupTitle, allMetrics)
        let updated: string[]

        if (current.includes(metricKey)) {
            // Deselect - but keep at least one selected
            if (current.length > 1) {
                updated = current.filter(k => k !== metricKey)
            } else {
                return // Don't allow deselecting the last one
            }
        } else {
            // Select - limit to 5 metrics
            if (current.length < 5) {
                updated = [...current, metricKey]
            } else {
                return // Don't allow more than 5
            }
        }

        setSelectedMetrics(prev => ({
            ...prev,
            [groupTitle]: updated
        }))
    }

    return (
        <div className="space-y-8">
            {/* Range Selector */}
            <div className="flex items-center justify-end gap-4">
                <span className="text-sm text-gray-400 font-medium">Periodo:</span>
                <div className="flex bg-gray-800 rounded-lg p-0.5 gap-0.5">
                    {(["1Y", "3Y", "5Y", "10Y", "Max"] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${range === r
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-gray-400 hover:text-gray-200"
                                }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {ratioGroups.map((group) => {
                const selected = getSelectedMetricsForGroup(group.title, group.metrics)
                const selectedMetricObjects = group.metrics.filter(m => selected.includes(m.key))

                // Prepare chart data
                const chartData = filteredData.map(item => {
                    // Use pre-calculated label if valid, or derive
                    let label = item.periodLabel
                    if (!label) {
                        const date = new Date(item.date)
                        const year = date.getFullYear()
                        // Fallback for older data without periodLabel
                        const month = date.getMonth() + 1
                        const quarter = month < 4 ? 'Q1' : month < 7 ? 'Q2' : month < 10 ? 'Q3' : 'Q4'
                        // If it came from our processData it has periodLabel (YYYY-MM)
                        // If fallback, use Qx YYYY
                        label = `${quarter} ${year}`
                    }

                    const dataPoint: any = { period: label, rawDate: item.date }
                    selectedMetricObjects.forEach(metric => {
                        const value = item[metric.key]
                        dataPoint[metric.key] = value !== null && value !== undefined ? value : null
                    })
                    return dataPoint
                }).reverse()

                return (
                    <div key={group.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">{group.title}</h3>

                        {/* Metric Selection Buttons */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {group.metrics.map((metric) => {
                                const isSelected = selected.includes(metric.key)
                                return (
                                    <button
                                        key={metric.key}
                                        onClick={() => toggleMetricForGroup(group.title, metric.key, group.metrics)}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border ${isSelected
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-gray-800 text-gray-400 hover:bg-gray-700 border-gray-700"
                                            }`}
                                    >
                                        {metric.label}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Chart */}
                        {selectedMetricObjects.length > 0 && (
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                        <XAxis
                                            dataKey="period"
                                            stroke="#9CA3AF"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            // Show fewer ticks for monthly data to avoid crowding
                                            minTickGap={30}
                                        />
                                        <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#1f2937",
                                                border: "1px solid #374151",
                                                borderRadius: "8px",
                                                color: "#fff"
                                            }}
                                            labelFormatter={(label) => label}
                                        />
                                        <Legend />
                                        {selectedMetricObjects.map((metric) => (
                                            <Line
                                                key={metric.key}
                                                type="monotone"
                                                dataKey={metric.key}
                                                stroke={metric.color}
                                                strokeWidth={2}
                                                dot={historicalPrice ? false : { r: 3 }} // No dots for monthly (too many points)
                                                name={metric.label}
                                                connectNulls
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
