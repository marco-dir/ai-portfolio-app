"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

export function MarketingHeader() {
    const pathname = usePathname()

    const isActive = (path: string) => pathname === path

    return (
        <nav className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-12">
                <Link href="/" className="flex items-center gap-3">
                    <Image src="/diramco-logo.png" alt="DIRAMCO Logo" width={40} height={40} className="w-10 h-10 rounded-full" />
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                        DIRAMCO
                    </div>
                </Link>
                <div className="hidden md:flex items-center gap-6">
                    {/* Chi Siamo Dropdown */}
                    <div className="relative group">
                        <Link
                            href="/chi-siamo"
                            className={`transition-colors text-sm font-medium flex items-center gap-1 ${isActive('/chi-siamo') || isActive('/missione') ? 'text-white' : 'text-gray-300 hover:text-white'
                                }`}
                        >
                            Chi Siamo
                            <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </Link>
                        <div className="absolute top-full left-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <Link
                                href="/chi-siamo"
                                className={`block px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${isActive('/chi-siamo') ? 'text-white bg-gray-800' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                                    }`}
                            >
                                Chi Siamo
                            </Link>
                            <Link
                                href="/missione"
                                className={`block px-4 py-3 text-sm font-medium rounded-b-lg transition-colors ${isActive('/missione') ? 'text-white bg-gray-800' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                                    }`}
                            >
                                Missione
                            </Link>
                        </div>
                    </div>

                    <Link
                        href="/portafogli"
                        className={`transition-colors text-sm font-medium ${isActive('/portafogli') ? 'text-white' : 'text-gray-300 hover:text-white'
                            }`}
                    >
                        Portafogli
                    </Link>
                    <Link
                        href="/strumenti"
                        className={`transition-colors text-sm font-medium ${isActive('/strumenti') ? 'text-white' : 'text-gray-300 hover:text-white'
                            }`}
                    >
                        Strumenti
                    </Link>
                    <Link
                        href="/abbonamento"
                        className={`transition-colors text-sm font-medium ${isActive('/abbonamento') ? 'text-white' : 'text-gray-300 hover:text-white'
                            }`}
                    >
                        Abbonamento
                    </Link>
                    <Link
                        href="/blog"
                        className={`transition-colors text-sm font-medium ${isActive('/blog') || pathname.startsWith('/blog/') ? 'text-white' : 'text-gray-300 hover:text-white'
                            }`}
                    >
                        Blog
                    </Link>
                    <Link
                        href="/contatti"
                        className={`transition-colors text-sm font-medium ${isActive('/contatti') ? 'text-white' : 'text-gray-300 hover:text-white'
                            }`}
                    >
                        Contatti
                    </Link>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Link
                    href="/disclaimer"
                    className="hidden md:block px-6 py-2 text-gray-300 hover:text-white transition-colors"
                >
                    Disclaimer
                </Link>
                <Link
                    href="/accedi"
                    className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
                >
                    Accedi
                </Link>
                <Link
                    href="/registrati"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-full font-medium transition-all hover:scale-105"
                >
                    Inizia Gratis
                </Link>
            </div>
        </nav>
    )
}
