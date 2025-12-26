import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

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

        if (users.length === 0) {
            return NextResponse.json({ count: 0, message: "No subscribers found" })
        }

        // Send email to all subscribers (batches of 100 max recommended for Resend, but for now simple loop)
        // For production with many users, use Resend Batch API or Queue system
        const results = await Promise.allSettled(
            users.map(async (user) => {
                try {
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
                                        <img src="${process.env.NEXT_PUBLIC_APP_URL}/diramco-logo.png" alt="DIRAMCO" class="logo" />
                                        <h2>DIRAMCO Newsletter</h2>
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
                    console.log(`✓ Email sent to ${user.email}:`, result)
                    return { email: user.email, success: true, result }
                } catch (error) {
                    console.error(`✗ Failed to send to ${user.email}:`, error)
                    return { email: user.email, success: false, error }
                }
            })
        )

        // Count successes and failures
        const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any)?.success).length
        const failed = results.filter(r => r.status === 'rejected' || !(r.value as any)?.success).length

        console.log(`Newsletter sent: ${successful} successful, ${failed} failed out of ${users.length} subscribers`)

        return NextResponse.json({
            count: users.length,
            successful,
            failed,
            message: failed > 0 ? `Sent with ${failed} failures` : "Sent successfully"
        })

    } catch (error) {
        console.error("Newsletter Send Error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
