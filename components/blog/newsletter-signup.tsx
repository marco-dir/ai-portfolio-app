"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export function NewsletterSignup() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) return;

        setStatus("loading");
        setMessage("");

        try {
            const res = await fetch("/api/newsletter/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage(data.message || "Iscrizione completata!");
                setEmail("");
            } else {
                setStatus("error");
                setMessage(data.error || "Errore durante l'iscrizione");
            }
        } catch (error) {
            console.error("Newsletter subscription error:", error);
            setStatus("error");
            setMessage("Errore di connessione. Riprova più tardi.");
        }
    };

    return (
        <div className="mt-12 mb-8 bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-800/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Mail className="text-blue-400" size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Iscriviti alla Newsletter</h3>
                    <p className="text-sm text-gray-400">
                        Ricevi aggiornamenti e analisi direttamente nella tua inbox
                    </p>
                </div>
            </div>

            {status === "success" ? (
                <div className="flex items-center gap-3 p-4 bg-green-900/30 border border-green-700/50 rounded-xl">
                    <CheckCircle className="text-green-400" size={20} />
                    <p className="text-green-300">{message}</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-grow">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="La tua email"
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            required
                            disabled={status === "loading"}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={status === "loading" || !email.trim()}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed rounded-xl font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        {status === "loading" ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Iscrizione...
                            </>
                        ) : (
                            "Iscriviti"
                        )}
                    </button>
                </form>
            )}

            {status === "error" && (
                <div className="flex items-center gap-3 mt-4 p-4 bg-red-900/30 border border-red-700/50 rounded-xl">
                    <AlertCircle className="text-red-400" size={20} />
                    <p className="text-red-300">{message}</p>
                </div>
            )}
        </div>
    );
}
