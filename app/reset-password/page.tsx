
"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ResetPasswordPage() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const router = useRouter()

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [message, setMessage] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setStatus("error")
            setMessage("Le password non coincidono")
            return
        }

        if (password.length < 6) {
            setStatus("error")
            setMessage("La password deve essere di almeno 6 caratteri")
            return
        }

        setStatus("loading")

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            })

            if (!res.ok) {
                const text = await res.text()
                throw new Error(text || "Errore durante il reset")
            }

            setStatus("success")
            setMessage("Password aggiornata con successo! Reindirizzamento al login...")
            setTimeout(() => router.push("/login"), 3000)
        } catch (error: any) {
            setStatus("error")
            setMessage(error.message)
        }
    }

    if (!token) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
                Token mancante. Riprova dal link nella tua email.
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-950 px-4">
            <Link href="/login" className="absolute top-8 left-8 text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Torna al Login
            </Link>
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-xl shadow-2xl border border-gray-800">
                <h2 className="text-3xl font-bold text-center text-white">Reimposta Password</h2>

                {status === "success" ? (
                    <div className="bg-green-500/10 border border-green-500 text-green-500 p-4 rounded-lg text-center">
                        {message}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {status === "error" && (
                            <div className="text-red-500 text-sm text-center">{message}</div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Nuova Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 mt-1 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Conferma Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 mt-1 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className="w-full py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {status === "loading" ? "Aggiornamento..." : "Aggiorna Password"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
