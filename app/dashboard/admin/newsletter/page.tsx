import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { NewsletterForm } from "@/components/admin/newsletter-form"

export default async function NewsletterPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login?callbackUrl=/dashboard/admin/newsletter")
    }

    if (session.user.role !== "ADMIN") {
        return (
            <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
                <div className="bg-red-900/20 border border-red-900/50 p-6 rounded-xl max-w-md w-full text-center">
                    <h1 className="text-2xl font-bold text-red-500 mb-2">Accesso Negato</h1>
                    <p className="text-gray-400">
                        Non hai i permessi necessari per visualizzare questa pagina.
                    </p>
                    <p className="text-gray-500 text-sm mt-4">
                        Il tuo ruolo attuale è: <span className="font-mono text-red-400">{session.user.role || 'USER'}</span>
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                    Invia Newsletter
                </h1>
                <p className="text-gray-400 mt-2">
                    Invia aggiornamenti a tutti gli utenti iscritti alla piattaforma.
                </p>
            </div>

            <NewsletterForm />
        </div>
    )
}
