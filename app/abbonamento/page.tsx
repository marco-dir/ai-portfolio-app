"use client"

import { useState } from "react"
import { Check, Star, Shield, Zap, TrendingUp, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MarketingHeader } from "@/components/marketing/header"

export default function SubscriptionPage() {
    const features = [
        "Analisi Finanziaria Avanzata (Dati storici 30 anni)",
        "Azioni Value (Dati storici 30 anni)",
        "Creazione Portafogli Personalizzati (Analisi AI)",
        "Watchlist Personalizzate",
        "Visualizzazione Portafogli Modello",
        "Portafoglio Diramco in Tempo Reale (+ Movimenti)",
        "Watchlist Diramco"
    ]

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleCheckout = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
            })
            if (response.status === 401) {
                window.location.href = '/accedi?callbackUrl=/abbonamento'
                return
            }

            const data = await response.json()
            if (!response.ok) throw new Error(data.message || 'Errore durante il checkout')
            window.location.href = data.url
        } catch (err: any) {
            console.error(err)
            setError("Si è verificato un errore. Riprova più tardi.")
            setIsLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen bg-[#0a0a0a] text-white flex flex-col">
            {/* Navigation */}
            <MarketingHeader />

            <div className="flex-grow flex items-center justify-center p-4 md:p-8">

                <div className="max-w-4xl w-full space-y-8">
                    {/* Hero Section */}
                    <div className="text-center space-y-4">
                        <div className="flex justify-center mb-6">
                            <Image
                                src="/diramco-logo.png"
                                alt="DIRAMCO Logo"
                                width={80}
                                height={80}
                                className="w-20 h-20 rounded-full shadow-lg shadow-blue-500/20"
                            />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                            Sblocca il Tuo Potenziale
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Accedi a strumenti professionali, analisi AI e dati esclusivi per massimizzare i tuoi investimenti.
                        </p>
                    </div>

                    {/* Offer Card */}
                    <div className="grid md:grid-cols-1 gap-8 max-w-lg mx-auto">
                        <Card className="relative bg-gray-900 border-gray-800 overflow-hidden shadow-2xl hover:shadow-blue-900/20 transition-all duration-300">
                            {/* Decorative Gradient Blob */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

                            <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-500 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                                RISPARMIA IL 30%
                            </div>

                            <CardHeader className="text-center pb-2">
                                <CardTitle className="text-2xl font-bold text-white">Piano Annuale Premium</CardTitle>
                                <p className="text-blue-400 font-medium">Prova gratuita di 14 giorni</p>
                            </CardHeader>

                            <CardContent className="space-y-6 pt-4">
                                {/* Pricing */}
                                <div className="text-center space-y-2">
                                    <div className="flex items-center justify-center gap-3">
                                        <span className="text-2xl text-gray-500 line-through decoration-red-500">€348</span>
                                        <span className="text-5xl font-bold text-white">€240</span>
                                    </div>
                                    <p className="text-gray-400 text-sm">all'anno</p>
                                </div>

                                {/* Features List */}
                                <div className="space-y-4 bg-gray-950/50 p-6 rounded-xl border border-gray-800">
                                    {features.map((feature, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <div className="mt-1 min-w-[20px]">
                                                <div className="bg-green-500/20 p-1 rounded-full">
                                                    <Check className="w-3 h-3 text-green-500" />
                                                </div>
                                            </div>
                                            <span className="text-gray-300 text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>

                            <CardFooter className="flex flex-col gap-4 pb-8">
                                <Button
                                    onClick={handleCheckout}
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-6 text-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isLoading ? "Reindirizzamento..." : "Inizia la prova gratuita"}
                                </Button>
                                {error && <p className="text-red-400 text-sm text-center mt-2">{error}</p>}
                                <p className="text-xs text-center text-gray-500">
                                    Nessun addebito immediato. Puoi cancellare in qualsiasi momento prima del termine dei 14 giorni.
                                </p>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Trust/Secure Footer */}
                    <div className="flex justify-center items-center gap-6 text-gray-500 text-sm">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" /> Pagamenti Sicuri
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4" /> Attivazione Immediata
                        </div>
                        <div className="flex items-center gap-2">
                            <Star className="w-4 h-4" /> Supporto Dedicato
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
