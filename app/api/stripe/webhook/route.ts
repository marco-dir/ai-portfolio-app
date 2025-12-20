import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(req: Request) {
    const body = await req.text()
    const headerPayload = await headers()
    const signature = headerPayload.get('Stripe-Signature') as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
    }

    const session = event.data.object as Stripe.Checkout.Session

    if (event.type === 'checkout.session.completed') {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        )

        if (!session?.metadata?.userId) {
            return new NextResponse('User id is required', { status: 400 })
        }

        await prisma.user.update({
            where: {
                id: session.metadata.userId,
            },
            data: {
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer as string,
                subscriptionStatus: 'active', // Plan is active
                trialEndsAt: null, // Trial is over/consumed by sub
            },
        })
    }

    if (event.type === 'invoice.payment_succeeded') {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        )

        // Ensure status is active
        await prisma.user.update({
            where: {
                stripeSubscriptionId: subscription.id,
            },
            data: {
                subscriptionStatus: 'active',
            },
        })
    }

    // Handle subscription cancellation or expiration
    if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
        const subscription = event.data.object as Stripe.Subscription;

        // If status is canceled or past_due
        if (subscription.status === 'canceled' || subscription.status === 'past_due' || subscription.status === 'unpaid') {
            await prisma.user.update({
                where: { stripeSubscriptionId: subscription.id },
                data: { subscriptionStatus: subscription.status }
            });
        }

        // If it becomes active again (e.g. payment retried success)
        if (subscription.status === 'active') {
            await prisma.user.update({
                where: { stripeSubscriptionId: subscription.id },
                data: { subscriptionStatus: 'active' }
            });
        }
    }

    return new NextResponse(null, { status: 200 })
}
