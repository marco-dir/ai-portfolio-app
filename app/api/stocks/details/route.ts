import { NextResponse } from "next/server"
import { getProfile, getHistoricalPrice } from "@/lib/fmp"

export async function GET(req: Request) {
    const url = new URL(req.url)
    const symbol = url.searchParams.get("symbol")

    if (!symbol) {
        return NextResponse.json({ message: "Symbol required" }, { status: 400 })
    }

    try {
        const [profileData, historicalData] = await Promise.all([
            getProfile(symbol),
            getHistoricalPrice(symbol)
        ])

        const profile = profileData?.[0]
        const history = historicalData?.historical || []

        // Calculate YTD
        const currentYear = new Date().getFullYear()
        // Sort history by date ascending for easier YTD calculation
        // FMP returns descending usually, so we sort to find the first quote of the year.
        const sortedHistory = [...history].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

        // Find the first quote of the current year
        const startOfYear = sortedHistory.find((q: any) => new Date(q.date).getFullYear() === currentYear)
        // Get the most recent price
        const currentPrice = sortedHistory[sortedHistory.length - 1]?.close

        let ytd = 0
        if (startOfYear && currentPrice) {
            ytd = ((currentPrice - startOfYear.close) / startOfYear.close) * 100
        }

        // Filter for 1 Year history for the chart (default view)
        // The frontend might want more, but the previous implementation returned 1 year.
        // FMP historical-price-full returns 5 years by default or we can specify.
        // Let's return what we have, or filter to 1 year to match previous behavior if needed, 
        // but the new requirement asks for 1Y, YTD, 2Y, 5Y. 
        // So returning full history (or 5 years) is better, and let frontend filter?
        // Or the frontend will request specific ranges?
        // The current frontend expects `historical` array.
        // Let's return the last 5 years if available, or just pass through.
        // But `historical-price-full` returns a lot of data.
        // Let's filter to 1 year for now to maintain compatibility, 
        // AND the new chart component will likely request specific ranges or we send all and filter on client.
        // Sending 5 years of daily data might be heavy (~1250 points).
        // Let's send 1 year for now as per "details" endpoint contract, 
        // and maybe add a new endpoint for full history or handle it here.
        // The plan said "Update the chart data fetching logic to use historical data from FMP based on the selected range."
        // So maybe I should return more data here, or fetch on demand.
        // Given the current structure, `PortfolioView` fetches details once.
        // I'll return 1 year here to be safe with payload size, and if user clicks 5Y, we might need another fetch or just return 5Y here.
        // 5 years is ~180KB JSON. Acceptable.
        // Let's return 5 years (or whatever FMP gives, usually 5Y).

        return NextResponse.json({
            sector: profile?.sector || "Unknown",
            country: profile?.country || "Unknown",
            currency: profile?.currency || "USD", // FMP profile has 'currency' field
            beta: profile?.beta || 1.0, // FMP profile has 'beta' field
            ytd,
            historical: sortedHistory
                .filter((q: any) => q.close > 0)
                .map((q: any) => ({
                    date: q.date,
                    close: q.close
                }))
        })
    } catch (error) {
        console.error(`Error fetching details for ${symbol}:`, error)
        // Return default values on error to prevent UI breakage
        return NextResponse.json({
            sector: "Unknown",
            country: "Unknown",
            currency: "USD",
            beta: 1.0,
            ytd: 0,
            historical: []
        })
    }
}
