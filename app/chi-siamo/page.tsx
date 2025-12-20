import Link from "next/link"
import Image from "next/image"
import { Globe, ArrowLeft } from "lucide-react"

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Navigation */}
            <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <Image src="/diramco-logo.png" alt="DIRAMCO Logo" width={32} height={32} className="w-8 h-8 rounded-full" />
                    <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                        DIRAMCO
                    </Link>
                </div>
                <div className="hidden md:flex items-center gap-6">
                    <Link href="/chi-siamo" className="text-white text-sm font-medium">Chi Siamo</Link>
                    <Link href="/missione" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Missione</Link>
                    <Link href="/portafogli" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Portafogli</Link>
                    <Link href="/abbonamento" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Abbonamento</Link>
                    <Link href="/blog" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Blog</Link>
                    <Link href="/contatti" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Contatti</Link>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/disclaimer" className="px-6 py-2 text-gray-300 hover:text-white transition-colors">Disclaimer</Link>
                    <Link href="/login" className="px-6 py-2 text-gray-300 hover:text-white transition-colors">Accedi</Link>
                    <Link href="/register" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-full font-medium transition-all hover:scale-105">Inizia Gratis</Link>
                </div>
            </nav>

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
