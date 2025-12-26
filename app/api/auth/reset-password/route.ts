
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { rateLimit, getClientIp, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit"
import { passwordSchema, validateData } from "@/lib/validation"
import { z } from "zod"

const resetPasswordSchema = z.object({
    token: z.string().min(1, "Token richiesto"),
    password: passwordSchema,
})

export async function POST(request: Request) {
    try {
        // Rate limiting
        const clientIp = getClientIp(request)
        const rateLimitResult = rateLimit(`reset-password:${clientIp}`, RATE_LIMIT_CONFIGS.PASSWORD_RESET)

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { message: "Troppi tentativi. Riprova tra qualche minuto." },
                { status: 429 }
            )
        }

        const body = await request.json()

        // Validate input
        const validation = validateData(resetPasswordSchema, body)
        if (!validation.success) {
            return NextResponse.json({ message: validation.error }, { status: 400 })
        }

        const { token, password } = validation.data

        // Find token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token }
        })

        if (!resetToken) {
            return NextResponse.json({ message: "Token non valido o scaduto" }, { status: 400 })
        }

        // Check expiration
        if (new Date() > resetToken.expires) {
            await prisma.passwordResetToken.delete({ where: { token } })
            return NextResponse.json({ message: "Token scaduto" }, { status: 400 })
        }

        // Hash new password with increased rounds
        const hashedPassword = await hash(password, 12)

        // Update user
        await prisma.user.update({
            where: { email: resetToken.email },
            data: { password: hashedPassword }
        })

        // Delete used token
        await prisma.passwordResetToken.delete({ where: { token } })

        return NextResponse.json({ message: "Password aggiornata con successo" })

    } catch (error) {
        console.error("Reset Password Error:", error)
        return NextResponse.json({ message: "Si è verificato un errore" }, { status: 500 })
    }
}
