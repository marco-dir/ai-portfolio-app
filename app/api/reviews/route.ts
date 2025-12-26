"use server"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const reviewSchema = z.object({
    rating: z.number().min(1).max(5),
    content: z.string().min(10).max(500)
})

// GET - Fetch all reviews for homepage (public)
export async function GET() {
    try {
        const reviews = await prisma.review.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10 // Limit to 10 reviews
        })

        return NextResponse.json(reviews)
    } catch (error) {
        console.error("Error fetching reviews:", error)
        return NextResponse.json({ message: "Failed to fetch reviews" }, { status: 500 })
    }
}

// POST - Submit or update review (subscribed users only)
export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ message: "Non autorizzato" }, { status: 401 })
    }

    try {
        // Check if user has active subscription
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (!user || (user.subscriptionStatus !== 'active' && user.subscriptionStatus !== 'trialing')) {
            return NextResponse.json(
                { message: "Solo gli utenti abbonati possono lasciare una recensione" },
                { status: 403 }
            )
        }

        const body = await req.json()
        const { rating, content } = reviewSchema.parse(body)

        // Upsert review (create or update)
        const review = await prisma.review.upsert({
            where: { userId: session.user.id },
            update: {
                rating,
                content
            },
            create: {
                userId: session.user.id,
                rating,
                content
            }
        })

        return NextResponse.json(review, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: "Dati non validi" }, { status: 400 })
        }
        console.error("Error creating review:", error)
        return NextResponse.json({ message: "Errore durante il salvataggio" }, { status: 500 })
    }
}
