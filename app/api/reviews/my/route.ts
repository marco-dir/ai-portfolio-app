"use server"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Fetch current user's review
export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ message: "Non autorizzato" }, { status: 401 })
    }

    try {
        const review = await prisma.review.findUnique({
            where: { userId: session.user.id }
        })

        return NextResponse.json(review)
    } catch (error) {
        console.error("Error fetching user review:", error)
        return NextResponse.json({ message: "Errore" }, { status: 500 })
    }
}
