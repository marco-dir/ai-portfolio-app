import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

import { sendSubscriptionSuccessEmail, sendSubscriptionCancelledEmail } from '@/lib/email'

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

            const user = await prisma.user.update({
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

            // Send success email for new subscription
            if (user.email) {
                await sendSubscriptionSuccessEmail(user.email)
                console.log('[WEBHOOK] Sent success email to', user.email)
            }
        }

        if (event.type === 'invoice.payment_succeeded') {
            const invoice = event.data.object as Stripe.Invoice
            const subscription = (invoice as any).subscription as string | Stripe.Subscription | null
            const subscriptionId = typeof subscription === 'string'
                ? subscription
                : subscription?.id

            if (subscriptionId) {
                console.log(`[WEBHOOK] Handling invoice payment success for sub ${subscriptionId}`)

                const user = await prisma.user.update({
                    where: {
                        stripeSubscriptionId: subscriptionId,
                    },
                    data: {
                        subscriptionStatus: 'active',
                    },
                })
                console.log('[WEBHOOK] Subscription status activated')

                // Send success email only for renewals (updates) to avoid duplicate email with checkout.session.completed
                if (invoice.billing_reason === 'subscription_cycle' && user.email) {
                    await sendSubscriptionSuccessEmail(user.email)
                    console.log('[WEBHOOK] Sent renewal success email to', user.email)
                }
            }
        }

        if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object as Stripe.Subscription;
            console.log(`[WEBHOOK] Handling subscription delete for sub ${subscription.id}`)

            const user = await prisma.user.update({
                where: { stripeSubscriptionId: subscription.id },
                data: { subscriptionStatus: subscription.status }
            });
            console.log('[WEBHOOK] Subscription status updated to deleted')

            if (user.email) {
                await sendSubscriptionCancelledEmail(user.email)
                console.log('[WEBHOOK] Sent cancellation email to', user.email)
            }
        }

        if (event.type === 'customer.subscription.updated') {
            const subscription = event.data.object as Stripe.Subscription;
            // Just update status, no email needed usually unless status changed to active/past_due
            await prisma.user.update({
                where: { stripeSubscriptionId: subscription.id },
                data: { subscriptionStatus: subscription.status }
            });
        }

    } catch (error: any) {
        console.error('[WEBHOOK] DB Update Error:', error)
        return new NextResponse(`Database Error: ${error.message}`, { status: 500 })
    }

    return new NextResponse(null, { status: 200 })
}
