import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { z } from "zod"

const addStockSchema = z.object({
    symbol: z.string().min(1),
    quantity: z.number().positive(),
    buyPrice: z.number().positive(),
})

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { symbol, quantity, buyPrice } = addStockSchema.parse(body)
        const upperSymbol = symbol.toUpperCase()

        // Verify portfolio ownership
        const portfolio = await prisma.portfolio.findUnique({
            where: {
                id: id,
                userId: session.user.id
            }
        })

        if (!portfolio) {
            return NextResponse.json({ message: "Portfolio not found" }, { status: 404 })
        }

        // Check if stock already exists in this portfolio
        const existingStock = await prisma.stockPosition.findFirst({
            where: {
                portfolioId: id,
                symbol: upperSymbol
            }
        })

        if (existingStock) {
            // Calculate weighted average
            const totalQuantity = existingStock.quantity + quantity
            const totalCost = (existingStock.quantity * existingStock.buyPrice) + (quantity * buyPrice)
            const averagePrice = totalCost / totalQuantity

            await prisma.stockPosition.update({
                where: { id: existingStock.id },
                data: {
                    quantity: totalQuantity,
                    buyPrice: averagePrice
                }
            })
        } else {
            // Check limits for new position
            const user = await prisma.user.findUnique({
                where: { id: session.user.id }
            })

            if (user) {
                const { shouldEnforceLimits, MAX_STOCKS_PER_PORTFOLIO } = await import("@/lib/subscription-limits")
                if (shouldEnforceLimits(user)) {
                    const stockCount = await prisma.stockPosition.count({
                        where: { portfolioId: id }
                    })

                    if (stockCount >= MAX_STOCKS_PER_PORTFOLIO) {
                        return NextResponse.json(
                            { message: `Stock limit reached (${MAX_STOCKS_PER_PORTFOLIO}) for this portfolio` },
                            { status: 403 }
                        )
                    }
                }
            }

            await prisma.stockPosition.create({
                data: {
                    portfolioId: id,
                    symbol: upperSymbol,
                    quantity,
                    buyPrice
                }
            })
        }

        const updatedPortfolio = await prisma.portfolio.findUnique({
            where: { id },
            include: { stocks: true }
        })

        return NextResponse.json(updatedPortfolio, { status: 201 })
    } catch (error) {
        console.error("Error adding stock:", error)
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
    }
}
