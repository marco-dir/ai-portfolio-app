import { NextResponse } from "next/server"
import {
    getIncomeStatement,
    getBalanceSheet,
    getCashFlow
} from "@/lib/fmp"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    const period = searchParams.get("period") as "annual" | "quarter" || "annual"

    if (!symbol) {
        return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    try {
        // For quarterly data, fetch 120 records (30 years × 4 quarters)
        const limit = period === "quarter" ? 120 : 30

        const [incomeStatements, balanceSheets, cashFlows] = await Promise.all([
            getIncomeStatement(symbol, period, limit),
            getBalanceSheet(symbol, period, limit),
            getCashFlow(symbol, period, limit)
        ])

        return NextResponse.json({
            incomeStatements: incomeStatements || [],
            balanceSheets: balanceSheets || [],
            cashFlows: cashFlows || []
        })
    } catch (error) {
        console.error("Error fetching financial statements:", error)
        return NextResponse.json(
            { error: "Failed to fetch financial statements" },
            { status: 500 }
        )
    }
}
