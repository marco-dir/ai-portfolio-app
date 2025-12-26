import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getForexRate } from "@/lib/fmp"
import { redirect } from "next/navigation"
import PortfolioView from "@/components/portfolio-view"

export default async function PortfolioDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session) {
        redirect("/accedi")
    }

    const portfolio = await prisma.portfolio.findUnique({
        where: {
            id: id,
            userId: session.user.id
        },
        include: {
            stocks: true
        }
    })

    if (!portfolio) {
        redirect("/dashboard/portafoglio")
    }

    const forexRate = await getForexRate()

    return <PortfolioView initialPortfolio={portfolio} forexRate={forexRate} />
}
