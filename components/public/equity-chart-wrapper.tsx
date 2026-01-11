import { Suspense } from "react"
import DiramcoEquityChart from "@/components/public/diramco-equity-chart"
import { fetchEquityData } from "@/lib/data-fetcher"

export default async function EquityChartWrapper() {
    const equityData = await fetchEquityData()
    return <DiramcoEquityChart data={equityData} />
}
