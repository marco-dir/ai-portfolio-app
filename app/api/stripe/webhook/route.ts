import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(req: Request) {
    const body = await req.text()
    const headerPayload = await headers()
    const signature = headerPayload.get('Stripe-Signature') as string

    console.log('[WEBHOOK] Received stripe webhook request')

    let event: Stripe.Event

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            console.error('[WEBHOOK] Missing STRIPE_WEBHOOK_SECRET')
            return new NextResponse('Missing stripe webhook secret', { status: 500 })
        }

        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error: any) {
        console.error(`[WEBHOOK] Error verifying signature: ${error.message}`)
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
    }

    console.log(`[WEBHOOK] Processing event: ${event.type}`)

    const session = event.data.object as Stripe.Checkout.Session

    try {
        if (event.type === 'checkout.session.completed') {
            const subscription = await stripe.subscriptions.retrieve(
                session.subscription as string
            )

            if (!session?.metadata?.userId) {
                console.error('[WEBHOOK] Missing userId in metadata')
                return new NextResponse('User id is required', { status: 400 })
            }

            console.log(`[WEBHOOK] Updating user ${session.metadata.userId} with subscription ${subscription.id}`)

            await prisma.user.update({
                where: {
                    id: session.metadata.userId,
                },
                data: {
                    stripeSubscriptionId: subscription.id,
                    stripeCustomerId: subscription.customer as string,
                    subscriptionStatus: 'active',
                    trialEndsAt: null,
                },
            })
            console.log('[WEBHOOK] User updated successfully')
        }

        if (event.type === 'invoice.payment_succeeded') {
            const subscription = await stripe.subscriptions.retrieve(
                session.subscription as string
            )

            console.log(`[WEBHOOK] Handling invoice payment success for sub ${subscription.id}`)

            await prisma.user.update({
                where: {
                    stripeSubscriptionId: subscription.id,
                },
                data: {
                    subscriptionStatus: 'active',
                },
            })
            console.log('[WEBHOOK] Subscription status activated')
        }

        if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
            const subscription = event.data.object as Stripe.Subscription;
            console.log(`[WEBHOOK] Handling subscription update/delete for sub ${subscription.id}, status: ${subscription.status}`)

            await prisma.user.update({
                where: { stripeSubscriptionId: subscription.id },
                data: { subscriptionStatus: subscription.status }
            });
            console.log('[WEBHOOK] Subscription status updated')
        }
    } catch (error: any) {
        console.error('[WEBHOOK] DB Update Error:', error)
        return new NextResponse(`Database Error: ${error.message}`, { status: 500 })
    }

    return new NextResponse(null, { status: 200 })
}
