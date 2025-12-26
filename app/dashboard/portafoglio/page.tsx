import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function PortfoliosPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/accedi")
    }

    const portfolios = await prisma.portfolio.findMany({
        where: { userId: session.user.id },
        include: { stocks: true },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">I miei Portafogli</h1>
                <Link
                    href="/dashboard/portafoglio/new"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} />
                    Nuovo Portafoglio
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolios.map(portfolio => (
                    <Link key={portfolio.id} href={`/dashboard/portafoglio/${portfolio.id}`}>
                        <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl hover:border-blue-500 transition-colors cursor-pointer h-full flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">{portfolio.name}</h3>
                                <div className="space-y-1">
                                    {portfolio.stocks.slice(0, 3).map(stock => (
                                        <div key={stock.id} className="flex justify-between text-sm text-gray-400">
                                            <span>{stock.symbol}</span>
                                            <span>{stock.quantity} azioni</span>
                                        </div>
                                    ))}
                                    {portfolio.stocks.length > 3 && (
                                        <div className="text-xs text-gray-500 pt-1">
                                            + {portfolio.stocks.length - 3} altri
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-gray-800 text-xs text-gray-500 flex justify-between">
                                <span>Creato il {new Date(portfolio.createdAt).toLocaleDateString()}</span>
                                <span>{portfolio.stocks.length} Asset</span>
                            </div>
                        </div>
                    </Link>
                ))}

                {portfolios.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        Non hai ancora portafogli. Creane uno per iniziare.
                    </div>
                )}
            </div>
        </div>
    )
}
