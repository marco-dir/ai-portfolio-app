"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X, Cookie, ShieldCheck, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        const consent = localStorage.getItem("cookie-consent")
        if (!consent) {
            // Small delay to prevent layout shift or immediate popup on load
            const timer = setTimeout(() => setIsVisible(true), 1000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleAcceptAll = () => {
        localStorage.setItem("cookie-consent", "all")
        setIsVisible(false)
    }

    const handleRejectNonEssential = () => {
        localStorage.setItem("cookie-consent", "essential")
        setIsVisible(false)
    }

    if (!isMounted) return null
    if (!isVisible) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
            <div className="max-w-7xl mx-auto bg-gray-900/95 backdrop-blur-md border border-gray-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-blue-500/10 rounded-xl hidden sm:block">
                        <Cookie className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            Informativa sui Cookie
                            <ShieldCheck className="w-4 h-4 text-green-400" />
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed max-w-3xl">
                            Utilizziamo i cookie per migliorare la tua esperienza di navigazione,
                            analizzare il traffico del sito e personalizzare i contenuti.
                            Cliccando su "Accetta Tutti", acconsenti all'uso di tutti i cookie.
                            Puoi gestire le tue preferenze o rifiutare i cookie non essenziali.
                            Per maggiori informazioni, consulta la nostra{" "}
                            <Link href="/cookie-policy" className="text-blue-400 hover:text-blue-300 underline underline-offset-4">
                                Cookie Policy
                            </Link>.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto min-w-[300px]">
                    <button
                        onClick={handleRejectNonEssential}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium"
                    >
                        Solo Essenziali
                    </button>
                    <button
                        onClick={handleAcceptAll}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        Accetta Tutti
                    </button>
                </div>
            </div>
        </div>
    )
}
