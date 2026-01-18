import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

// Helper to wait between emails to avoid rate limits
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        // Security Check: Only Admin can send newsletters
        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { subject, content } = await req.json()

        if (!subject || !content) {
            return new NextResponse("Subject and content are required", { status: 400 })
        }

        // Get all subscribed users
        const users = await prisma.user.findMany({
            where: {
                newsletterSubscribed: true
            },
            select: {
                email: true
            }
        })

        console.log(`\n========== NEWSLETTER SEND START ==========`)
        console.log(`Subject: ${subject}`)
        console.log(`Total subscribers: ${users.length}`)
        console.log(`Subscribers: ${users.map(u => u.email).join(', ')}`)

        if (users.length === 0) {
            return NextResponse.json({ count: 0, message: "No subscribers found" })
        }

        const results: { email: string; success: boolean; error?: string }[] = []

        // Send emails sequentially with delay to avoid rate limits
        for (const user of users) {
            try {
                console.log(`\nSending to: ${user.email}...`)

                const result = await resend.emails.send({
                    from: 'DIRAMCO <newsletter@diramco.com>',
                    to: user.email,
                    subject: subject,
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee; margin-bottom: 20px; }
                                .logo { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; }
                                .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #666; }
                                .social-links { margin-top: 10px; }
                                .social-links a { color: #333; text-decoration: none; margin: 0 10px; font-weight: bold; }
                                .unsubscribe { margin-top: 20px; color: #999; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <a href="https://diramco.com" target="_blank" style="text-decoration: none;">
                                        <img src="${process.env.NEXT_PUBLIC_APP_URL}/diramco-logo.png" alt="DIRAMCO" class="logo" />
                                    </a>
                                    <h2>DIRAMCO</h2>
                                </div>
                                
                                <div class="content">
                                    ${content}
                                </div>

                                <div class="footer">
                                    <div class="social-links">
                                        <a href="https://www.youtube.com/@diramcoportfolio/about">YouTube</a>
                                        <a href="https://www.instagram.com/diramco/">Instagram</a>
                                        <a href="https://www.whatsapp.com/channel/0029VaDfDAgJENxwmMx7la0b">WhatsApp</a>
                                    </div>
                                    <p>&copy; ${new Date().getFullYear()} DIRAMCO. Tutti i diritti riservati.</p>
                                    <p class="unsubscribe">Non vuoi più ricevere queste email? <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/impostazioni">Gestisci preferenze</a></p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                })

                console.log(`✓ SUCCESS: ${user.email}`, result)
                results.push({ email: user.email, success: true })

            } catch (error: any) {
                const errorMessage = error?.message || error?.toString() || 'Unknown error'
                console.error(`✗ FAILED: ${user.email}:`, errorMessage)
                results.push({ email: user.email, success: false, error: errorMessage })
            }

            // Wait 200ms between emails to avoid rate limits
            await sleep(200)
        }

        const successful = results.filter(r => r.success).length
        const failed = results.filter(r => !r.success).length
        const failedEmails = results.filter(r => !r.success).map(r => `${r.email}: ${r.error}`)

        console.log(`\n========== NEWSLETTER SEND COMPLETE ==========`)
        console.log(`Successful: ${successful}/${users.length}`)
        console.log(`Failed: ${failed}/${users.length}`)
        if (failedEmails.length > 0) {
            console.log(`Failed emails:`, failedEmails)
        }

        return NextResponse.json({
            count: users.length,
            successful,
            failed,
            failedEmails: failedEmails.length > 0 ? failedEmails : undefined,
            message: failed > 0 ? `Inviate ${successful} email, ${failed} fallite` : `Inviate ${successful} email con successo`
        })

    } catch (error) {
        console.error("Newsletter Send Error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
