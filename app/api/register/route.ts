import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { NextResponse } from "next/server"
import { z } from "zod"
import { sendWelcomeEmail } from "@/lib/email"

const userSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, password, name } = userSchema.parse(body)

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({ user: null, message: "User with this email already exists" }, { status: 409 })
        }

        const hashedPassword = await hash(password, 10)

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            }
        })

        const { password: newUserPassword, ...rest } = newUser

        // Send welcome email (fire and forget)
        try {
            await sendWelcomeEmail(email, name || undefined)
        } catch (emailError) {
            console.error("Failed to send welcome email:", emailError)
            // Don't block registration if email fails
        }

        return NextResponse.json({ user: rest, message: "User created successfully" }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ user: null, message: "Something went wrong" }, { status: 500 })
    }
}
