import Link from "next/link"
import Image from "next/image"
import { ChevronRight, TrendingUp, BarChart3, PieChart, Activity } from "lucide-react"
import { MarketingHeader } from "@/components/marketing/header"

export default function StrumentiPage() {

    const tools = [
        {
            title: "Azioni Value e News IA",
            description: "Analisi delle Azioni approfondita secondo i principi del Value Investing interpretati da DIRAMCO e scopri le ultime notizie tramite l'Intelligenza Artificiale.",
            image: "/tool-stock-analysis.png",
            icon: TrendingUp,
            align: "right"
        },
        {
            title: "Analisi Avanzata ETF",
            description: "Esplora la composizione e i dettagli dei fondi ETF. Visualizza i Top 10 Holdings, l'allocazione settoriale e l'esposizione geografica.",
            image: "/tool-etf.png",
            icon: PieChart,
            align: "left"
        },
        {
            title: "Grafici Storici Finanziari",
            description: "Accedi a grafici storici fino a 30 anni per analizzare l'andamento di Ricavi, EPS, e altre metriche fondamentali nel lungo periodo.",
            image: "/tool-charts.png",
            icon: BarChart3,
            align: "right"
        },
        {
            title: "Indicatori Fondamentali",
            description: "Tutti gli indicatori principali a portata di mano: P/E, P/B, ROE, ROIC e margini di redditività confrontati con il settore.",
            image: "/tool-indicators.png",
            icon: Activity,
            align: "left"
        }
    ]

    return (
        <div className="relative min-h-screen bg-gray-950 text-white overflow-hidden">
            {/* Navigation */}
            <MarketingHeader />

            {/* Hero Content */}
            <section className="relative z-10 pt-16 pb-20 px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        Strumenti di
                        <span className="bg-gradient-to-r from-sky-400 to-emerald-600 bg-clip-text text-transparent"> Analisi</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Una suite completa di strumenti professionali per analizzare azioni, ETF e mercati globali.
                        Prendi decisioni informate basate su dati e intelligenza artificiale.
                    </p>
                </div>
            </section>

            {/* Tools Sections */}
            <section className="relative z-10 pb-24 px-8">
                <div className="max-w-7xl mx-auto space-y-24">
                    {tools.map((tool, index) => (
                        <div key={index} className={`flex flex-col ${tool.align === "left" ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-12 md:gap-20`}>
                            {/* Text Content */}
                            <div className="flex-1 space-y-6">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400">
                                    <tool.icon size={24} />
                                </div>
                                <h2 className="text-3xl font-bold">{tool.title}</h2>
                                <p className="text-gray-400 text-lg leading-relaxed">
                                    {tool.description}
                                </p>
                                <ul className="space-y-3 pt-4">
                                    <li className="flex items-center gap-2 text-gray-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div>
                                        Dati aggiornati in tempo reale
                                    </li>
                                    <li className="flex items-center gap-2 text-gray-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        Analisi IA integrata
                                    </li>
                                </ul>
                            </div>

                            {/* Image Preview */}
                            <div className="flex-1 md:flex-[1.5] w-full">
                                <div className="relative group rounded-2xl overflow-hidden border border-gray-800 bg-gray-900/50 shadow-2xl">
                                    <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-emerald-500/10 group-hover:opacity-0 transition-opacity z-10"></div>
                                    <Image
                                        src={tool.image}
                                        alt={tool.title}
                                        width={1200}
                                        height={800}
                                        className="w-full h-auto transform transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 pb-24 px-8">
                <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-sky-600/20 to-emerald-600/20 border border-sky-500/20 rounded-3xl p-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Inizia ad analizzare come un professionista
                    </h2>
                    <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                        Accedi a tutti questi strumenti e molto altro con un account DIRAMCO.
                    </p>
                    <Link
                        href="/registrati"
                        className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-sky-500/25"
                    >
                        Provali Gratuitamente
                        <ChevronRight size={20} />
                    </Link>
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
