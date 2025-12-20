"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Send, Loader2 } from "lucide-react"

export default function NewsletterPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    // Form states
    const [subject, setSubject] = useState("")
    const [content, setContent] = useState("")
    const [sending, setSending] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Redirect if not admin
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
        router.push("/dashboard")
        return null
    }

    if (status === "loading") {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!subject || !content) return

        if (!confirm("Sei sicuro di voler inviare la newsletter a TUTTI gli iscritti?")) {
            return
        }

        setSending(true)
        setMessage(null)

        try {
            const res = await fetch("/api/newsletter/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subject, content }),
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || "Errore durante l'invio")

            setMessage({ type: 'success', text: `Newsletter inviata con successo a ${data.count} utenti!` })
            setSubject("")
            setContent("")
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || "Si è verificato un errore" })
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-white mb-8">Invia Newsletter</h1>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                {message && (
                    <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500 text-green-500' : 'bg-red-500/10 border border-red-500 text-red-500'
                        }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSend} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Oggetto</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Titolo della newsletter..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Contenuto (HTML supportato)</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-96 px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                            placeholder="<p>Contenuto della newsletter...</p>"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-2">Puoi usare tag HTML per la formattazione.</p>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={sending}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                        >
                            {sending ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Invio in corso...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Invia a tutti gli iscritti
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
