import Link from "next/link"
import { ArrowLeft, Cookie, Shield, Lock, Eye } from "lucide-react"

export default function CookiePolicyPage() {
    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Navigation */}
            <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
                <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                    DIRAMCO
                </Link>
                <Link
                    href="/"
                    className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    Torna alla Home
                </Link>
            </nav>

            <main className="max-w-4xl mx-auto px-8 py-16">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                        <Cookie className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
                        Cookie Policy
                    </h1>
                </div>

                <div className="space-y-8 text-gray-300 leading-relaxed">
                    <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl space-y-8">

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-400" />
                                Cosa sono i cookie?
                            </h2>
                            <p className="mb-4">
                                I cookie sono piccoli file di testo che i siti visitati dagli utenti inviano ai loro terminali,
                                dove vengono memorizzati per essere ritrasmessi agli stessi siti in occasione di visite successive.
                                I cookie sono utilizzati per diverse finalità, hanno caratteristiche diverse e possono essere utilizzati
                                sia dal titolare del sito che si sta visitando, sia da terze parti.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-green-400" />
                                Tipologie di cookie utilizzati
                            </h2>

                            <div className="space-y-6">
                                <div className="bg-gray-800/30 p-4 rounded-lg">
                                    <h3 className="text-lg font-bold text-white mb-2">Cookie Tecnici ed Essenziali</h3>
                                    <p>
                                        Questi cookie sono relativi ad attività strettamente necessarie al funzionamento del sito e all'erogazione del servizio.
                                        Non richiedono il consenso dell'utente. Ad esempio, manteniamo la tua sessione di login attiva e salviamo le tue preferenze sulla privacy.
                                    </p>
                                </div>

                                <div className="bg-gray-800/30 p-4 rounded-lg">
                                    <h3 className="text-lg font-bold text-white mb-2">Cookie di Analisi</h3>
                                    <p>
                                        Utilizzati per raccogliere informazioni, in forma aggregata, sul numero degli utenti e su come questi visitano il sito stesso.
                                        Questi cookie ci aiutano a migliorare le prestazioni del nostro sito web.
                                    </p>
                                </div>

                                <div className="bg-gray-800/30 p-4 rounded-lg">
                                    <h3 className="text-lg font-bold text-white mb-2">Cookie di Profilazione</h3>
                                    <p>
                                        Utilizzati per tracciare la navigazione dell'utente in rete e creare profili sui suoi gusti, abitudini, scelte, ecc.
                                        Con questi cookie possono essere trasmessi al terminale dell'utente messaggi pubblicitari in linea con le preferenze
                                        già manifestate dallo stesso utente nella navigazione online.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                <Eye className="w-5 h-5 text-purple-400" />
                                Gestione delle preferenze
                            </h2>
                            <p className="mb-4">
                                Al tuo primo accesso, ti abbiamo mostrato un banner per la gestione dei cookie.
                                Puoi modificare le tue preferenze in qualsiasi momento attraverso le impostazioni del tuo browser.
                                La maggior parte dei browser consente di rifiutare o accettare i cookie, oppure di accettarne solo alcuni.
                            </p>
                        </section>

                        <div className="border-t border-gray-800 pt-8 mt-8">
                            <h3 className="text-lg font-bold text-white mb-4">Titolare del Trattamento</h3>
                            <p>
                                DIRAMCO<br />
                                Email: info@diramco.com
                            </p>
                            <p className="mt-4 text-sm text-gray-500">
                                Ultimo aggiornamento: Dicembre 2024
                            </p>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    )
}
