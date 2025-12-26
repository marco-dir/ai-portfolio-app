import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { z } from "zod"

const symbolSchema = z.object({
    symbol: z.string().min(1),
})

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        let watchlist = await prisma.watchlist.findUnique({
            where: { userId: session.user.id }
        })

        if (!watchlist) {
            // Create empty watchlist if not exists
            watchlist = await prisma.watchlist.create({
                data: {
                    userId: session.user.id,
                    symbols: ""
                }
            })
        }

        const symbols = watchlist.symbols ? watchlist.symbols.split(",").filter(s => s) : []
        return NextResponse.json({ symbols })
    } catch (error) {
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { symbol } = symbolSchema.parse(body)
        const upperSymbol = symbol.toUpperCase()

        let watchlist = await prisma.watchlist.findUnique({
            where: { userId: session.user.id }
        })

        if (!watchlist) {
            watchlist = await prisma.watchlist.create({
                data: {
                    userId: session.user.id,
                    symbols: upperSymbol
                }
            })
        } else {
            const currentSymbols = watchlist.symbols ? watchlist.symbols.split(",") : []
            if (!currentSymbols.includes(upperSymbol)) {
                // Check limits
                const user = await prisma.user.findUnique({
                    where: { id: session.user.id }
                })

                if (user) {
                    const { shouldEnforceLimits, MAX_WATCHLIST_SYMBOLS } = await import("@/lib/subscription-limits")
                    if (shouldEnforceLimits(user) && currentSymbols.length >= MAX_WATCHLIST_SYMBOLS) {
                        return NextResponse.json(
                            { message: `Watchlist limit reached (${MAX_WATCHLIST_SYMBOLS}) for your subscription plan` },
                            { status: 403 }
                        )
                    }
                }

                currentSymbols.push(upperSymbol)
                await prisma.watchlist.update({
                    where: { userId: session.user.id },
                    data: { symbols: currentSymbols.join(",") }
                })
            }
        }

        return NextResponse.json({ message: "Symbol added" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const url = new URL(req.url)
        const symbol = url.searchParams.get("symbol")

        if (!symbol) {
            return NextResponse.json({ message: "Symbol required" }, { status: 400 })
        }

        const upperSymbol = symbol.toUpperCase()

        const watchlist = await prisma.watchlist.findUnique({
            where: { userId: session.user.id }
        })

        if (watchlist && watchlist.symbols) {
            const currentSymbols = watchlist.symbols.split(",")
            const newSymbols = currentSymbols.filter(s => s !== upperSymbol)

            await prisma.watchlist.update({
                where: { userId: session.user.id },
                data: { symbols: newSymbols.join(",") }
            })
        }

        return NextResponse.json({ message: "Symbol removed" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
    }
}
