import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(req: Request) {
    try {
        // Hardcoded priceId or create a temporary one inline? 
        // Better to use the env var if available, or just a sample price data.
        // We'll try to use the env var first, but fallback to a dummy if needed (though that might fail if price doesn't exist).
        // Safest is to create a one-time price data inline to avoid "Price not found" errors if env is wrong for some reason, 
        // BUT subscription mode requires a Price ID usually.
        // Let's rely on the existing environment variable as the main route does.
        const priceId = process.env.STRIPE_PRICE_ID

        if (!priceId) {
            return NextResponse.json({ message: 'Stripe Price ID missing' }, { status: 500 })
        }

        const checkoutSession = await stripe.checkout.sessions.create({
            mode: 'subscription',
            // Minimal config: No automatic_tax, no billing address requirement
            // We use 'payment_method_types' to force 'card' (which includes Apple Pay usually)
            // to see if "Dynamic Payment Methods" (dashboard) is the issue.
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=test_success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/abbonamento?payment=test_canceled`,
        })

        // Redirect user to the checkout immediately
        if (checkoutSession.url) {
            return NextResponse.redirect(checkoutSession.url)
        } else {
            return NextResponse.json({ message: 'No URL created' }, { status: 500 })
        }
    } catch (error: any) {
        console.error('[STRIPE_TEST_CHECKOUT]', error)
        return NextResponse.json({ message: 'Internal Error', error: error.message }, { status: 500 })
    }
}
