
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'
import fs from 'fs'
import path from 'path'

// Load .env manually
const envPath = path.join(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8')
    envConfig.split('\n').forEach(line => {
        const [key, ...values] = line.split('=')
        if (key && values.length > 0) {
            process.env[key.trim()] = values.join('=').trim().replace(/^"|"$/g, '')
        }
    })
}

const prisma = new PrismaClient()

if (!process.env.STRIPE_SECRET_KEY) {
    console.error('Missing STRIPE_SECRET_KEY')
    process.exit(1)
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover',
    typescript: true,
})

async function main() {
    console.log('Fetching users with Stripe Subscriptions...')

    // Find all users who have a stripe subscription ID
    const users = await prisma.user.findMany({
        where: {
            stripeSubscriptionId: {
                not: null
            }
        }
    })

    console.log(`Found ${users.length} users with subscriptions.`)

    for (const user of users) {
        if (!user.stripeSubscriptionId) continue

        try {
            console.log(`Checking subscription for ${user.email} (${user.stripeSubscriptionId})...`)

            const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)

            // Calculate fields
            const subscriptionEndsAt = new Date((subscription as any).current_period_end * 1000)
            const trialEndsAt = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
            const status = subscription.status

            // Update user
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    subscriptionStatus: status,
                    subscriptionEndsAt: subscriptionEndsAt,
                    trialEndsAt: trialEndsAt
                }
            })

            console.log(`Updated ${user.email}: Status=${status}, Ends=${subscriptionEndsAt.toISOString()}`)
        } catch (error: any) {
            console.error(`Failed to update user ${user.email}: ${error.message}`)
        }
    }

    console.log('Sync complete.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
