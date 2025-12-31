
import { NextResponse } from "next/server"

const FMP_API_KEY = process.env.FMP_API_KEY
const BASE_URL = "https://financialmodelingprep.com/api/v3"

// Cache the ETF list in memory (for the lifetime of the server instance)
// In a serverless environment, this might be re-fetched frequently, which is fine for 2MB.
// We could add better caching if needed (e.g. Vercel KV or just rely on Next.js fetch cache)
let etfCache: any[] | null = null
let lastFetchTime = 0
const CACHE_DURATION = 1000 * 60 * 60 * 24 // 24 hours

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")?.toLowerCase()

    if (!query) {
        return NextResponse.json([])
    }

    try {
        const now = Date.now()

        // Fetch if not cached or expired
        if (!etfCache || (now - lastFetchTime > CACHE_DURATION)) {
            console.log("Fetching ETF list from FMP...")
            const res = await fetch(`${BASE_URL}/etf/list?apikey=${FMP_API_KEY}`, {
                next: { revalidate: 86400 } // Revalidate every 24 hours
            })

            if (!res.ok) throw new Error("Failed to fetch ETF list")

            etfCache = await res.json()
            lastFetchTime = now
            console.log(`Cached ${etfCache?.length} ETFs`)
        }

        // Filter valid ETFs
        // Search by symbol or name
        const results = etfCache?.filter((etf: any) =>
            etf.symbol.toLowerCase().includes(query) ||
            (etf.name && etf.name.toLowerCase().includes(query))
        ).slice(0, 10) // Limit to 10 suggestions

        return NextResponse.json(results)

    } catch (error) {
        console.error("ETF Search Error:", error)
        return NextResponse.json({ error: "Failed to search ETFs" }, { status: 500 })
    }
}
