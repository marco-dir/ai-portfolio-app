import { NextResponse } from "next/server"

const FMP_API_KEY = process.env.FMP_API_KEY
const BASE_URL = "https://financialmodelingprep.com/api/v3"

export async function GET(req: Request) {
    const url = new URL(req.url)
    const currency = url.searchParams.get("currency")

    if (!currency) {
        return NextResponse.json({ message: "Currency required" }, { status: 400 })
    }

    if (currency === "USD") {
        return NextResponse.json({ rate: 1 })
    }

    try {
        // Fetch pair like EURUSD, GBPUSD, etc.
        // FMP usually has pairs like EURUSD for 1 EUR -> x USD
        const pair = `${currency}USD`
        const res = await fetch(`${BASE_URL}/quote/${pair}?apikey=${FMP_API_KEY}`)

        if (!res.ok) {
            throw new Error("Failed to fetch forex rate")
        }

        const data = await res.json()

        if (data && data.length > 0) {
            return NextResponse.json({ rate: data[0].price })
        }

        // Try inverted pair if direct not found (unlikely for major currencies but possible)
        const invertedPair = `USD${currency}`
        const resInv = await fetch(`${BASE_URL}/quote/${invertedPair}?apikey=${FMP_API_KEY}`)

        if (resInv.ok) {
            const dataInv = await resInv.json()
            if (dataInv && dataInv.length > 0) {
                return NextResponse.json({ rate: 1 / dataInv[0].price })
            }
        }

        return NextResponse.json({ message: "Rate not found" }, { status: 404 })

    } catch (error) {
        console.error("[FOREX_API]", error)
        return NextResponse.json({ message: "Internal Error" }, { status: 500 })
    }
}
