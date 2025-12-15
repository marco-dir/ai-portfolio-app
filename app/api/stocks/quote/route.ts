import { NextResponse } from "next/server"
import { getQuote, getRatios, getCachedProfile } from "@/lib/fmp"

export async function GET(req: Request) {
    const url = new URL(req.url)
    const symbol = url.searchParams.get("symbol")

    if (!symbol) {
        return NextResponse.json({ message: "Symbol required" }, { status: 400 })
    }

    try {
        const [quoteData, ratiosData, profileData] = await Promise.all([
            getQuote(symbol),
            getRatios(symbol),
            getCachedProfile(symbol)
        ])

        const quote = quoteData?.[0]
        const ratios = ratiosData?.[0]
        const profile = profileData?.[0]

        if (!quote) {
            return NextResponse.json({ message: "Stock not found" }, { status: 404 })
        }

        return NextResponse.json({
            symbol: quote.symbol,
            price: quote.price,
            change: quote.changesPercentage,
            name: quote.name,
            pe: quote.pe,
            pb: ratios?.priceToBookRatioTTM || null,
            divYield: ratios?.dividendYielPercentageTTM || ratios?.dividendYieldPercentageTTM || null, // Handle potential typo
            marketCap: quote.marketCap,
            high52: quote.yearHigh,
            low52: quote.yearLow,
            currency: profile?.currency || quote.currency || "USD",
            peg: ratios?.pegRatioTTM || null
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: "Failed to fetch data" }, { status: 500 })
    }
}
