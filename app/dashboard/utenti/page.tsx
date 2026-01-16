import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ExportUsersButton } from "@/components/admin/export-users-button"

export default async function UsersPage() {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        redirect("/dashboard")
    }

    const users = await prisma.user.findMany({
        include: {
            review: true
        },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">Utenti Registrati ({users.length})</h1>
                <ExportUsersButton users={JSON.parse(JSON.stringify(users))} />
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-950 text-gray-400 border-b border-gray-800">
                        <tr>
                            <th className="p-4 font-medium whitespace-nowrap">Email</th>
                            <th className="p-4 font-medium whitespace-nowrap">Nome</th>
                            <th className="p-4 font-medium whitespace-nowrap">Cognome</th>
                            <th className="p-4 font-medium whitespace-nowrap">Ruolo</th>
                            <th className="p-4 font-medium whitespace-nowrap">Stato Abbonamento</th>
                            <th className="p-4 font-medium whitespace-nowrap">Scadenza Prova</th>
                            <th className="p-4 font-medium whitespace-nowrap">Data Registrazione</th>
                            <th className="p-4 font-medium whitespace-nowrap">Newsletter</th>
                            <th className="p-4 font-medium whitespace-nowrap">Recensione</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {users.map(user => (
                            <tr key={user.id} className="text-gray-300 hover:bg-gray-800/50 transition-colors">
                                <td className="p-4 font-medium text-white">{user.email}</td>
                                <td className="p-4">{user.name || '-'}</td>
                                <td className="p-4">{user.surname || '-'}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.subscriptionStatus === 'active' ? 'bg-green-500/20 text-green-400' :
                                        user.subscriptionStatus === 'trialing' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-gray-700 text-gray-400'
                                        }`}>
                                        {user.subscriptionStatus === 'active' ? 'Attivo' :
                                            user.subscriptionStatus === 'trialing' ? 'Periodo di Prova' :
                                                user.subscriptionStatus === 'past_due' ? 'Scaduto' :
                                                    user.subscriptionStatus === 'canceled' ? 'Cancellato' :
                                                        'Inattivo'}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-gray-400">
                                    {user.trialEndsAt ? new Date(user.trialEndsAt).toLocaleDateString('it-IT') : '-'}
                                </td>
                                <td className="p-4 text-sm text-gray-400">
                                    {new Date(user.createdAt).toLocaleDateString('it-IT', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.newsletterSubscribed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                        }`}>
                                        {user.newsletterSubscribed ? 'Iscritto' : 'Non iscritto'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {user.review ? (
                                        <span className="flex items-center gap-1 text-yellow-400">
                                            {user.review.rating} <span className="text-xs">★</span>
                                        </span>
                                    ) : (
                                        <span className="text-gray-600">-</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
