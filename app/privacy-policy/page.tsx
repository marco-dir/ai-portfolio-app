import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Shield, User, Database, Lock, Globe, Mail, Clock } from "lucide-react"

export const metadata = {
    title: "Privacy Policy - DIRAMCO",
    description: "Informativa sulla privacy e sul trattamento dei dati personali di DIRAMCO"
}

export default function PrivacyPolicyPage() {
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
                        <Shield className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
                        Privacy Policy
                    </h1>
                </div>

                <div className="space-y-8 text-gray-300 leading-relaxed">
                    <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl space-y-8">

                        {/* Titolare */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-400" />
                                Titolare del Trattamento
                            </h2>
                            <div className="bg-gray-800/30 p-4 rounded-lg">
                                <p className="font-medium text-white">DIRAMCO</p>
                                <p>Email: <a href="mailto:info@diramco.com" className="text-blue-400 hover:underline">info@diramco.com</a></p>
                            </div>
                        </section>

                        {/* Dati raccolti */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                <Database className="w-5 h-5 text-green-400" />
                                Tipologie di Dati Raccolti
                            </h2>
                            <p className="mb-4">
                                Fra i Dati Personali raccolti da questa Applicazione, in modo autonomo o tramite terze parti, ci sono:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Dati di registrazione:</strong> nome, indirizzo email, password (criptata)</li>
                                <li><strong>Dati di navigazione:</strong> Cookie, dati di utilizzo, indirizzo IP</li>
                                <li><strong>Dati di pagamento:</strong> gestiti tramite Stripe (non memorizziamo dati delle carte)</li>
                                <li><strong>Dati di portafoglio:</strong> informazioni sugli investimenti inseriti dall'utente</li>
                            </ul>
                            <p className="mt-4 text-sm text-gray-500">
                                I Dati Personali possono essere liberamente forniti dall'Utente o, nel caso di Dati di Utilizzo, raccolti automaticamente durante l'uso di questa Applicazione.
                            </p>
                        </section>

                        {/* Finalità */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-purple-400" />
                                Finalità del Trattamento
                            </h2>
                            <p className="mb-4">I Dati dell'Utente sono raccolti per le seguenti finalità:</p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-gray-800/30 p-4 rounded-lg">
                                    <h3 className="font-bold text-white mb-2">Erogazione del Servizio</h3>
                                    <p className="text-sm">Gestione account, accesso alle funzionalità, salvataggio preferenze</p>
                                </div>
                                <div className="bg-gray-800/30 p-4 rounded-lg">
                                    <h3 className="font-bold text-white mb-2">Comunicazioni</h3>
                                    <p className="text-sm">Invio newsletter (con consenso), notifiche di servizio, supporto</p>
                                </div>
                                <div className="bg-gray-800/30 p-4 rounded-lg">
                                    <h3 className="font-bold text-white mb-2">Gestione Pagamenti</h3>
                                    <p className="text-sm">Elaborazione abbonamenti tramite Stripe</p>
                                </div>
                                <div className="bg-gray-800/30 p-4 rounded-lg">
                                    <h3 className="font-bold text-white mb-2">Miglioramento Servizio</h3>
                                    <p className="text-sm">Analisi statistiche anonime per migliorare l'esperienza</p>
                                </div>
                            </div>
                        </section>

                        {/* Base giuridica */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">Base Giuridica del Trattamento</h2>
                            <p>Il Titolare tratta Dati Personali relativi all'Utente in presenza di una delle seguenti condizioni:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>L'Utente ha prestato il consenso per una o più finalità specifiche</li>
                                <li>Il trattamento è necessario all'esecuzione di un contratto con l'Utente</li>
                                <li>Il trattamento è necessario per adempiere un obbligo legale</li>
                                <li>Il trattamento è necessario per il perseguimento del legittimo interesse del Titolare</li>
                            </ul>
                        </section>

                        {/* Conservazione */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-orange-400" />
                                Periodo di Conservazione
                            </h2>
                            <p>
                                I Dati sono trattati e conservati per il tempo richiesto dalle finalità per le quali sono stati raccolti.
                                I dati dell'account sono conservati fino alla richiesta di cancellazione da parte dell'utente.
                                In caso di cancellazione dell'account, i dati vengono eliminati entro 30 giorni, salvo obblighi di legge.
                            </p>
                        </section>

                        {/* Diritti */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">Diritti dell'Utente (GDPR)</h2>
                            <p className="mb-4">Ai sensi del Regolamento UE 2016/679 (GDPR), l'Utente ha diritto di:</p>
                            <div className="grid md:grid-cols-2 gap-3">
                                {[
                                    "Accesso ai propri dati",
                                    "Rettifica dei dati inesatti",
                                    "Cancellazione dei dati (diritto all'oblio)",
                                    "Limitazione del trattamento",
                                    "Portabilità dei dati",
                                    "Opposizione al trattamento",
                                    "Revoca del consenso",
                                    "Reclamo all'Autorità Garante"
                                ].map((right, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                        {right}
                                    </div>
                                ))}
                            </div>
                            <p className="mt-4 text-sm">
                                Per esercitare i propri diritti, l'Utente può inviare una richiesta a{" "}
                                <a href="mailto:info@diramco.com" className="text-blue-400 hover:underline">info@diramco.com</a>
                            </p>
                        </section>

                        {/* Sicurezza */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">Sicurezza dei Dati</h2>
                            <p>
                                Il Titolare adotta misure di sicurezza adeguate per proteggere i dati personali da accessi non autorizzati,
                                distruzione, perdita o alterazione. Le password sono crittografate e i pagamenti sono gestiti da Stripe,
                                certificato PCI-DSS Level 1.
                            </p>
                        </section>

                        {/* Cookie */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">Cookie e Tracciamento</h2>
                            <p>
                                Questa Applicazione utilizza Cookie e altri Identificatori. Per informazioni dettagliate,
                                l'Utente può consultare la{" "}
                                <Link href="/cookie-policy" className="text-blue-400 hover:underline">Cookie Policy</Link>.
                            </p>
                        </section>

                        {/* Modifiche */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">Modifiche alla Privacy Policy</h2>
                            <p>
                                Il Titolare si riserva il diritto di apportare modifiche alla presente privacy policy in qualunque momento,
                                dandone informazione agli Utenti su questa pagina. Si prega di consultare spesso questa pagina.
                            </p>
                        </section>

                        {/* Footer info */}
                        <div className="border-t border-gray-800 pt-8 mt-8">
                            <div className="flex items-center gap-2 mb-2">
                                <Globe className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-500">Ultima modifica: Dicembre 2024</span>
                            </div>
                            <p className="text-sm text-gray-500">
                                Questa informativa è resa ai sensi dell'art. 13 del Regolamento UE 2016/679 (GDPR).
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
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
                        <span>•</span>
                        <Link href="/cookie-policy" className="hover:text-white">Cookie Policy</Link>
                        <span>•</span>
                        <Link href="/disclaimer" className="hover:text-white">Disclaimer</Link>
                    </div>
                    <div className="flex items-center gap-6 text-gray-500 text-sm">
                        <span>© {new Date().getFullYear()} DIRAMCO</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
