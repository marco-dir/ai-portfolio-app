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

                    {/* Email Preview Section */}
                    <div className="mt-8 pt-8 border-t border-gray-800">
                        <h3 className="text-xl font-bold text-gray-200 mb-6">Anteprima Email</h3>
                        <div className="bg-white text-black rounded-lg shadow-lg overflow-hidden">
                            {/* Subject Line */}
                            <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
                                <span className="text-gray-500 text-sm font-medium">Oggetto:</span>
                                <span className="font-bold ml-2 text-gray-900">{subject || "Nessun oggetto"}</span>
                            </div>

                            {/* Email Body - Matching API Template */}
                            <div style={{ fontFamily: 'sans-serif', lineHeight: 1.6, color: '#333' }}>
                                <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
                                    {/* Header with Logo - Centered */}
                                    <div style={{ textAlign: 'center', paddingBottom: '20px', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
                                        <img
                                            src="/diramco-logo.png"
                                            alt="DIRAMCO"
                                            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', display: 'inline-block' }}
                                        />
                                        <h2 style={{ margin: '10px 0 0 0', color: '#333' }}>DIRAMCO</h2>
                                    </div>

                                    {/* Content */}
                                    <div
                                        className="prose prose-sm max-w-none"
                                        style={{ color: '#333' }}
                                        dangerouslySetInnerHTML={{ __html: content || "<p style='color: #999; font-style: italic;'>Il contenuto della mail apparirà qui...</p>" }}
                                    />

                                    {/* Footer */}
                                    <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '12px', color: '#666' }}>
                                        {/* Social Links */}
                                        <div style={{ marginBottom: '10px' }}>
                                            <a href="https://www.youtube.com/@diramcoportfolio/about" style={{ color: '#333', textDecoration: 'none', margin: '0 10px', fontWeight: 'bold' }}>YouTube</a>
                                            <a href="https://www.instagram.com/diramco/" style={{ color: '#333', textDecoration: 'none', margin: '0 10px', fontWeight: 'bold' }}>Instagram</a>
                                            <a href="https://www.whatsapp.com/channel/0029VaDfDAgJENxwmMx7la0b" style={{ color: '#333', textDecoration: 'none', margin: '0 10px', fontWeight: 'bold' }}>WhatsApp</a>
                                        </div>
                                        <p style={{ margin: '10px 0' }}>© {new Date().getFullYear()} DIRAMCO. Tutti i diritti riservati.</p>
                                        <p style={{ color: '#999' }}>Non vuoi più ricevere queste email? <a href="/dashboard/impostazioni" style={{ color: '#666' }}>Gestisci preferenze</a></p>
                                    </div>
                                </div>
                            </div>
                        </div>
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
