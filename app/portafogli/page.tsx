import Link from "next/link"
import Image from "next/image"
import { ChevronRight, ArrowLeft } from "lucide-react"
import PortfoliosChart from "@/components/public/portfolios-chart"
import DiramcoEquityChart from "@/components/public/diramco-equity-chart"

import { fetchEquityData } from "@/lib/data-fetcher"

export default async function PortfoliosPage() {
    const equityData = await fetchEquityData()
    return (
        <div className="relative min-h-screen bg-gray-950 text-white overflow-hidden">

            {/* Navigation */}
            <nav className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-12">
                    <Link href="/" className="flex items-center gap-3">
                        <Image src="/diramco-logo.png" alt="DIRAMCO Logo" width={40} height={40} className="w-10 h-10 rounded-full" />
                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                            DIRAMCO
                        </div>
                    </Link>
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/chi-siamo" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Chi Siamo</Link>
                        <Link href="/missione" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Missione</Link>
                        <Link href="/portafogli" className="text-white text-sm font-medium">Portafogli</Link>
                        <Link href="/abbonamento" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Abbonamento</Link>
                        <Link href="/blog" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Blog</Link>
                        <Link href="/contatti" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Contatti</Link>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/disclaimer" className="px-6 py-2 text-gray-300 hover:text-white transition-colors">Disclaimer</Link>
                    <Link href="/login" className="px-6 py-2 text-gray-300 hover:text-white transition-colors">Accedi</Link>
                    <Link href="/register" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-full font-medium transition-all hover:scale-105">Inizia Gratis</Link>
                </div>
            </nav>

            {/* Hero Content */}
            <section className="relative z-10 pt-16 pb-24 px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6">
                            Performance
                            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"> Portafogli</span>
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
                            href="/register"
                            className="inline-flex items-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-500 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25"
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
                    <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">DIRAMCO</div>
                    <div className="text-gray-500 text-sm">Copyright © {new Date().getFullYear()} DIRAMCO</div>
                </div>
            </footer>
        </div>
    )
}
