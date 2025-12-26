import { NextResponse } from "next/server"

const FMP_API_KEY = process.env.FMP_API_KEY

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

    if (!query || query.length < 2) {
        return NextResponse.json([])
    }

    if (!FMP_API_KEY) {
        console.error("FMP_API_KEY not configured")
        return NextResponse.json({ error: "API not configured" }, { status: 503 })
    }

    try {
        const response = await fetch(
            `https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(query)}&limit=50&apikey=${FMP_API_KEY}`
        )

        if (!response.ok) {
            throw new Error("FMP API error")
        }

        const data = await response.json()

        // Return empty array if not valid response
        if (!Array.isArray(data)) {
            return NextResponse.json([])
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error("Stock search error:", error)
        return NextResponse.json({ error: "Search failed" }, { status: 500 })
    }
}
