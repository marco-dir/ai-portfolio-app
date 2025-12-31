"use client";

import { Download } from "lucide-react";

interface User {
    id: string;
    email: string;
    name: string | null;
    role: string;
    subscriptionStatus: string | null;
    trialEndsAt: string | null;
    createdAt: string;
    newsletterSubscribed: boolean;
}

export function ExportUsersButton({ users }: { users: User[] }) {
    const exportToCSV = () => {
        // Create CSV content
        const headers = ["Email", "Nome", "Ruolo", "Stato Abbonamento", "Scadenza Prova", "Data Registrazione", "Newsletter"];

        const rows = users.map(user => [
            user.email,
            user.name || "-",
            user.role,
            user.subscriptionStatus === 'active' ? 'Attivo' :
                user.subscriptionStatus === 'trialing' ? 'Periodo di Prova' :
                    user.subscriptionStatus === 'past_due' ? 'Scaduto' :
                        user.subscriptionStatus === 'canceled' ? 'Cancellato' : 'Inattivo',
            user.trialEndsAt ? new Date(user.trialEndsAt).toLocaleDateString('it-IT') : '-',
            new Date(user.createdAt).toLocaleDateString('it-IT'),
            user.newsletterSubscribed ? 'Iscritto' : 'Non iscritto'
        ]);

        // Create CSV string with BOM for Excel UTF-8 compatibility
        const csvContent = "\uFEFF" + [
            headers.join(";"),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(";"))
        ].join("\n");

        // Create download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `utenti_diramco_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
        >
            <Download size={18} />
            Esporta Excel
        </button>
    );
}
