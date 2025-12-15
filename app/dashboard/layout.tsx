"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
    LayoutDashboard,
    PieChart,
    Star,
    LogOut,
    User,
    BarChart3,
    Menu,
    ChevronLeft,
    Lightbulb
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { data: session } = useSession()
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const navItems = [
        { label: 'Analisi Finanziaria', href: '/dashboard/financial-analysis', icon: BarChart3 },
        { label: 'Azioni Value', href: '/dashboard/fundamental-analysis', icon: Lightbulb },
        { label: 'Panoramica', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Portafogli', href: '/dashboard/portfolio', icon: PieChart },
        { label: 'Watchlist', href: '/dashboard/watchlist', icon: Star },
        { label: 'Il mio account', href: '/dashboard/settings', icon: User },
    ]

    return (
        <div className="flex min-h-screen bg-gray-950 text-white">
            {/* Sidebar */}
            <aside
                className={cn(
                    "border-r border-gray-800 p-6 flex flex-col transition-all duration-300 ease-in-out",
                    sidebarOpen ? "w-64" : "w-0 p-0 overflow-hidden"
                )}
            >
                <div className="flex items-center gap-3 mb-8 px-2">
                    <Image src="/diramco-logo.png" alt="DIRAMCO Logo" width={32} height={32} className="w-8 h-8 rounded-full" />
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                        DIRAMCO
                    </h1>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap",
                                    isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-900 hover:text-white"
                                )}
                            >
                                <Icon size={20} />
                                {item.label === "Portafogli" ? "I Miei Portafogli" : item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="pt-6 border-t border-gray-800">
                    <div className="mb-4 px-4 text-sm text-gray-500">
                        {session?.user?.email}
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="flex items-center gap-3 px-4 py-2 w-full text-gray-400 hover:text-red-400 transition-colors"
                    >
                        <LogOut size={20} />
                        Esci
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative">
                {/* Toggle Button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className={cn(
                        "fixed top-4 z-50 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-all duration-300",
                        sidebarOpen ? "left-[260px]" : "left-4"
                    )}
                    title={sidebarOpen ? "Nascondi menu" : "Mostra menu"}
                >
                    {sidebarOpen ? (
                        <ChevronLeft className="w-5 h-5 text-gray-300" />
                    ) : (
                        <Menu className="w-5 h-5 text-gray-300" />
                    )}
                </button>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
