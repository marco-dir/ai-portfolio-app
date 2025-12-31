import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { NextResponse } from "next/server"
import { sendWelcomeEmail, sendVerificationEmail } from "@/lib/email"
import { generateVerificationToken } from "@/lib/tokens"
import { rateLimit, getClientIp, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit"
import { registerSchema, validateData } from "@/lib/validation"

export async function POST(req: Request) {
    try {
        // Rate limiting
        const clientIp = getClientIp(req)
        const rateLimitResult = rateLimit(`register:${clientIp}`, RATE_LIMIT_CONFIGS.REGISTER)

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { user: null, message: "Troppi tentativi. Riprova tra qualche minuto." },
                {
                    status: 429,
                    headers: {
                        'Retry-After': rateLimitResult.resetIn.toString(),
                        'X-RateLimit-Remaining': '0',
                    }
                }
            )
        }

        const body = await req.json()

        // Validate input
        const validation = validateData(registerSchema, body)
        if (!validation.success) {
            return NextResponse.json({ user: null, message: validation.error }, { status: 400 })
        }

        const { email, password, name } = validation.data

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({ user: null, message: "Un utente con questa email esiste già" }, { status: 409 })
        }

        const hashedPassword = await hash(password, 12) // Increased from 10 to 12 rounds

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                subscriptionStatus: 'trialing',
                trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
                hasUsedTrial: true,
            }
        })

        const { password: newUserPassword, ...rest } = newUser

        // Generate verification token
        const verificationToken = await generateVerificationToken(email)

        // Send verification email
        try {
            await sendVerificationEmail(email, verificationToken.token)
            // Removed welcome email sending here, it should be sent after verification
        } catch (emailError) {
            console.error("Failed to send verification email:", emailError)
        }

        return NextResponse.json({ user: rest, message: "Utente creato con successo" }, { status: 201 })
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json({ user: null, message: "Si è verificato un errore" }, { status: 500 })
    }
}
