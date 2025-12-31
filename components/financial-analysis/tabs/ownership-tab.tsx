
import { formatNumber } from "@/lib/format-utils"
import { Building2, Users2, User, PieChart } from "lucide-react"

interface OwnershipTabProps {
    institutional: any[]
    mutualFund: any[]
    beneficialOwnership?: any[]
    sharesOutstanding?: number
}

interface UnifiedHolder {
    name: string
    shares: number
    date: string
    percent: number | string
    type: 'Institutional' | 'Mutual Fund' | 'Private'
    value?: number
}

export function OwnershipTab({ institutional, mutualFund, beneficialOwnership, sharesOutstanding }: OwnershipTabProps) {
    if ((!institutional || institutional.length === 0) &&
        (!mutualFund || mutualFund.length === 0) &&
        (!beneficialOwnership || beneficialOwnership.length === 0)) {
        return (
            <div className="text-gray-400 text-center py-8 bg-gray-900 border border-gray-800 rounded-xl">
                Nessun dato sulla proprietà disponibile.
            </div>
        )
    }

    // Helper to process data: distinct by holder (keep latest date), then sort by shares (desc)
    const processData = (data: any[], nameField: string, dateField: string, sharesField: string, type: 'Institutional' | 'Mutual Fund' | 'Private'): UnifiedHolder[] => {
        if (!data) return []

        // 1. Group by holder name and keep the latest entry
        const latestByHolder = new Map();

        data.forEach(item => {
            const name = item[nameField];
            if (!name) return;

            const existing = latestByHolder.get(name);
            const itemDate = new Date(item[dateField]).getTime();

            if (!existing || itemDate > new Date(existing[dateField]).getTime()) {
                latestByHolder.set(name, item);
            }
        });

        // 2. Convert to unified format
        return Array.from(latestByHolder.values()).map((item: any) => {
            const shares = Number(item[sharesField]) || 0

            let percent: number | string = '-'
            if (sharesOutstanding) {
                percent = (shares / sharesOutstanding) * 100
            } else if (item.percentOfClass && type === 'Private') {
                percent = Number(item.percentOfClass)
            } else if (item.change) { // Fallback/Proxy if percent unknown but change present (not ideal but better than nothing or just keep -)
                // Actually relying on sharesOutstanding is best. If not present, maybe keep dash.
            }

            return {
                name: item[nameField],
                shares: shares,
                date: item[dateField],
                percent: percent, // Number or '-'
                type: type
            }
        })
    }

    // Process all and merge
    const unifiedList = [
        ...processData(institutional || [], 'holder', 'dateReported', 'shares', 'Institutional'),
        ...processData(mutualFund || [], 'holder', 'dateReported', 'shares', 'Mutual Fund'),
        ...processData(beneficialOwnership || [], 'nameOfReportingPerson', 'filingDate', 'amountBeneficiallyOwned', 'Private')
    ]

    // Deduplicate again across types? (e.g. an institution appearing in multiple lists)
    // Preference: Keep the one with higher share count or latest date?
    // Let's deduplicate by name, keeping the one with latest date.
    const uniqueUnifiedMap = new Map<string, UnifiedHolder>()
    unifiedList.forEach(item => {
        const existing = uniqueUnifiedMap.get(item.name)
        if (!existing) {
            uniqueUnifiedMap.set(item.name, item)
        } else {
            // If duplicate, keep latest date, if same date, keep higher shares
            const existingDate = new Date(existing.date).getTime()
            const itemDate = new Date(item.date).getTime()

            if (itemDate > existingDate) {
                uniqueUnifiedMap.set(item.name, item)
            } else if (itemDate === existingDate && item.shares > existing.shares) {
                uniqueUnifiedMap.set(item.name, item)
            }
        }
    })

    const finalSortedList = Array.from(uniqueUnifiedMap.values())
        .sort((a, b) => b.shares - a.shares)

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <PieChart size={20} />
                </div>
                <h3 className="text-lg font-semibold text-white">Quote Maggioritarie (Tutti gli Investitori)</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-800">
                            <th className="pb-3 text-sm font-medium text-gray-400">Detentore</th>
                            <th className="pb-3 text-sm font-medium text-gray-400">Tipo</th>
                            <th className="pb-3 text-sm font-medium text-gray-400 text-right">Azioni</th>
                            <th className="pb-3 text-sm font-medium text-gray-400 text-right">Data Report</th>
                            <th className="pb-3 text-sm font-medium text-gray-400 text-right">% Out</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {finalSortedList.slice(0, 50).map((item, i) => (
                            <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                                <td className="py-3 text-sm font-medium text-white max-w-[250px] truncate" title={item.name}>{item.name}</td>
                                <td className="py-3 text-sm text-gray-400">
                                    <span className={`px-2 py-1 rounded text-xs ${item.type === 'Private' ? 'bg-purple-500/10 text-purple-400' :
                                            item.type === 'Institutional' ? 'bg-blue-500/10 text-blue-400' :
                                                'bg-green-500/10 text-green-400'
                                        }`}>
                                        {item.type}
                                    </span>
                                </td>
                                <td className="py-3 text-sm text-gray-300 text-right">{formatNumber(item.shares)}</td>
                                <td className="py-3 text-sm text-gray-400 text-right">{new Date(item.date).toLocaleDateString('it-IT')}</td>
                                <td className="py-3 text-sm text-blue-400 text-right font-medium">
                                    {typeof item.percent === 'number' ? `${item.percent.toFixed(2)}%` : item.percent}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {finalSortedList.length === 0 && (
                <p className="text-gray-500 italic mt-4">Nessun dato disponibile.</p>
            )}
        </div>
    )
}
