import Link from "next/link"
import Image from "next/image"
import { Globe, ArrowLeft } from "lucide-react"
import { MarketingHeader } from "@/components/marketing/header"

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Navigation */}
            <MarketingHeader />

            <main className="max-w-4xl mx-auto px-8 py-16">
                <h1 className="text-5xl font-bold mb-12 bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
                    Chi Siamo
                </h1>

                <div className="space-y-8 text-lg text-gray-300 leading-relaxed text-justify">
                    <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl">
                        <p className="mb-6">
                            Benvenuti nel nostro spazio dedicato alla finanza personale, alla gestione del portafoglio e agli investimenti.
                            Sono un ingegnere con oltre 20 anni di passione per il mondo della finanza. Durante la mia carriera professionale,
                            ho applicato il rigore analitico e il problem-solving tipico dell’ingegneria per esplorare e approfondire
                            le dinamiche dei mercati finanziari.
                        </p>
                        <p className="mb-6">
                            Il nostro obiettivo è fornire strategie di investimento basate su analisi fondamentali solide, offrendo una guida
                            chiara e pratica per chi vuole gestire in modo efficace il proprio portafoglio. Che tu sia un investitore esperto
                            o un principiante, qui troverai strumenti e consigli per navigare nel complesso mondo degli investimenti.
                        </p>
                        <p className="font-medium text-blue-400 text-xl">
                            La nostra filosofia è semplice: un approccio informato e metodico può fare la differenza nel lungo termine.
                            Seguici per aggiornamenti costanti, analisi approfondite e idee pratiche per ottimizzare i tuoi investimenti.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-800 py-12 px-8 mt-12">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                        DIRAMCO
                    </div>
                    <div className="flex items-center gap-6 text-gray-500 text-sm">
                        <span>© 2024 DIRAMCO</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Globe size={14} />
                            Made in Italy
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
