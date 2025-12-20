
import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"
import { Resend } from "resend"
import crypto from "crypto"

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!email) {
            return new NextResponse("Email richiesta", { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            // Return 200 even if user doesn't exist to prevent enumeration
            return NextResponse.json({ message: "Se l'email esiste, riceverai un link di reset." })
        }

        // Generate token
        const token = crypto.randomBytes(32).toString("hex")
        const expires = new Date(Date.now() + 3600000) // 1 hour

        // Save token - use upsert to handle multiple requests for the same email
        await prisma.passwordResetToken.upsert({
            where: { email },
            update: {
                token,
                expires
            },
            create: {
                email,
                token,
                expires
            }
        })

        // Send email
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

        await resend.emails.send({
            from: 'DIRAMCO <noreply@diramco.com>',
            to: email,
            subject: 'Reimposta la tua password',
            html: `
                <p>Hai richiesto il reset della password per il tuo account DIRAMCO.</p>
                <p>Clicca sul link sottostante per reimpostarla:</p>
                <a href="${resetUrl}">Reimposta Password</a>
                <p>Se non sei stato tu, ignora questa email.</p>
                <p>Il link scadrà tra 1 ora.</p>
            `
        })

        return NextResponse.json({ message: "Se l'email esiste, riceverai un link di reset." })

    } catch (error: any) {
        console.error("Forgot Password Error:", error)
        console.error("Error message:", error?.message)
        console.error("Error stack:", error?.stack)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
