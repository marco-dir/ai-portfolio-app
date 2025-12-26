"use client"

import { useState } from "react"
import { Send, Loader2, Info } from "lucide-react"

export function NewsletterForm() {
    const [subject, setSubject] = useState("")
    const [content, setContent] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setStatus(null)

        try {
            const response = await fetch('/api/admin/newsletter/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ subject, content }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Error sending newsletter')
            }

            setStatus({
                type: 'success',
                message: `Newsletter inviata con successo a ${data.sentCount} iscritti!`
            })
            setSubject("")
            setContent("")
        } catch (error: any) {
            setStatus({
                type: 'error',
                message: error.message
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="mb-6 p-4 bg-blue-900/20 border border-blue-900/50 rounded-lg flex gap-3 text-blue-200">
                <Info className="shrink-0 mt-0.5" size={20} />
                <p className="text-sm">
                    Questa email verrà inviata a tutti gli utenti che hanno acconsentito a ricevere la newsletter.
                    L'invio potrebbe richiedere del tempo.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Oggetto della mail
                    </label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="Es. Novità: Analisi IA migliorata..."
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Contenuto HTML
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white h-64 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="<p>Ciao a tutti...</p>"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        Puoi usare tag HTML semplici come &lt;h1&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;a&gt;.
                    </p>
                </div>

                {/* Email Preview Section - Moved Inside Form */}
                <div className="mt-8 pt-8 border-t border-gray-800">
                    <h3 className="text-xl font-bold text-gray-200 mb-6">Anteprima Email</h3>
                    <div className="bg-white text-black p-8 rounded-lg shadow-lg overflow-hidden">
                        {/* Header/Subject simulation */}
                        <div className="border-b border-gray-200 pb-4 mb-6">
                            <span className="text-gray-500 text-sm font-medium">Oggetto:</span>
                            <span className="font-bold ml-2 text-lg text-gray-900">{subject || "Nessun oggetto"}</span>
                        </div>

                        {/* Email Body Simulation */}
                        <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
                            <div
                                className="prose prose-sm max-w-none text-gray-800"
                                dangerouslySetInnerHTML={{ __html: content || "<p class='text-gray-400 italic'>Il contenuto della mail apparirà qui...</p>" }}
                            />

                            <hr style={{ marginTop: '40px', border: '0', borderTop: '1px solid #eaeaea' }} />
                            <p style={{ fontSize: '12px', color: '#666', marginTop: '20px' }}>
                                Hai ricevuto questa mail perché sei iscritto alla newsletter di DIRAMCO.
                            </p>
                        </div>
                    </div>
                </div>

                {status && (
                    <div className={`p-4 rounded-lg flex items-center gap-2 ${status.type === 'success'
                        ? 'bg-green-900/20 text-green-400 border border-green-900/50'
                        : 'bg-red-900/20 text-red-400 border border-red-900/50'
                        }`}>
                        {status.message}
                    </div>
                )}

                <div className="flex justify-end pt-6">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Invio in corso...
                            </>
                        ) : (
                            <>
                                <Send size={20} />
                                Invia Newsletter
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
