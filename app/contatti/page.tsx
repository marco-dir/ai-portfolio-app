"use client"

import { useState } from "react"
import { Send, Mail, MessageSquare, User, AlertCircle, CheckCircle2 } from "lucide-react"
import HomeAnimations from "@/components/home-animations"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MarketingHeader } from "@/components/marketing/header"

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    })
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
    const [errorMessage, setErrorMessage] = useState("")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setStatus("idle")
        setErrorMessage("")

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Qualcosa è andato storto")
            }

            setStatus("success")
            setFormData({ name: "", email: "", subject: "", message: "" })
        } catch (error) {
            console.error(error)
            setStatus("error")
            setErrorMessage(error instanceof Error ? error.message : "Si è verificato un errore durante l'invio del messaggio")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen bg-gray-950 text-white overflow-hidden">
            <HomeAnimations />

            {/* Navigation */}
            <MarketingHeader />

            <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-sky-400 to-emerald-600 bg-clip-text text-transparent">
                            Contattaci
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Hai domande sui nostri servizi o vuoi saperne di più su Diramco?
                            Compila il modulo qui sotto e ti risponderemo il prima possibile.
                        </p>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl">
                        <div className="grid md:grid-cols-3 gap-12">
                            <div className="md:col-span-1 space-y-8">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
                                    <a href="mailto:info@diramco.com" className="flex items-center gap-3 text-sky-400 hover:text-sky-300 transition-colors">
                                        <Mail size={20} />
                                        info@diramco.com
                                    </a>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Social</h3>
                                    <div className="flex gap-4">
                                        <a href="https://www.instagram.com/diramco/" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-full hover:bg-emerald-600 transition-colors text-white">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                                        </a>
                                        <a href="https://www.facebook.com/people/Diramco/100063790743102/" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-full hover:bg-blue-600 transition-colors text-white">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                                        </a>
                                        <a href="https://www.whatsapp.com/channel/0029VaDfDAgJENxwmMx7la0b" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-full hover:bg-green-600 transition-colors text-white">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" fill="currentColor" className="bi bi-whatsapp">
                                                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="text-sm font-medium text-gray-300">Nome</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                                    <User size={18} />
                                                </div>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    required
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full bg-gray-950 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all placeholder:text-gray-600"
                                                    placeholder="Il tuo nome"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-sm font-medium text-gray-300">Email</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                                    <Mail size={18} />
                                                </div>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="w-full bg-gray-950 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all placeholder:text-gray-600"
                                                    placeholder="La tua email"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="subject" className="text-sm font-medium text-gray-300">Oggetto</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                                <MessageSquare size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                id="subject"
                                                name="subject"
                                                required
                                                value={formData.subject}
                                                onChange={handleChange}
                                                className="w-full bg-gray-950 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all placeholder:text-gray-600"
                                                placeholder="Oggetto del messaggio"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="message" className="text-sm font-medium text-gray-300">Messaggio</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={handleChange}
                                            className="w-full bg-gray-950 border border-gray-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all placeholder:text-gray-600 resize-none"
                                            placeholder="Come possiamo aiutarti?"
                                        />
                                    </div>

                                    {status === "error" && (
                                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                            <AlertCircle size={16} />
                                            {errorMessage}
                                        </div>
                                    )}

                                    {status === "success" && (
                                        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                                            <CheckCircle2 size={16} />
                                            Messaggio inviato con successo! Ti risponderemo presto.
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white font-semibold py-6 rounded-xl transition-all shadow-lg shadow-sky-500/25"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                Inviando...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                Invia Messaggio
                                                <Send size={18} />
                                            </span>
                                        )}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
