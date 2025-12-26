import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user || !user.stripeCustomerId) {
            return new NextResponse('User or Stripe Customer not found', { status: 404 })
        }

        const billingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/impostazioni`

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: billingUrl,
        })

        return NextResponse.json({ url: portalSession.url })
    } catch (error) {
        console.error('[STRIPE_PORTAL]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
