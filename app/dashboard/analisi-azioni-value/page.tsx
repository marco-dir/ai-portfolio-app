import { Suspense } from "react"
import { FundamentalSearchBar } from "@/components/fundamental-analysis/fundamental-search-bar"
import { ValueAnalysisContent } from "@/components/fundamental-analysis/value-analysis-content"
import Loading from "./loading"

export default async function FundamentalAnalysisPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const ticker = typeof params.ticker === 'string' ? params.ticker : undefined

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                    Azioni Value e News IA
                </h1>
                <p className="text-gray-400">
                    Analisi delle Azioni approfondita secondo i principi del Value Investing interpretati da DIRAMCO e scopri le ultime notizie tramite l'Intelligenza Artificiale.
                </p>
            </div>

            <div className="mb-8">
                <Suspense fallback={<div className="text-white">Caricamento...</div>}>
                    <FundamentalSearchBar />
                </Suspense>
            </div>

            {ticker ? (
                <Suspense key={ticker} fallback={<Loading />}>
                    <ValueAnalysisContent ticker={ticker} />
                </Suspense>
            ) : (
                <div className="mt-8 text-left">
                    <p className="text-gray-400">
                        Cerca un titolo per iniziare l'analisi fondamentale delle azioni e scoprire Key Ratio, Indicatori di Performance, Indicatori di Prezzo e trend storici selezionati da DIRAMCO.
                    </p>
                </div>
            )}
        </div>
    )
}
