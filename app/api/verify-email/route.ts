import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { sendWelcomeEmail } from "@/lib/email"

export async function POST(req: Request) {
    try {
        const { token } = await req.json()

        if (!token) {
            return NextResponse.json({ message: "Token mancante" }, { status: 400 })
        }

        const existingToken = await prisma.verificationToken.findUnique({
            where: { token }
        })

        if (!existingToken) {
            return NextResponse.json({ message: "Token non valido o scaduto" }, { status: 400 })
        }

        const hasExpired = new Date(existingToken.expires) < new Date()

        if (hasExpired) {
            await prisma.verificationToken.delete({ where: { id: existingToken.id } })
            return NextResponse.json({ message: "Token scaduto. Richiedine uno nuovo." }, { status: 400 })
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: existingToken.email }
        })

        if (!existingUser) {
            return NextResponse.json({ message: "Email non trovata" }, { status: 400 })
        }

        // Update user as verified
        await prisma.user.update({
            where: { id: existingUser.id },
            data: {
                emailVerified: new Date(),
            }
        })

        // Delete verification token
        await prisma.verificationToken.delete({
            where: { id: existingToken.id }
        })

        // Now send the welcome email
        try {
            await sendWelcomeEmail(existingUser.email, existingUser.name || undefined)
        } catch (emailError) {
            console.error("Failed to send welcome email after verification:", emailError)
        }

        return NextResponse.json({ message: "Email verificata con successo" }, { status: 200 })
    } catch (error) {
        console.error("Verification error:", error)
        return NextResponse.json({ message: "Si è verificato un errore durante la verifica" }, { status: 500 })
    }
}
