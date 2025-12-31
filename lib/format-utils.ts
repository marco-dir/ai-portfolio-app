export const formatCurrency = (value: number, currency: string = "USD") => {
    if (value === undefined || value === null) return "N/A"

    // Currency symbol map
    const symbols: Record<string, string> = {
        'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CHF': 'Fr',
        'CAD': 'C$', 'AUD': 'A$', 'CNY': '¥'
    }
    const symbol = symbols[currency] || currency + " "

    const absValue = Math.abs(value)
    const sign = value < 0 ? "-" : ""

    if (absValue >= 1e12) return `${sign}${symbol}${(absValue / 1e12).toFixed(2)}T`
    if (absValue >= 1e9) return `${sign}${symbol}${(absValue / 1e9).toFixed(2)}B`
    if (absValue >= 1e6) return `${sign}${symbol}${(absValue / 1e6).toFixed(2)}M`
    if (absValue >= 1e3) return `${sign}${symbol}${(absValue / 1e3).toFixed(2)}K`

    return `${sign}${symbol}${absValue.toFixed(2)}`
}

export const formatNumber = (value: number) => {
    if (value === undefined || value === null) return "N/A"
    return new Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(value)
}
