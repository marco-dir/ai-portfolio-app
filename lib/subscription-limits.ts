import { User } from "@prisma/client"

// Effective date set to "now" (2025-12-24) as per user request "da ora in poi"
export const LIMITS_EFFECTIVE_DATE = new Date("2025-12-24T00:00:00.000Z")
export const MAX_PORTFOLIOS = 2
export const MAX_STOCKS_PER_PORTFOLIO = 20
export const MAX_WATCHLIST_SYMBOLS = 30

/**
 * Determines if subscription limits should be enforced for a user.
 * Limits apply to users created ON or AFTER the effective date
 * AND who have an active subscription (or trial).
 */
export function shouldEnforceLimits(user: User): boolean {
    if (!user.createdAt) return false

    // Check if user was created on or after the effective date
    const isNewUser = new Date(user.createdAt) >= LIMITS_EFFECTIVE_DATE
    const hasSubscription = user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing'

    return isNewUser && hasSubscription
}
