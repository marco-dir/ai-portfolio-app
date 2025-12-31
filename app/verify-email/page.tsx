"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

function VerifyEmailContent() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const router = useRouter()
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
    const [message, setMessage] = useState("")

    useEffect(() => {
        if (!token) {
            setStatus("error")
            setMessage("Token mancante.")
            return
        }

        const verify = async () => {
            try {
                const res = await fetch("/api/verify-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                })

                const data = await res.json()

                if (res.ok) {
                    setStatus("success")
                    setMessage(data.message)
                    // Redirect to login after 3 seconds
                    setTimeout(() => router.push("/accedi"), 3000)
                } else {
                    setStatus("error")
                    setMessage(data.message || "Errore durante la verifica.")
                }
            } catch (error) {
                setStatus("error")
                setMessage("Si è verificato un errore imprevisto.")
            }
        }

        verify()
    }, [token, router])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-4">
            <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-xl p-8 text-center space-y-6 shadow-2xl">
                {status === "loading" && (
                    <>
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                        <h2 className="text-2xl font-bold">Verifica in corso...</h2>
                        <p className="text-gray-400">Stiamo verificando la tua email, attendi un attimo.</p>
                    </>
                )}
                {status === "success" && (
                    <>
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                        <h2 className="text-2xl font-bold">Email Verificata!</h2>
                        <p className="text-gray-400">{message}</p>
                        <p className="text-sm text-gray-500 mt-4">Verrai reindirizzato al login tra pochi secondi...</p>
                        <Link href="/accedi" className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors mt-4">
                            Vai al Login
                        </Link>
                    </>
                )}
                {status === "error" && (
                    <>
                        <XCircle className="w-12 h-12 text-red-500 mx-auto" />
                        <h2 className="text-2xl font-bold">Verifica Fallita</h2>
                        <p className="text-red-400">{message}</p>
                        <Link href="/registrati" className="inline-block px-6 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors mt-4">
                            Torna alla Registrazione
                        </Link>
                    </>
                )}
            </div>
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>}>
            <VerifyEmailContent />
        </Suspense>
    )
}
