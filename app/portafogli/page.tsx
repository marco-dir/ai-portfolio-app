import Link from "next/link"
import Image from "next/image"
import { ChevronRight, ArrowLeft } from "lucide-react"
import PortfoliosChart from "@/components/public/portfolios-chart"
import DiramcoEquityChart from "@/components/public/diramco-equity-chart"
import { MarketingHeader } from "@/components/marketing/header"

import { fetchEquityData } from "@/lib/data-fetcher"

export default async function PortfoliosPage() {
    const equityData = await fetchEquityData()
    return (
        <div className="relative min-h-screen bg-gray-950 text-white overflow-hidden">

            {/* Navigation */}
            <MarketingHeader />

            {/* Hero Content */}
            <section className="relative z-10 pt-16 pb-24 px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6">
                            Performance
                            <span className="bg-gradient-to-r from-sky-400 to-emerald-600 bg-clip-text text-transparent"> Portafogli</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            Visualizza lo storico dei rendimenti dei nostri portafogli modello.
                            Trasparenza e risultati misurabili sono alla base della nostra filosofia.
                        </p>
                    </div>

                    {/* Chart Section */}
                    <div className="max-w-5xl mx-auto space-y-12">
                        <PortfoliosChart />
                        <DiramcoEquityChart data={equityData} />
                    </div>

                    <div className="mt-16 text-center">
                        <Link
                            href="/registrati"
                            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-sky-500/25"
                        >
                            Inizia a Investire
                            <ChevronRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-gray-800 py-12 px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-xl font-bold bg-gradient-to-r from-sky-400 to-emerald-600 bg-clip-text text-transparent">DIRAMCO</div>
                    <div className="text-gray-500 text-sm">Copyright © {new Date().getFullYear()} DIRAMCO</div>
                </div>
            </footer>
        </div>
    )
}
