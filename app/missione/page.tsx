import Link from "next/link"
import Image from "next/image"
import { Globe, ArrowLeft } from "lucide-react"

export default function MissionPage() {
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
                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Torna alla Home
                    </Link>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-8 py-16">
                <h1 className="text-5xl font-bold mb-12 bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
                    La Nostra Missione
                </h1>

                <div className="space-y-8 text-lg text-gray-300 leading-relaxed text-justify">
                    <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl space-y-6">
                        <p>
                            La nostra missione è aiutare le persone a prendere decisioni finanziarie consapevoli e ben informate.
                            Attraverso un approccio basato sull’analisi fondamentale e una visione di lungo termine, vogliamo offrire
                            strumenti e strategie per costruire e gestire portafogli di investimento solidi e diversificati.
                        </p>
                        <p>
                            Crediamo che ogni investitore, indipendentemente dal suo livello di esperienza, meriti accesso a informazioni
                            chiare, affidabili e utili per navigare il mondo complesso dei mercati finanziari. Ci impegniamo a fornire
                            contenuti educativi, analisi di qualità e risorse pratiche per aiutarti a raggiungere i tuoi obiettivi
                            finanziari con sicurezza e consapevolezza.
                        </p>
                        <div className="border-t border-gray-800 pt-6 mt-6">
                            <p className="font-medium text-blue-400 mb-4">
                                DIRAMCO è anche un Portafoglio diversificato che gestisce diversi Asset come: Azioni, Obbligazioni su diversi
                                mercati e in diverse valute, ETF in indici azionari, materie prime e criptovalute e Conti Deposito.
                            </p>
                            <p className="italic text-purple-400">
                                L’origine del nome è: <span className="font-bold">D</span>reaming <span className="font-bold">I</span>nvesting <span className="font-bold">R</span>isk <span className="font-bold">A</span>sset <span className="font-bold">M</span>anagement <span className="font-bold">Co</span>mpany.
                            </p>
                            <p className="text-sm mt-4 text-gray-500">
                                Per ora non è una società ma un portafoglio personale che applica i principi di grandi investitori. Ecco perché Dream!
                            </p>
                        </div>
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
