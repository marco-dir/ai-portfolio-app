import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Users, Mail, Shield, Calendar, CheckCircle, XCircle } from "lucide-react"

export default async function UsersPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/accedi?callbackUrl=/dashboard/amministrazione/utenti")
    }

    if (session.user.role !== "ADMIN") {
        return (
            <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
                <div className="bg-red-900/20 border border-red-900/50 p-6 rounded-xl max-w-md w-full text-center">
                    <h1 className="text-2xl font-bold text-red-500 mb-2">Accesso Negato</h1>
                    <p className="text-gray-400">
                        Non hai i permessi necessari per visualizzare questa pagina.
                    </p>
                </div>
            </div>
        )
    }

    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            surname: true,
            role: true,
            newsletterSubscribed: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    const totalUsers = users.length
    const adminUsers = users.filter(u => u.role === 'ADMIN').length
    const subscribedUsers = users.filter(u => u.newsletterSubscribed).length

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                    <Users className="text-blue-500" />
                    Utenti Iscritti
                </h1>
                <p className="text-gray-400 mt-2">
                    Visualizza tutti gli utenti registrati sulla piattaforma.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                        <Users className="text-blue-400" size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">{totalUsers}</p>
                        <p className="text-sm text-gray-400">Utenti Totali</p>
                    </div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                        <Shield className="text-purple-400" size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">{adminUsers}</p>
                        <p className="text-sm text-gray-400">Amministratori</p>
                    </div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 rounded-lg">
                        <Mail className="text-green-400" size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">{subscribedUsers}</p>
                        <p className="text-sm text-gray-400">Iscritti Newsletter</p>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-800 bg-gray-950">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Utente
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Ruolo
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Newsletter
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Data Iscrizione
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-white font-medium">
                                                {[user.name, user.surname].filter(Boolean).join(' ') || 'N/A'}
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                {user.email}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN'
                                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                            : 'bg-gray-700/50 text-gray-400 border border-gray-600'
                                            }`}>
                                            {user.role === 'ADMIN' && <Shield size={12} />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.newsletterSubscribed ? (
                                            <span className="inline-flex items-center gap-1.5 text-green-400">
                                                <CheckCircle size={16} />
                                                <span className="text-sm">Iscritto</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-gray-500">
                                                <XCircle size={16} />
                                                <span className="text-sm">Non iscritto</span>
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Calendar size={14} />
                                            <span className="text-sm">
                                                {new Date(user.createdAt).toLocaleDateString('it-IT', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {users.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        Nessun utente registrato.
                    </div>
                )}
            </div>
        </div>
    )
}
