import Link from "next/link"
import Image from "next/image"
import HomeAnimations from "@/components/home-animations"
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
  Globe
} from "lucide-react"

export default function Home() {
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
      icon: BarChart3,
      title: "Grafici Storici",
      description: "Analizza 30 anni di dati storici su ricavi, EPS, dividendi e margini operativi."
    },
    {
      icon: Star,
      title: "Watchlist Personalizzata",
      description: "Segui i titoli che ti interessano e ricevi aggiornamenti sui prezzi e sulle metriche chiave."
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
            <Link
              href="/chi-siamo"
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Chi Siamo
            </Link>
            <Link
              href="/missione"
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Missione
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
            href="/login"
            className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Accedi
          </Link>
          <Link
            href="/register"
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
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25"
            >
              Inizia Gratuitamente
              <ChevronRight size={20} />
            </Link>
            <Link
              href="/login"
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
                <div className="text-8xl font-bold text-gray-800 mb-4">{step.number}</div>
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
            href="/register"
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
