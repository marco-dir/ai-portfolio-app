import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role?: string
            subscriptionStatus?: string | null
            trialEndsAt?: Date | string | null
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        role?: string
        subscriptionStatus?: string | null
        trialEndsAt?: Date | null
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role?: string
        subscriptionStatus?: string | null
        trialEndsAt?: Date | string | null
    }
}
