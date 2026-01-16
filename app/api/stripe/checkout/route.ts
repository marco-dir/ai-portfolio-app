import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next' // Or your auth lib
import { authOptions } from '@/lib/auth' // Adjust path if needed
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        // const startPayment = await req.json() // process body if needed

        // Fetch fresh user from DB to get stripeCustomerId
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        let customerId = user.stripeCustomerId

        // If no customer ID, create one (Stripe Checkout can creates it too, but better here for tracking)
        // Actually, Checkout can accept `customer_email` OR `customer`.
        // If we have an ID, use it. If not, use email and let Stripe create/link.
        // Ideally, creating explicitly is safer.

        if (!customerId) {
            const customerData: any = {
                email: user.email,
                name: user.name || undefined,
                metadata: {
                    userId: user.id
                }
            };
            const customer = await stripe.customers.create(customerData);
            customerId = customer.id;

            // Save to DB
            await prisma.user.update({
                where: { id: user.id },
                data: { stripeCustomerId: customerId }
            });
        }

        const priceId = process.env.STRIPE_PRICE_ID
        if (!priceId) {
            return NextResponse.json({ message: 'Stripe Price ID missing' }, { status: 500 })
        }

        const checkoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            billing_address_collection: 'required',
            allow_promotion_codes: true,
            // Prezzo IVA inclusa - non mostriamo tasse separate
            // payment_method_types non specificato = Stripe abilita automaticamente
            // tutti i metodi disponibili: Card, Apple Pay, Google Pay, Link, etc.
            customer_update: {
                address: 'auto',
                name: 'auto',
            },
            custom_fields: [
                {
                    key: 'codice_fiscale',
                    label: {
                        type: 'custom',
                        custom: 'Codice Fiscale',
                    },
                    type: 'text',
                    optional: false,
                },
            ],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/abbonamento?payment=canceled`,
            metadata: {
                userId: user.id,
            },
        })

        return NextResponse.json({ url: checkoutSession.url })
    } catch (error) {
        console.error('[STRIPE_CHECKOUT]', error)
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 })
    }
}
