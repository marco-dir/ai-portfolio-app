
import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

export async function POST(request: Request) {
    try {
        const { token, password } = await request.json()

        if (!token || !password) {
            return new NextResponse("Token e password richiesti", { status: 400 })
        }

        // Find token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token }
        })

        if (!resetToken) {
            return new NextResponse("Token non valido o scaduto", { status: 400 })
        }

        // Check expiration
        if (new Date() > resetToken.expires) {
            await prisma.passwordResetToken.delete({ where: { token } })
            return new NextResponse("Token scaduto", { status: 400 })
        }

        // Hash new password
        const hashedPassword = await hash(password, 10)

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
        return new NextResponse("Internal Error", { status: 500 })
    }
}
