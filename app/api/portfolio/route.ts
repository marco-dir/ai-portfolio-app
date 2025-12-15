import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { z } from "zod"

const createPortfolioSchema = z.object({
    name: z.string().min(1),
})

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const portfolios = await prisma.portfolio.findMany({
            where: {
                userId: session.user.id
            },
            include: {
                stocks: true
            }
        })

        return NextResponse.json(portfolios)
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
        const { name } = createPortfolioSchema.parse(body)

        const portfolio = await prisma.portfolio.create({
            data: {
                name,
                userId: session.user.id
            }
        })

        return NextResponse.json(portfolio, { status: 201 })
    } catch (error) {
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
    }
}
