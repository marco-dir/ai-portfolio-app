import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

import { revalidatePath } from "next/cache"
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const body = await request.json()
        const { name } = body

        if (!name) {
            return new NextResponse("Name is required", { status: 400 })
        }

        const portfolio = await prisma.portfolio.findFirst({
            where: {
                id: id,
                userId: session.user.id
            }
        })

        if (!portfolio) {
            return new NextResponse("Portfolio not found", { status: 404 })
        }

        const updatedPortfolio = await prisma.portfolio.update({
            where: { id: id },
            data: { name }
        })

        revalidatePath("/dashboard/portafoglio")
        revalidatePath(`/dashboard/portafoglio/${id}`)

        return NextResponse.json(updatedPortfolio)
    } catch (error) {
        console.error("[PORTFOLIO_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const portfolio = await prisma.portfolio.findFirst({
            where: {
                id: id,
                userId: session.user.id
            }
        })

        if (!portfolio) {
            return new NextResponse("Portfolio not found", { status: 404 })
        }

        await prisma.portfolio.delete({
            where: {
                id: id
            }
        })

        revalidatePath("/dashboard/portafoglio")

        return NextResponse.json(portfolio)
    } catch (error) {
        console.error("[PORTFOLIO_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
