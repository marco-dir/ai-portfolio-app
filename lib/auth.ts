import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/accedi",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                })

                if (!user) {
                    return null
                }

                const isPasswordValid = await compare(credentials.password, user.password)

                if (!isPasswordValid) {
                    return null
                }

                console.log('[AUTH DEBUG] User from DB:', { email: user.email, role: user.role })

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    subscriptionStatus: user.subscriptionStatus,
                    trialEndsAt: user.trialEndsAt,
                }
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id,
                    role: token.role,
                    subscriptionStatus: token.subscriptionStatus,
                    trialEndsAt: token.trialEndsAt,
                }
            }
        },
        async jwt({ token, user }) {
            if (user) {
                return {
                    ...token,
                    id: user.id,
                    role: user.role,
                    subscriptionStatus: user.subscriptionStatus,
                    trialEndsAt: user.trialEndsAt,
                }
            }
            return token
        }
    }
}
