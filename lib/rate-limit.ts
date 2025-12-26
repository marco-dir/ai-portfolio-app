/**
 * Simple in-memory rate limiter for API routes
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
    count: number
    resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key)
        }
    }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
    /** Maximum number of requests allowed in the window */
    maxRequests: number
    /** Time window in seconds */
    windowSeconds: number
}

export interface RateLimitResult {
    success: boolean
    remaining: number
    resetIn: number
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the client (IP, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Result indicating if the request is allowed
 */
export function rateLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now()
    const windowMs = config.windowSeconds * 1000
    const key = identifier

    const entry = rateLimitStore.get(key)

    if (!entry || now > entry.resetTime) {
        // First request or window expired - create new entry
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + windowMs
        })
        return {
            success: true,
            remaining: config.maxRequests - 1,
            resetIn: config.windowSeconds
        }
    }

    if (entry.count >= config.maxRequests) {
        // Rate limit exceeded
        return {
            success: false,
            remaining: 0,
            resetIn: Math.ceil((entry.resetTime - now) / 1000)
        }
    }

    // Increment count
    entry.count++
    return {
        success: true,
        remaining: config.maxRequests - entry.count,
        resetIn: Math.ceil((entry.resetTime - now) / 1000)
    }
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
    const forwardedFor = request.headers.get('x-forwarded-for')
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim()
    }

    const realIp = request.headers.get('x-real-ip')
    if (realIp) {
        return realIp
    }

    return 'unknown'
}

// Preset configurations for common use cases
export const RATE_LIMIT_CONFIGS = {
    /** Login attempts: 5 per minute */
    LOGIN: { maxRequests: 5, windowSeconds: 60 },
    /** Registration: 3 per minute */
    REGISTER: { maxRequests: 3, windowSeconds: 60 },
    /** Password reset: 3 per minute */
    PASSWORD_RESET: { maxRequests: 3, windowSeconds: 60 },
    /** API calls: 100 per minute */
    API: { maxRequests: 100, windowSeconds: 60 },
    /** Strict: 10 per minute */
    STRICT: { maxRequests: 10, windowSeconds: 60 },
}
