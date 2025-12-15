"use client"

import { formatCurrency } from "@/lib/format-utils"

export function InsiderTab({ data }: { data: any[] }) {
    if (!data || data.length === 0) return <div className="p-4 text-gray-400">Nessun dato di insider trading disponibile.</div>

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">Data</th>
                            <th className="px-6 py-3">Nome</th>
                            <th className="px-6 py-3">Tipo</th>
                            <th className="px-6 py-3 text-right">Azioni</th>
                            <th className="px-6 py-3 text-right">Prezzo</th>
                            <th className="px-6 py-3 text-right">Valore</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {data.map((trade, i) => {
                            const isBuy = trade.acquistionOrDisposition === "A" || trade.transactionType?.includes("Buy")
                            const value = trade.securitiesTransacted * trade.price

                            return (
                                <tr key={i} className="hover:bg-gray-800/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                        {trade.transactionDate}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-white">
                                        {trade.reportingName}
                                        <div className="text-xs text-gray-500 font-normal">{trade.typeOfOwner}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${isBuy ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                            {isBuy ? "Acquisto" : "Vendita"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-300">
                                        {trade.securitiesTransacted.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-300">
                                        {formatCurrency(trade.price)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-white">
                                        {formatCurrency(value)}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
