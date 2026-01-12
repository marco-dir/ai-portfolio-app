import Link from "next/link"
import Image from "next/image"
import { Globe, ArrowLeft } from "lucide-react"

export default function DisclaimerPage() {
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
                    Disclaimer
                </h1>

                <div className="space-y-8 text-gray-300 leading-relaxed text-justify">
                    <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl space-y-8">

                        <div className="space-y-4">
                            <p className="font-bold">Leggere attentamente queste Condizioni prima di utilizzare il Sito Internet.</p>
                            <p>L’utente riconosce di essere informato, sin dal suo ingresso sul Sito, su queste Condizioni Generali di utilizzo e di averne preso conoscenza prima di accedere al Sito. Di conseguenza, il proseguimento della consultazione del Sito significa l’accettazione totale delle presenti Condizioni da parte dell’utente. In caso di mancata accettazione delle presenti Condizioni, l’utente non è autorizzato a proseguire la consultazione e accedere al Sito.</p>
                        </div>

                        <h2 className="text-2xl font-bold text-white mt-8">NOTE LEGALI PER GLI UTENTI DEL SITO</h2>
                        <p className="italic">(da leggere e accettare prima di accedere ai servizi e prodotti)</p>
                        <p>Le persone che accedono al materiale messo a disposizione da DIRAMCO sul sito diramco.com, accettano integralmente le seguenti condizioni.</p>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-3">Esclusione di offerta</h3>
                            <p>L’attività del sito non costituisce consulenza personalizzata così come indicato dal D.Lgs. 58/98, così come modificato dal successivo D.Lgs. 167/2007. Il contenuto del sito diramco.com non può in nessun caso essere interpretato come consulenza, invito all’investimento, offerta o raccomandazione per l’acquisto, la vendita, l’esercizio di una transazione o in generale l’investimento. Tramite il sito diramco.com non avviene alcuna sollecitazione al pubblico risparmio. Questo sito, tutti i suoi contenuti, inclusi i Portafogli, e tutti i contenuti dei suoi articoli e video vanno considerati esclusivamente come analisi indipendente dei mercati, svolta attraverso metodologie che – pur essendo state ampiamente testate ed essendo basate su modelli algoritmici – non forniscono alcuna garanzia di profitto. In nessun modo e per nessuna ragione l’utente di questo sito può o deve considerare le indicazioni di analisi come sollecitazione all’investimento.</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-3">Diritto di recesso</h3>
                            <p>Ai sensi del Dlgs 185/99 “Attuazione della direttiva 97/7/CE relativa alla protezione dei consumatori in materia di contratti a distanza” per questo servizio NON E’ PREVISTO il diritto di recesso.</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-3">Copyright</h3>
                            <p className="mb-4">DIRAMCO ha creato questo Sito di analisi per l’informazione personale degli utenti. L’utente può scaricare su un computer o stampare una copia delle pagine che si trovano sul Sito esclusivamente per uso personale e a fini privati, domestici, educativi e non commerciali, a condizione di conservare intatti i marchi e le menzioni sul Copyright ©, nonché le avvertenze relative ai diritti di Proprietà Intellettuale di DIRAMCO. Salvo diversamente indicato, tutti gli elementi grafici e testuali che figurano sul presente Sito e sugli allegati, quali, in particolare, logo, fotografie, immagini, illustrazioni, icone, testi, videoclip, (di seguito denominati ”contenuto”) sono protetti dalla legge, in particolare dalla normativa sul diritto d’autore, il diritto dei marchi e le disposizioni derivanti dai trattati internazionali e nazionali, e questo in tutto il mondo.</p>
                            <p className="mb-4">Il contenuto non può essere modificato né utilizzato in tutto o in parte in nessun modo e in particolare essere riprodotto, rappresentato o distribuito al pubblico, affisso, commercializzato, venduto, copiato, redistribuito, integrato in un’opera derivata, a fini pubblici o commerciali.</p>
                            <p>Tutto ciò che si trova nel sito diramco.com è coperto da Copyright ©. Tutti i diritti sono riservati.</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-3">Responsabilità</h3>
                            <p className="mb-4">In nessun caso DIRAMCO potrà essere ritenuta responsabile per danni diretti o indiretti derivanti direttamente o indirettamente dall’accesso, dal contenuto o dall’uso del sito e dei report di analisi, come pure dal browsing o da collegamenti ipertestuali (links) verso altri siti, partendo dal sito diramco.com. DIRAMCO declina ogni responsabilità sull’affidabilità e la precisione delle informazioni contenute, distribuite e messe a disposizione degli utenti attraverso i servizi offerti sul proprio sito sotto forma di notizie, risultati di ricerche o pubblicità.</p>
                            <p className="mb-4">L’utente accetta di utilizzare i dati e le informazioni del sito e degli articoli così come vengono proposte; pertanto, né DIRAMCO né i suoi fornitori di informazioni potranno essere ritenuti responsabili per errori o ritardi nella pubblicazione degli stessi.</p>
                            <p className="mb-4">DIRAMCO non è inoltre responsabile per danni derivanti da eventuali interruzioni, sospensioni, ritardi o anomalie nell’erogazione del servizio dipendenti dalla fornitura di energia elettrica o dal servizio telefonico, oppure da altre cause collegate al mezzo tramite il quale il contenuto del sito diramco.com viene trasmesso.</p>
                            <p>DIRAMCO propone sul suo sito e sui suoi report di analisi un certo numero di portafogli e di indicazioni su mercati e titoli che ritiene di interesse. L’immissione o l’esclusione di azioni, ETF, indici, bonds o altri strumenti finanziari dagli stessi non significa tuttavia che questa operazione sia necessariamente giusta anche per gli utenti del sito e dei report e pertanto non si assume alcuna responsabilità in merito alle conseguenze che ne potrebbero derivare. Ai sensi e agli effetti della legge Draghi si informano gli utenti che gli editori del sito e dei report potrebbero detenere occasionalmente per sé o per i propri clienti posizioni sugli strumenti finanziari oggetto dell’analisi.</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-3">Links</h3>
                            <p>DIRAMCO declina ogni responsabilità in merito ai contenuti dei siti proposti sotto forma di collegamenti ipertestuali (links) che si trovano sul sito.</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-3">Trasmissione da parte dell’utente di informazioni verso il Sito</h3>
                            <p>Tutte le comunicazioni, informazioni o contenuti non sollecitati inviati dall’utente verso il Sito, per posta elettronica o altra forma, saranno elaborati da DIRAMCO come informazioni non riservate e saranno totalmente libere da diritti ad eccezione dei dati personali che consentono di individuare l’utente stesso. Questi messaggi e contenuti non sollecitati comprendono (ma non limitatamente) i dati, domande, risposte, commenti, consigli e altri dati simili provenienti dall’utente. Con l’invio di tali comunicazioni al Sito, l’utente concede a DIRAMCO una licenza gratuita, perpetua, irrevocabile e non esclusiva che l’autorizza a utilizzare, riprodurre, modificare, pubblicare, editare, tradurre, distribuire, rappresentare e affiggere le vostre comunicazioni in modo isolato o integrandole in altre opere, qualunque siano la forma, la tecnologia o il mezzo utilizzato, presente o futuro, nonché alla cessione di tali diritti a un qualunque terzo. Qualunque contenuto trasmesso o inviato può essere utilizzato da DIRAMCO a fini diversi, compresi (ma non limitatamente) la riproduzione, la divulgazione, la trasmissione, la pubblicazione, la diffusione e l’invio, ma anche lo sviluppo, la produzione e la commercializzazione di prodotti che utilizzano queste informazioni.</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-3">Diritti di DIRAMCO</h3>
                            <p>DIRAMCO si riserva il diritto, senza assumersene l’obbligo, di modificare il contenuto del sito, degli articoli e della frequenza degli stessi o correggere errori od omissioni all’interno dei servizi proposti, ciò in qualsiasi momento, senza preavviso e senza necessità di assenso da parte dell’utente.</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-3">Restrizioni</h3>
                            <p>Il sito non si rivolge a persone per le quali si debba applicare una giurisdizione che vieti la pubblicazione, l’accesso o l’utilizzo del sito diramco.com.</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-3">Condizioni del servizio</h3>
                            <p className="mb-4">DIRAMCO fissa di seguito le condizioni del servizio, che debbono essere rispettate dagli utenti del sito diramco.com. Entrando nel sito diramco.com e accedendo all’utilizzo degli strumenti, dichiarate esplicitamente di accettare tutti i termini di questo regolamento:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Certifico di avere almeno diciotto (18) anni e garantisco che tutte le informazioni che fornisco sono vere ed accurate.</li>
                                <li>Accetto le condizioni contenute nelle precedenti avvertenze legali e concordo sul fatto che DIRAMCO non può essere ritenuto responsabile per danni diretti o indiretti che dovessero risultare dall’uso di tutto o parte del contenuto del sito e dei reports e non può essere considerato perseguibile per l’uso che viene fatto del contenuto.</li>
                                <li>Accetto in particolare di utilizzare il sito solo per uso personale e di non utilizzarlo, sia direttamente che indirettamente, per:
                                    <ul className="list-disc pl-6 mt-2 space-y-2">
                                        <li>trasmettere qualsivoglia contenuto che sia falso, diffamatorio, ingiurioso, volgare, detestabile, molesto, osceno, profano, minaccioso, di natura esplicitamente sessuale, lesivo della privacy, o comunque contrario alle leggi;</li>
                                        <li>inviare materiale senza possedere i necessari diritti, o in violazione di vincoli contrattuali o relazioni fiduciarie;</li>
                                        <li>assumere l’identità di terzi (persone o enti) o rappresentare in modo non veritiero la propria relazione con una persona o con un ente;</li>
                                        <li>inviare, trasmettere o facilitare la trasmissione di affermazioni intenzionalmente false o fuorvianti, o utilizzare tali informazioni allo scopo di influenzare il mercato di qualsiasi titolo;</li>
                                        <li>inviare, trasmettere o diventare i destinatari di pubblicità non richiesta, materiale promozionale o altre forme di sollecitazione;</li>
                                        <li>offrire, vendere o acquistare qualsiasi titolo quotato o non quotato;</li>
                                        <li>violare qualsiasi legge locale, nazionale o internazionale o accordo internazionale, inclusi i regolamenti definiti da istituzioni quali CONSOB e Banca d’Italia;</li>
                                        <li>violare qualsiasi disposto di un organo ufficiale di controllo dei mercati in Italia e all’estero.</li>
                                    </ul>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-3">Tracciabilità e redistribuzione</h3>
                            <p>DIRAMCO è in grado e si riserva in particolare il diritto di tracciare informazioni sull’indirizzo IP dell’utente, sul dominio, sul tipo di computer e browser utilizzato nonchè sulle pagine che l’utente è solito consultare (compreso l’utilizzo di web beacon o altre tecnologie equivalenti). DIRAMCO raccoglie tali informazioni al fine di amministrare e migliorare il proprio sistema ma soprattutto di evitare qualunque tipo di redistribuzione dei propri prodotti e di proteggere i dati sensibili dell’utente ai fini dell’accesso ai prodotti stessi (username, password). L’utente concorda sul fatto di poter essere ritenuto responsabile per ogni affermazione fatta, atti e omissioni che accadano grazie all’uso della iscrizione o password, e di non rivelare mai la password che è stata assegnata. L’utente accetta che DIRAMCO possa in ogni momento porre fine alla sua iscrizione senza alcun preavviso, nel caso fosse constatata la violazione di una qualunque prescrizione del presente regolamento.</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-3">Analisi con Intelligenza Artificiale</h3>
                            <p className="mb-4">DIRAMCO utilizza sistemi di intelligenza artificiale (AI) per generare analisi e report. Le analisi generate mediante intelligenza artificiale hanno carattere puramente informativo e non costituiscono in alcun modo consulenza finanziaria personalizzata.</p>
                            <p>L'AI può produrre errori, valutazioni imprecise o informazioni non aggiornate. L'utente è tenuto a verificare autonomamente le informazioni fornite e a consultare un professionista autorizzato prima di prendere decisioni d'investimento basate su tali analisi.</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-3">Diritto applicabile e foro</h3>
                            <p className="mb-4">Per ogni eventuale controversia derivante dall’accesso e dall’uso del sito, o in qualsiasi altro modo riconducibile direttamente o indirettamente al sito diramco.com, è imperativamente applicabile il diritto italiano. L’eventuale foro competente è a Milano, Italia.</p>
                            <p className="font-medium text-blue-400">Per eventuali chiarimenti potete scrivere a info@diramco.com.</p>
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
                        <span>© {new Date().getFullYear()} DIRAMCO</span>
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
