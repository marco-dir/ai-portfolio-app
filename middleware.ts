import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl
        const token = req.nextauth.token

        // Admin routes - require admin role
        if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
            if (token?.role !== "ADMIN") {
                if (pathname.startsWith("/api/")) {
                    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
                }
                return NextResponse.redirect(new URL("/accedi", req.url))
            }
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl

                // Public routes - always allow
                const publicPaths = [
                    "/",
                    "/accedi",
                    "/registrati",
                    "/reset-password",
                    "/forgot-password",
                    "/abbonamento",
                    "/missione",
                    "/portafogli",
                    "/strumenti",
                    "/blog",
                    "/contatti",
                    "/chi-siamo",
                    "/disclaimer",
                    "/privacy-policy",
                    "/cookie-policy",
                    "/termini-di-servizio",
                ]

                // Check if it's a public path or starts with public prefixes
                const isPublic = publicPaths.some(path =>
                    pathname === path ||
                    pathname.startsWith("/blog/") ||
                    pathname.startsWith("/api/auth/") ||
                    pathname.startsWith("/api/register") ||
                    pathname.startsWith("/api/contact") ||
                    pathname.startsWith("/api/reviews") ||
                    pathname.startsWith("/api/newsletter") ||
                    pathname.startsWith("/api/comments") ||
                    pathname.startsWith("/api/stripe/webhook")
                )

                if (isPublic) return true

                // Protected routes - require authentication
                return !!token
            }
        }
    }
)

export const config = {
    matcher: [
        // Match all routes except static files and Next.js internals
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
    ]
}
