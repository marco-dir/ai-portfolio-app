"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { BarChart3, Briefcase, ChevronLeft, DollarSign, Landmark, LayoutDashboard, Lightbulb, LogOut, Menu, PieChart, Send, Star, TrendingUp, User, Users, X } from "lucide-react"
import { cn } from "@/lib/utils"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { data: session, status } = useSession()
    const router = useRouter()

    // Separate states for mobile and desktop to avoid conflicts
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true)

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false)
    }, [pathname])

    // Enforce Subscription Access
    useEffect(() => {
        if (status === "loading") return

        if (session?.user) {
            const { role, subscriptionStatus, trialEndsAt } = session.user

            // Admins bypass checks
            if (role === 'ADMIN') return

            const now = new Date()
            const trialEnd = trialEndsAt ? new Date(trialEndsAt) : null
            // Check if trial is valid
            const isTrialActive = trialEnd && trialEnd > now
            // Check if sub is active
            const isSubActive = subscriptionStatus === 'active'

            // If neither, redirect to subscription page
            // Avoid redirect loop if already on /abbonamento (handled by middleware usually, but here layout wraps dashboard)
            // But /abbonamento is PUBLIC page? No, it's often protected. 
            // Wait, /abbonamento is public in this app? 
            // The user request implies: "chi si registra può accedere alla dashboard dopo 14 giorni di prova" 
            // -> Meaning access to dashboard is restricted.
            // If I redirect to /abbonamento, that page should be accessible.
            // Let's assume /abbonamento is outside dashboard layout or I should allow it.
            // This layout is valid for /dashboard/*.

            if (!isSubActive && !isTrialActive) {
                // If user is inside dashboard, kick them out
                router.push('/abbonamento')
            }
        }
    }, [session, status, router])

    const navItems = [
        // Analisi (first 2)
        { label: 'Analisi Finanziaria', href: '/dashboard/analisi-finanziaria', icon: BarChart3 },
        { label: 'Azioni Value', href: '/dashboard/analisi-azioni-value', icon: Lightbulb },
        // I Miei Investimenti (next 3)
        { label: 'Panoramica', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Portafogli', href: '/dashboard/portafoglio', icon: PieChart },
        { label: 'La Mia Watchlist', href: '/dashboard/lista-titoli', icon: Star },
        // Portafogli (from index 5 onwards)
        { label: 'Portafoglio DIRAMCO', href: '/dashboard/portafoglio-diramco', icon: Landmark },
        { label: 'Portafoglio Conservativo', href: '/dashboard/portafoglio-conservativo', icon: Briefcase },
        { label: 'Portafoglio Moderato', href: '/dashboard/portafoglio-moderato', icon: Briefcase },
        { label: 'Portafoglio Aggressivo', href: '/dashboard/portafoglio-aggressivo', icon: TrendingUp },
        { label: 'Portafoglio Dividendi', href: '/dashboard/portafoglio-dividendi', icon: DollarSign },
        { label: 'Portafoglio ETF', href: '/dashboard/portafoglio-etf', icon: Briefcase },
        { label: 'Watchlist DIRAMCO', href: '/dashboard/lista-titoli-diramco', icon: Star },
    ]

    const SidebarContent = () => (
        <>
            <div className="flex items-center gap-3 mb-8 px-2">
                <Image src="/diramco-logo.png" alt="DIRAMCO Logo" width={32} height={32} className="w-8 h-8 rounded-full" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                    DIRAMCO
                </h1>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                {/* Section: Analisi */}
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider px-4 pt-2 pb-1">Analisi</p>
                {navItems.slice(0, 2).map((item) => {
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
                            {item.label}
                        </Link>
                    )
                })}

                {/* Section: I Miei Investimenti */}
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider px-4 pt-4 pb-1">I Miei Investimenti</p>
                {navItems.slice(2, 5).map((item) => {
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

                {/* Section: Portafogli DIRAMCO */}
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider px-4 pt-4 pb-1">Portafogli</p>
                {navItems.slice(5).map((item) => {
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
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="pt-6 border-t border-gray-800 space-y-2 mt-auto">
                {session?.user?.role === "ADMIN" && (
                    <Link
                        href="/dashboard/newsletter"
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap",
                            pathname === "/dashboard/newsletter" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-900 hover:text-white"
                        )}
                    >
                        <Send size={20} />
                        Invia Newsletter
                    </Link>
                )}
                {session?.user?.role === "ADMIN" && (
                    <Link
                        href="/dashboard/utenti"
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap",
                            pathname === "/dashboard/utenti" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-900 hover:text-white"
                        )}
                    >
                        <Users size={20} />
                        Utenti
                    </Link>
                )}
                <Link
                    href="/dashboard/impostazioni"
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap",
                        pathname === "/dashboard/impostazioni" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-900 hover:text-white"
                    )}
                >
                    <User size={20} />
                    Il mio account
                </Link>
                <div className="px-4 py-2 text-sm text-gray-500 truncate" title={session?.user?.email || ''}>
                    {session?.user?.email}
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/accedi" })}
                    className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-red-400 transition-colors"
                >
                    <LogOut size={20} />
                    Esci
                </button>
            </div>
        </>
    )

    return (
        <div className="flex min-h-screen bg-gray-950 text-white">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gray-950 border-b border-gray-800 z-40 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <Image src="/diramco-logo.png" alt="DIRAMCO Logo" width={32} height={32} className="w-8 h-8 rounded-full" />
                    <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">DIRAMCO</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 text-gray-300 hover:text-white"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar Drawer */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 bg-gray-950 border-r border-gray-800 p-6 flex flex-col transition-transform duration-300 ease-in-out md:hidden",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 text-gray-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>
                <SidebarContent />
            </aside>

            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden md:flex flex-col border-r border-gray-800 p-6 transition-all duration-300 ease-in-out sticky top-0 h-screen",
                    isDesktopSidebarOpen ? "w-72" : "w-20 px-2"
                )}
            >
                <div className={cn("flex items-center gap-3 mb-8 transition-all", !isDesktopSidebarOpen && "justify-center")}>
                    <Image src="/diramco-logo.png" alt="DIRAMCO Logo" width={32} height={32} className="w-8 h-8 rounded-full flex-shrink-0" />
                    <h1 className={cn(
                        "text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent whitespace-nowrap overflow-hidden transition-all",
                        isDesktopSidebarOpen ? "w-auto opacity-100" : "w-0 opacity-0"
                    )}>
                        DIRAMCO
                    </h1>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                    {/* Section: Analisi */}
                    {isDesktopSidebarOpen && (
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider px-4 pt-2 pb-1 transition-opacity duration-300 opacity-100">
                            Analisi
                        </p>
                    )}
                    {navItems.slice(0, 2).map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap",
                                    isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-900 hover:text-white",
                                    !isDesktopSidebarOpen && "justify-center px-2"
                                )}
                                title={!isDesktopSidebarOpen ? item.label : undefined}
                            >
                                <Icon size={20} className="flex-shrink-0" />
                                <span className={cn("transition-all", isDesktopSidebarOpen ? "opacity-100" : "w-0 opacity-0 overflow-hidden")}>
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}

                    {/* Section: I Miei Investimenti */}
                    {isDesktopSidebarOpen && (
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider px-4 pt-4 pb-1 transition-opacity duration-300 opacity-100">
                            I Miei Investimenti
                        </p>
                    )}
                    {navItems.slice(2, 5).map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap",
                                    isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-900 hover:text-white",
                                    !isDesktopSidebarOpen && "justify-center px-2"
                                )}
                                title={!isDesktopSidebarOpen ? item.label : undefined}
                            >
                                <Icon size={20} className="flex-shrink-0" />
                                <span className={cn("transition-all", isDesktopSidebarOpen ? "opacity-100" : "w-0 opacity-0 overflow-hidden")}>
                                    {item.label === "Portafogli" ? "I Miei Portafogli" : item.label}
                                </span>
                            </Link>
                        )
                    })}

                    {/* Section: Portafogli DIRAMCO */}
                    {isDesktopSidebarOpen && (
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider px-4 pt-4 pb-1 transition-opacity duration-300 opacity-100">
                            Portafogli
                        </p>
                    )}
                    {navItems.slice(5).map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap",
                                    isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-900 hover:text-white",
                                    !isDesktopSidebarOpen && "justify-center px-2"
                                )}
                                title={!isDesktopSidebarOpen ? item.label : undefined}
                            >
                                <Icon size={20} className="flex-shrink-0" />
                                <span className={cn("transition-all", isDesktopSidebarOpen ? "opacity-100" : "w-0 opacity-0 overflow-hidden")}>
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="pt-6 border-t border-gray-800 space-y-2">
                    {session?.user?.role === "ADMIN" && (
                        <Link
                            href="/dashboard/newsletter"
                            className={cn(
                                "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors whitespace-nowrap",
                                pathname === "/dashboard/newsletter" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-900 hover:text-white",
                                !isDesktopSidebarOpen && "justify-center px-2"
                            )}
                            title={!isDesktopSidebarOpen ? "Invia Newsletter" : undefined}
                        >
                            <Send size={20} className="flex-shrink-0" />
                            <span className={cn("transition-all", isDesktopSidebarOpen ? "opacity-100" : "w-0 opacity-0 overflow-hidden")}>Invia Newsletter</span>
                        </Link>
                    )}
                    {session?.user?.role === "ADMIN" && (
                        <Link
                            href="/dashboard/utenti"
                            className={cn(
                                "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors whitespace-nowrap",
                                pathname === "/dashboard/utenti" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-900 hover:text-white",
                                !isDesktopSidebarOpen && "justify-center px-2"
                            )}
                            title={!isDesktopSidebarOpen ? "Utenti" : undefined}
                        >
                            <Users size={20} className="flex-shrink-0" />
                            <span className={cn("transition-all", isDesktopSidebarOpen ? "opacity-100" : "w-0 opacity-0 overflow-hidden")}>Utenti</span>
                        </Link>
                    )}
                    <Link
                        href="/dashboard/impostazioni"
                        className={cn(
                            "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors whitespace-nowrap",
                            pathname === "/dashboard/impostazioni" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-900 hover:text-white",
                            !isDesktopSidebarOpen && "justify-center px-2"
                        )}
                        title={!isDesktopSidebarOpen ? "Il mio account" : undefined}
                    >
                        <User size={20} className="flex-shrink-0" />
                        <span className={cn("transition-all", isDesktopSidebarOpen ? "opacity-100" : "w-0 opacity-0 overflow-hidden")}>Il mio account</span>
                    </Link>

                    {isDesktopSidebarOpen && (
                        <div className="px-4 py-2 text-sm text-gray-500 truncate" title={session?.user?.email || ''}>
                            {session?.user?.email}
                        </div>
                    )}

                    <button
                        onClick={() => signOut({ callbackUrl: "/accedi" })}
                        className={cn(
                            "flex items-center gap-3 px-4 py-2 w-full text-gray-400 hover:text-red-400 transition-colors",
                            !isDesktopSidebarOpen && "justify-center px-2"
                        )}
                        title={!isDesktopSidebarOpen ? "Esci" : undefined}
                    >
                        <LogOut size={20} className="flex-shrink-0" />
                        <span className={cn("transition-all", isDesktopSidebarOpen ? "opacity-100" : "w-0 opacity-0 overflow-hidden")}>Esci</span>
                    </button>

                    {/* Desktop Toggle */}
                    <button
                        onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
                        className="w-full flex justify-center p-2 text-gray-500 hover:text-white mt-2"
                    >
                        {isDesktopSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative mt-16 md:mt-0 p-4 md:p-8">
                {children}
            </main>
        </div>
    )
}
