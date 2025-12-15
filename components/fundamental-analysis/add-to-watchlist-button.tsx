"use client"

import { useState } from "react"
import { Star, Check, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface AddToWatchlistButtonProps {
    ticker: string
}

export function AddToWatchlistButton({ ticker }: AddToWatchlistButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isAdded, setIsAdded] = useState(false)
    const router = useRouter()

    const handleAddToWatchlist = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/watchlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ symbol: ticker }),
            })

            if (response.ok) {
                setIsAdded(true)
                router.refresh()
                // Reset success state after 3 seconds
                setTimeout(() => setIsAdded(false), 3000)
            } else {
                console.error('Failed to add to watchlist')
            }
        } catch (error) {
            console.error('Error adding to watchlist:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleAddToWatchlist}
            disabled={isLoading || isAdded}
            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${isAdded
                    ? "bg-green-600/20 text-green-400 border border-green-600/50"
                    : "bg-blue-600 text-white hover:bg-blue-500 border border-blue-500"
                }
            `}
        >
            {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : isAdded ? (
                <Check size={16} />
            ) : (
                <Star size={16} />
            )}
            {isAdded ? "Aggiunto" : "Aggiungi a Watchlist"}
        </button>
    )
}
