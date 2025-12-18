import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendNewsletter } from "@/lib/email"
import { z } from "zod"

const newsletterSchema = z.object({
    subject: z.string().min(1),
    content: z.string().min(1),
})

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        // Check for Admin role
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { subject, content } = newsletterSchema.parse(body)

        // Fetch subscribed users
        const subscribers = await prisma.user.findMany({
            where: {
                newsletterSubscribed: true
            },
            select: {
                email: true
            }
        })

        console.log(`Sending newsletter "${subject}" to ${subscribers.length} subscribers...`)

        // Send emails (simple loop for now)
        // In production, use batching or a queue
        let sentCount = 0
        for (const sub of subscribers) {
            const success = await sendNewsletter(sub.email, subject, content)
            if (success) sentCount++
        }

        return NextResponse.json({
            message: "Newsletter sent successfully",
            totalSubscribers: subscribers.length,
            sentCount
        }, { status: 200 })

    } catch (error) {
        console.error("Newsletter send error:", error)
        return NextResponse.json({ message: "Failed to send newsletter" }, { status: 500 })
    }
}
