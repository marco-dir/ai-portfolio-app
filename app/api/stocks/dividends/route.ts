import { NextResponse } from "next/server"
import { getDividends } from "@/lib/fmp"

export async function GET(req: Request) {
    const url = new URL(req.url)
    const symbol = url.searchParams.get("symbol")

    if (!symbol) {
        return NextResponse.json({ message: "Symbol required" }, { status: 400 })
    }

    try {
        const data = await getDividends(symbol)
        return NextResponse.json(data)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: "Failed to fetch dividends" }, { status: 500 })
    }
}
