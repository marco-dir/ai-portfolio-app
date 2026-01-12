"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function RegisterPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")
    const [surname, setSurname] = useState("")
    const [error, setError] = useState("")
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, name, surname }),
            })

            if (res.ok) {
                router.push("/accedi")
            } else {
                const data = await res.json()
                setError(data.message || "Registration failed")
            }
        } catch (err) {
            setError("Qualcosa è andato storto")
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-950">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-xl shadow-2xl border border-gray-800">
                <Link href="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    Torna alla Home
                </Link>
                <h2 className="text-3xl font-bold text-center text-white">Crea Account</h2>
                {error && <p className="text-red-500 text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Nome</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 mt-1 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Cognome</label>
                            <input
                                type="text"
                                value={surname}
                                onChange={(e) => setSurname(e.target.value)}
                                className="w-full px-4 py-2 mt-1 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                    </div>
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
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 mt-1 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Registrati
                    </button>
                    <p className="text-xs text-gray-400 text-center">
                        Cliccando su Registrati, accetti i{" "}
                        <Link href="/disclaimer" className="text-blue-400 hover:underline">
                            Termini di Servizio
                        </Link>
                        {" "}e la{" "}
                        <Link href="/privacy-policy" className="text-blue-400 hover:underline">
                            Politica sulla Privacy
                        </Link>
                        .
                    </p>
                </form>
                <p className="text-center text-gray-400">
                    Hai già un account?{" "}
                    <Link href="/accedi" className="text-blue-400 hover:underline">
                        Accedi
                    </Link>
                </p>
            </div>
        </div>
    )
}
