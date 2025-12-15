"use client"

import { useState } from "react"
import { Lock, Save, AlertCircle, CheckCircle } from "lucide-react"

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    })

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

            <div className="max-w-xl">
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
            </div>
        </div>
    )
}
