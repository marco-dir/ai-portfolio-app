import Link from "next/link"
import Image from "next/image"
import HomeAnimations from "@/components/home-animations"
import DiramcoEquityChart from "@/components/public/diramco-equity-chart"
import ReviewsSection from "@/components/public/reviews-section"
import {
  TrendingUp,
  Shield,
  PieChart,
  BarChart3,
  Lightbulb,
  Star,
  ChevronRight,
  Zap,
  Target,
  Globe,
  Layers
} from "lucide-react"

import { fetchEquityData } from "@/lib/data-fetcher"

export default async function Home() {
  const equityData = await fetchEquityData()

  const features = [
    {
      icon: TrendingUp,
      title: "Analisi in Tempo Reale",
      description: "Monitora le performance del tuo portafoglio con dati aggiornati dal mercato in tempo reale."
    },
    {
      icon: Shield,
      title: "Gestione del Rischio",
      description: "Valuta il Beta, la deviazione standard e lo Sharpe Ratio per ottimizzare il rapporto rischio/rendimento."
    },
    {
      icon: PieChart,
      title: "Allocazione Settoriale",
      description: "Visualizza la distribuzione dei tuoi investimenti per settore e paese con grafici interattivi."
    },
    {
      icon: Lightbulb,
      title: "Azioni Value con IA",
      description: "Scopri opportunità di investimento con analisi fondamentale potenziata dall'intelligenza artificiale."
    },
    {
      icon: Layers,
      title: "Analisi ETF",
      description: "Esplora la composizione degli ETF: holdings principali, allocazione settoriale ed esposizione geografica."
    },
    {
      icon: BarChart3,
      title: "Grafici Storici e Watchlist",
      description: "Analizza 30 anni di dati storici e segui i tuoi titoli preferiti con aggiornamenti in tempo reale."
    }
  ]

  const stats = [
    { value: "30+", label: "Anni di Dati Storici" },
    { value: "100+", label: "Metriche Finanziarie" },
    { value: "IA", label: "Analisi Intelligente" },
    { value: "24/7", label: "Accesso Sempre Attivo" }
  ]

  const steps = [
    {
      number: "01",
      title: "Crea il tuo Account",
      description: "Registrati gratuitamente in pochi secondi e accedi alla piattaforma."
    },
    {
      number: "02",
      title: "Configura i Portafogli",
      description: "Aggiungi le tue posizioni e organizza i tuoi investimenti per obiettivo."
    },
    {
      number: "03",
      title: "Analizza e Ottimizza",
      description: "Utilizza gli strumenti avanzati per prendere decisioni informate."
    }
  ]

  return (
    <div className="relative min-h-screen bg-gray-950 text-white overflow-hidden">
      <HomeAnimations />

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-12">
          <Image src="/diramco-logo.png" alt="DIRAMCO Logo" width={40} height={40} className="w-10 h-10 rounded-full" />
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            DIRAMCO
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="relative group">
              <Link
                href="/chi-siamo"
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium flex items-center gap-1"
              >
                Chi Siamo
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              <div className="absolute top-full left-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <Link
                  href="/chi-siamo"
                  className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 text-sm font-medium rounded-t-lg transition-colors"
                >
                  Chi Siamo
                </Link>
                <Link
                  href="/missione"
                  className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 text-sm font-medium rounded-b-lg transition-colors"
                >
                  Missione
                </Link>
              </div>
            </div>
            <Link
              href="/portafogli"
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Portafogli
            </Link>
            <Link
              href="/abbonamento"
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Abbonamento
            </Link>
            <Link
              href="/blog"
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Blog
            </Link>
            <Link
              href="/contatti"
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Contatti
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/disclaimer"
            className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Disclaimer
          </Link>
          <Link
            href="/accedi"
            className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Accedi
          </Link>
          <Link
            href="/registrati"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-full font-medium transition-all hover:scale-105"
          >
            Inizia Gratis
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-8">
            <Zap size={16} />
            Potenziato dall'Intelligenza Artificiale
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Gestisci i tuoi investimenti
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
              come un professionista
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Analisi avanzata del portafoglio, strumenti di Value Investing e insight generati dall'IA.
            Tutto in un'unica piattaforma progettata per investitori ambiziosi.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/registrati"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25"
            >
              Inizia Gratuitamente
              <ChevronRight size={20} />
            </Link>
            <Link
              href="/accedi"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-full font-bold text-lg transition-all"
            >
              Ho già un account
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 px-8 border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Tutto ciò che ti serve per investire meglio
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Strumenti professionali, interfaccia intuitiva e analisi potenziate dall'intelligenza artificiale.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-blue-500/50 transition-all group"
              >
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <feature.icon className="text-blue-400" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-24 px-8 bg-gradient-to-b from-gray-900/50 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Come Funziona</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Inizia in tre semplici passi e trasforma il modo in cui gestisci i tuoi investimenti.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="text-8xl font-bold bg-gradient-to-r from-blue-500/40 to-purple-500/40 bg-clip-text text-transparent mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 right-0 translate-x-1/2 text-gray-700">
                    <ChevronRight size={32} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Equity Chart Section */}
      <section className="relative z-10 py-16 px-8 bg-gray-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">La Nostra Performance</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Trasparenza assoluta sui nostri risultati. Ecco l'andamento storico del portafoglio DIRAMCO.
            </p>
          </div>
          <DiramcoEquityChart data={equityData} />
        </div>
      </section>

      {/* Reviews Section */}
      <ReviewsSection />

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-8">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-3xl p-12">
          <Target className="w-16 h-16 text-blue-400 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">
            Pronto a iniziare?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Unisciti a centinaia di investitori che hanno già scelto DIRAMCO per gestire i propri portafogli.
          </p>
          <Link
            href="/registrati"
            className="inline-flex items-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-500 rounded-full font-bold text-lg transition-all transform hover:scale-105"
          >
            Crea il tuo Account Gratuito
            <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            DIRAMCO
          </div>

          <div className="flex items-center gap-6">
            <a href="https://www.instagram.com/diramco/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
            </a>
            <a href="https://www.facebook.com/people/Diramco/100063790743102/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
            </a>
            <a href="https://www.whatsapp.com/channel/0029VaDfDAgJENxwmMx7la0b" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16" fill="currentColor" className="bi bi-whatsapp">
                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
              </svg>
            </a>
            <a href="https://www.youtube.com/@diramcoportfolio/about" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-youtube"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-gray-500 text-sm">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link>
            <span>•</span>
            <Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
          </div>

          <div className="flex items-center gap-6 text-gray-500 text-sm">
            <span>Copyright © {new Date().getFullYear()} DIRAMCO</span>
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
