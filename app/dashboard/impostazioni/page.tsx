"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Lock, Save, AlertCircle, CheckCircle, CreditCard, ExternalLink, Star, Mail } from "lucide-react"

export default function SettingsPage() {
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState(false)
    const [isPortalLoading, setIsPortalLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    })

    // Contact Form State
    const [contactSubject, setContactSubject] = useState("")
    const [contactMessage, setContactMessage] = useState("")
    const [isContactLoading, setIsContactLoading] = useState(false)
    const [contactStatus, setContactStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Review state
    const [reviewRating, setReviewRating] = useState(5)
    const [reviewContent, setReviewContent] = useState("")
    const [reviewMessage, setReviewMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [isReviewLoading, setIsReviewLoading] = useState(false)
    const [hasExistingReview, setHasExistingReview] = useState(false)

    // Fetch existing review on mount
    useEffect(() => {
        const fetchReview = async () => {
            try {
                const res = await fetch('/api/reviews/my')
                if (res.ok) {
                    const data = await res.json()
                    if (data) {
                        setReviewRating(data.rating)
                        setReviewContent(data.content)
                        setHasExistingReview(true)
                    }
                }
            } catch (error) {
                console.error('Error fetching review:', error)
            }
        }
        if (session?.user?.subscriptionStatus === 'active' || session?.user?.subscriptionStatus === 'trialing') {
            fetchReview()
        }
    }, [session])

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setReviewMessage(null)

        if (reviewContent.length < 10) {
            setReviewMessage({ type: 'error', text: "La recensione deve essere di almeno 10 caratteri" })
            return
        }

        setIsReviewLoading(true)
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating: reviewRating, content: reviewContent })
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || 'Errore')
            }
            setReviewMessage({ type: 'success', text: hasExistingReview ? 'Recensione aggiornata!' : 'Recensione pubblicata!' })
            setHasExistingReview(true)
        } catch (error: any) {
            setReviewMessage({ type: 'error', text: error.message })
        } finally {
            setIsReviewLoading(false)
        }
    }

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setContactStatus(null)

        if (!contactSubject || !contactMessage) {
            setContactStatus({ type: 'error', text: "Compila tutti i campi" })
            return
        }

        setIsContactLoading(true)
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: session?.user?.name || "Utente",
                    email: session?.user?.email,
                    subject: contactSubject,
                    message: contactMessage
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Errore durante l'invio")

            setContactStatus({ type: 'success', text: "Messaggio inviato con successo!" })
            setContactSubject("")
            setContactMessage("")
        } catch (error: any) {
            setContactStatus({ type: 'error', text: error.message })
        } finally {
            setIsContactLoading(false)
        }
    }

    const handleManageSubscription = async () => {
        setIsPortalLoading(true)
        try {
            const response = await fetch('/api/stripe/portal', {
                method: 'POST',
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message || 'Errore nel caricamento del portale')
            window.location.href = data.url
        } catch (error) {
            console.error(error)
            setMessage({ type: 'error', text: "Impossibile aprire il portale pagamenti" })
            setIsPortalLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: "Le nuove password non corrispondono" })
            return
        }

        if (formData.newPassword.length < 6) {
            setMessage({ type: 'error', text: "La password deve essere di almeno 6 caratteri" })
            return
        }

        setIsLoading(true)

        try {
            const res = await fetch("/api/user/password", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data || "Qualcosa è andato storto")
            }

            setMessage({ type: 'success', text: "Password aggiornata con successo" })
            setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || "Errore durante l'aggiornamento della password" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Il mio account</h1>

            <div className="max-w-xl space-y-6">

                {/* Subscription Section */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <CreditCard size={20} />
                        Abbonamento
                    </h2>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg">
                            <div>
                                <p className="text-sm text-gray-400">Stato Attuale</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${session?.user?.subscriptionStatus === 'active' ? 'bg-green-500/20 text-green-400' :
                                        session?.user?.subscriptionStatus === 'trialing' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-red-500/20 text-red-400'
                                        }`}>
                                        {session?.user?.subscriptionStatus === 'active' ? 'Attivo' :
                                            session?.user?.subscriptionStatus === 'trialing' ? 'Periodo di Prova' :
                                                'Scaduto / Inattivo'}
                                    </span>
                                </div>
                            </div>
                            {session?.user?.trialEndsAt && (
                                <div className="text-right">
                                    <p className="text-sm text-gray-400">
                                        {session?.user?.subscriptionStatus === 'trialing' ? 'Scadenza Prova' : 'Scadenza Prova'}
                                    </p>
                                    <p className="font-medium text-white">
                                        {new Date(session.user.trialEndsAt).toLocaleDateString('it-IT')}
                                    </p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleManageSubscription}
                            disabled={isPortalLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isPortalLoading ? (
                                "Caricamento..."
                            ) : (
                                <>
                                    <ExternalLink size={18} />
                                    Gestisci Abbonamento e Pagamenti
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Password Section */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Lock size={20} />
                        Modifica Password
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Password Attuale
                            </label>
                            <input
                                type="password"
                                required
                                value={formData.currentPassword}
                                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Nuova Password
                            </label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Conferma Nuova Password
                            </label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        {message && (
                            <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${message.type === 'success' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
                                }`}>
                                {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                "Aggiornamento..."
                            ) : (
                                <>
                                    <Save size={18} />
                                    Aggiorna Password
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Review Section - Only for subscribed users */}
                {(session?.user?.subscriptionStatus === 'active' || session?.user?.subscriptionStatus === 'trialing') && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <Star size={20} className="text-yellow-400" />
                            Lascia una Recensione
                        </h2>

                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            {/* Star Rating */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    La tua valutazione
                                </label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewRating(star)}
                                            className="p-1 transition-transform hover:scale-110"
                                        >
                                            <Star
                                                size={28}
                                                className={star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Review Content */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    La tua recensione
                                </label>
                                <textarea
                                    value={reviewContent}
                                    onChange={(e) => setReviewContent(e.target.value)}
                                    placeholder="Racconta la tua esperienza con DIRAMCO..."
                                    rows={4}
                                    maxLength={500}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">{reviewContent.length}/500 caratteri</p>
                            </div>

                            {reviewMessage && (
                                <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${reviewMessage.type === 'success' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                                    {reviewMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                    {reviewMessage.text}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isReviewLoading}
                                className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isReviewLoading ? (
                                    "Invio in corso..."
                                ) : (
                                    <>
                                        <Star size={18} />
                                        {hasExistingReview ? 'Aggiorna Recensione' : 'Pubblica Recensione'}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* Contact Support Section */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Mail size={20} />
                        Contatta il Supporto
                    </h2>

                    <form onSubmit={handleContactSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Oggetto
                            </label>
                            <input
                                type="text"
                                required
                                value={contactSubject}
                                onChange={(e) => setContactSubject(e.target.value)}
                                placeholder="Es. Problema con il pagamento"
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Messaggio
                            </label>
                            <textarea
                                required
                                value={contactMessage}
                                onChange={(e) => setContactMessage(e.target.value)}
                                placeholder="Descrivi la tua richiesta..."
                                rows={4}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                            />
                        </div>

                        {contactStatus && (
                            <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${contactStatus.type === 'success' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                                {contactStatus.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                {contactStatus.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isContactLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isContactLoading ? (
                                "Invio in corso..."
                            ) : (
                                <>
                                    <Mail size={18} />
                                    Invia Messaggio
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
