import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; stockId: string }> }
) {
    const session = await getServerSession(authOptions)
    const { id, stockId } = await params

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
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

        // Verify stock belongs to portfolio
        const stockPosition = await prisma.stockPosition.findFirst({
            where: {
                id: stockId,
                portfolioId: id
            }
        })

        if (!stockPosition) {
            return NextResponse.json({ message: "Stock position not found" }, { status: 404 })
        }

        await prisma.stockPosition.delete({
            where: {
                id: stockId
            }
        })

        const updatedPortfolio = await prisma.portfolio.findUnique({
            where: { id },
            include: { stocks: true }
        })

        return NextResponse.json(updatedPortfolio)
    } catch (error) {
        console.error("[STOCK_DELETE]", error)
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
    }
}
