"use client"

import { useState } from "react"
import { formatCurrency } from "@/lib/format-utils"
import {
    LayoutDashboard,
    FileText,
    Landmark,
    Banknote,
    PieChart,
    Calculator,
    Users,
    Newspaper,
    Target,
    Calendar
} from "lucide-react"

// We'll import these as we build them. For now placeholders.
import { FinancialStatementsTab } from "./tabs/statements-tab"
import { ValuationTab } from "./tabs/valuation-tab"
import { KeyRatiosTab } from "./tabs/ratios-tab"
import { InsiderTab } from "./tabs/insider-tab"
import { EstimatesTab } from "./tabs/estimates-tab"
import { HistoricalPriceChart } from "./tabs/historical-price-chart"

export function AnalysisTabs({
    ticker,
    incomeStatement,
    balanceSheet,
    cashFlow,
    keyRatios,
    estimates,
    insiderTrades,
    stockNews,
    ratings,
    recommendations,
    historicalPrice,
    calendar,
    dividendHistory,
    quote,
    profile
}: {
    ticker: string
    incomeStatement: any
    balanceSheet: any
    cashFlow: any
    keyRatios: any
    estimates: any
    insiderTrades: any
    stockNews: any
    ratings: any
    recommendations: any
    historicalPrice: any
    calendar: any
    dividendHistory: any
    quote: any
    profile: any
}) {
    const [activeTab, setActiveTab] = useState("overview")

    const currency = profile?.currency || "USD"

    const tabs = [
        { id: "overview", label: "Panoramica", icon: LayoutDashboard },
        { id: "income", label: "Conto Economico", icon: FileText },
        { id: "balance", label: "Stato Patrimoniale", icon: Landmark },
        { id: "cashflow", label: "Flusso di Cassa", icon: Banknote },
        { id: "ratios", label: "Key Ratios", icon: PieChart },
        { id: "valuation", label: "Valutazione", icon: Calculator },
        { id: "estimates", label: "Stime", icon: Target },
        { id: "insider", label: "Insider Trading", icon: Users },
        { id: "news", label: "Notizie", icon: Newspaper },
        { id: "calendar", label: "Calendario", icon: Calendar },
    ]

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="border-b border-gray-800 overflow-x-auto">
                <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-b border-gray-700 whitespace-nowrap">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-t-lg transition-colors ${isActive
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Tabs Content */}
            <div className="min-h-[400px]">
                {activeTab === "overview" && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
                        {/* Price Chart - moved to top */}
                        <div className="bg-gray-800/50 rounded-lg p-4">
                            <HistoricalPriceChart data={historicalPrice} />
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">{profile.companyName}</h3>
                            <p className="text-gray-400 leading-relaxed">{profile.description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-gray-800">
                            <div>
                                <span className="text-sm text-gray-500 block">Settore</span>
                                <span className="text-white font-medium">{profile.sector}</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 block">Industria</span>
                                <span className="text-white font-medium">{profile.industry}</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 block">CEO</span>
                                <span className="text-white font-medium">{profile.ceo}</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 block">Sito Web</span>
                                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-words">
                                    {profile.website}
                                </a>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 block">Exchange</span>
                                <span className="text-white font-medium">{profile.exchange}</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 block">Sede</span>
                                <span className="text-white font-medium">{profile.city}, {profile.state ? `${profile.state}, ` : ''} {profile.country}</span>
                            </div>
                        </div>


                    </div>
                )}
                {activeTab === "income" && (
                    <FinancialStatementsTab data={incomeStatement} type="income" currency={currency} />
                )}
                {activeTab === "balance" && (
                    <FinancialStatementsTab data={balanceSheet} type="balance" currency={currency} />
                )}
                {activeTab === "cashflow" && (
                    <FinancialStatementsTab data={cashFlow} type="cashflow" currency={currency} />
                )}
                {activeTab === "valuation" && (
                    <ValuationTab
                        quote={quote}
                        income={incomeStatement}
                        balance={balanceSheet}
                        cashflow={cashFlow}
                        ratios={keyRatios}
                        profile={profile}
                    />
                )}
                {activeTab === "news" && (
                    <div className="grid gap-4">
                        {stockNews.map((news: any, i: number) => (
                            <div key={i} className="bg-gray-900 border border-gray-800 p-4 rounded-lg hover:bg-gray-800/80 transition cursor-pointer" onClick={() => window.open(news.url, '_blank')}>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-white text-lg line-clamp-2">{news.title}</h4>
                                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{new Date(news.publishedDate).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-gray-400 line-clamp-3 mb-2">{news.text}</p>
                                <div className="flex gap-2 text-xs text-gray-500">
                                    <span className="bg-gray-800 px-2 py-1 rounded">{news.site}</span>
                                    <span>{news.symbol}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "ratios" && (
                    <KeyRatiosTab data={keyRatios} />
                )}
                {activeTab === "insider" && (
                    <InsiderTab data={insiderTrades} />
                )}
                {activeTab === "estimates" && (
                    <EstimatesTab estimates={estimates} ratings={ratings} recommendations={recommendations} />
                )}

                {activeTab === "news" && (
                    <div className="grid gap-4">
                        {stockNews && stockNews.length > 0 ? (
                            stockNews.map((news: any, i: number) => (
                                <div key={i} className="bg-gray-900 border border-gray-800 p-4 rounded-lg hover:bg-gray-800/80 transition cursor-pointer" onClick={() => window.open(news.url, '_blank')}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-white text-lg line-clamp-2">{news.title}</h4>
                                        <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{new Date(news.publishedDate).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-400 line-clamp-3 mb-2">{news.text}</p>
                                    <div className="flex gap-2 text-xs text-gray-500">
                                        <span className="bg-gray-800 px-2 py-1 rounded">{news.site}</span>
                                        <span>{news.symbol}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-400 p-4">Nessuna notizia disponibile.</div>
                        )}
                    </div>
                )}

                {activeTab === "calendar" && (
                    <div className="space-y-6">
                        {/* Earnings Calendar */}
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Calendario Utili</h3>
                            {calendar && calendar.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-800">
                                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Data</th>
                                                <th className="text-right py-3 px-4 text-gray-400 font-medium">EPS Stimato</th>
                                                <th className="text-right py-3 px-4 text-gray-400 font-medium">EPS Reale</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {calendar.slice(0, 10).map((item: any, index: number) => (
                                                <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                                                    <td className="py-3 px-4 text-white">{new Date(item.date).toLocaleDateString('it-IT')}</td>
                                                    <td className="py-3 px-4 text-right text-white">${item.estimatedEarning?.toFixed(2) || 'N/A'}</td>
                                                    <td className="py-3 px-4 text-right text-white">${item.actualEarningResult?.toFixed(2) || 'N/A'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-400">Nessun dato disponibile per il calendario utili.</p>
                            )}
                        </div>

                        {/* Dividend History */}
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Storico Dividendi</h3>
                            {dividendHistory && dividendHistory.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-800">
                                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Data</th>
                                                <th className="text-right py-3 px-4 text-gray-400 font-medium">Dividendo</th>
                                                <th className="text-right py-3 px-4 text-gray-400 font-medium">Tipo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dividendHistory.slice(0, 20).map((item: any, index: number) => (
                                                <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                                                    <td className="py-3 px-4 text-white">{new Date(item.date).toLocaleDateString('it-IT')}</td>
                                                    <td className="py-3 px-4 text-right text-green-400 font-semibold">${item.dividend?.toFixed(4) || 'N/A'}</td>
                                                    <td className="py-3 px-4 text-right text-gray-400 text-sm">{item.label || 'Dividend'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-400">Nessun dato disponibile per lo storico dividendi.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
