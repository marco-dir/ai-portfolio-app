
"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [message, setMessage] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus("loading")

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            if (!res.ok) throw new Error("Qualcosa è andato storto")

            setStatus("success")
            setMessage("Se l'email è registrata, riceverai a breve un link per reimpostare la password.")
        } catch (error) {
            setStatus("error")
            setMessage("Si è verificato un errore. Riprova più tardi.")
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-950 px-4 relative">
            <Link href="/accedi" className="absolute top-8 left-8 text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Torna al Login
            </Link>
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-xl shadow-2xl border border-gray-800">
                <h2 className="text-3xl font-bold text-center text-white">Password Dimenticata</h2>

                {status === "success" ? (
                    <div className="bg-green-500/10 border border-green-500 text-green-500 p-4 rounded-lg text-center">
                        {message}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <p className="text-gray-400 text-center text-sm">
                            Inserisci la tua email e ti invieremo le istruzioni per reimpostare la password.
                        </p>
                        {status === "error" && (
                            <div className="text-red-500 text-sm text-center">{message}</div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 mt-1 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className="w-full py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {status === "loading" ? "Invio in corso..." : "Invia Link di Reset"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
