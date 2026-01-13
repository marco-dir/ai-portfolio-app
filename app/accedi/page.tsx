"use client"

import Image from "next/image"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        })

        if (result?.error) {
            setError("Invalid credentials")
            setError("Credenziali non valide")
        } else {
            router.push("/dashboard")
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-950 px-4 relative">
            <Link href="/" className="absolute top-8 right-8 text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Torna alla Home
            </Link>
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-xl shadow-2xl border border-gray-800">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center">
                        <Image
                            src="/diramco-logo.png"
                            alt="Diramco Logo"
                            width={64}
                            height={64}
                            className="w-full h-full object-cover scale-150"
                            priority
                        />
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-center text-white">Bentornato</h2>
                {error && <p className="text-red-500 text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <div className="flex justify-end">
                        <Link
                            href="/password-dimenticata"
                            className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                        >
                            Password dimenticata?
                        </Link>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Accedi
                    </button>
                </form>
                <p className="text-center text-gray-400">
                    Non hai un account?{" "}
                    <Link href="/registrati" className="text-blue-400 hover:underline">
                        Registrati
                    </Link>
                </p>
            </div>
        </div>
    )
}
