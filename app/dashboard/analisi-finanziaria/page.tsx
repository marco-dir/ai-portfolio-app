import { Suspense } from "react"
import { FinancialAnalysisSearch } from "@/components/financial-analysis/search-bar"
import { AnalysisContent } from "@/components/financial-analysis/analysis-content"
import Loading from "./loading"

export default async function FinancialAnalysisPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const ticker = typeof params.ticker === 'string' ? params.ticker : undefined

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Analisi Finanziaria</h1>
                    <p className="text-gray-400">Analisi approfondita dei dati finanziari, valutazioni e metriche chiave.</p>
                </div>

                <FinancialAnalysisSearch initialTicker={ticker} />
                <p className="text-sm text-gray-500 mt-2 ml-1">
                    Visualizza dati storici di Conto Economico, Stato Patrimoniale, Flussi di Cassa e Key Ratios. Accedi a Valutazioni intelligenti, Calendario finanziario, Notizie in tempo reale, Stime Analisti, Insider e molto altro.
                </p>

                {ticker && (
                    <Suspense key={ticker} fallback={<Loading />}>
                        <AnalysisContent ticker={ticker} />
                    </Suspense>
                )}
            </div>
        </div>
    )
}
