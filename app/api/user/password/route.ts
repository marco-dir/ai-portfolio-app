import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { compare, hash } from "bcryptjs"
import { z } from "zod"

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "La password attuale è richiesta"),
    newPassword: z.string().min(6, "La nuova password deve essere di almeno 6 caratteri")
})

export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const body = await request.json()
        const { currentPassword, newPassword } = changePasswordSchema.parse(body)

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return new NextResponse("User not found", { status: 404 })
        }

        const isPasswordValid = await compare(currentPassword, user.password)

        if (!isPasswordValid) {
            return new NextResponse("Password attuale non corretta", { status: 400 })
        }

        const hashedPassword = await hash(newPassword, 10)

        await prisma.user.update({
            where: { email: session.user.email },
            data: { password: hashedPassword }
        })

        return NextResponse.json({ message: "Password aggiornata con successo" })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(error.errors[0].message, { status: 400 })
        }
        console.error("[PASSWORD_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
