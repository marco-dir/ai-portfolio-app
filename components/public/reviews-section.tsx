"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"

interface Review {
    id: string
    rating: number
    content: string
    createdAt: string
    user: {
        name: string | null
        email: string
    }
}

export default function ReviewsSection() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch('/api/reviews')
                if (res.ok) {
                    const data = await res.json()
                    setReviews(data)
                }
            } catch (error) {
                console.error('Error fetching reviews:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchReviews()
    }, [])

    if (loading) return null
    if (reviews.length === 0) return null

    // Calculate average rating
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

    return (
        <section className="relative z-10 py-24 px-8 bg-gray-900/30">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4">Cosa dicono i nostri utenti</h2>
                    <div className="flex items-center justify-center gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={24}
                                className={star <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
                            />
                        ))}
                    </div>
                    <p className="text-gray-400 text-lg">
                        {avgRating.toFixed(1)} stelle su 5 • {reviews.length} recension{reviews.length === 1 ? 'e' : 'i'}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.slice(0, 6).map((review) => (
                        <div
                            key={review.id}
                            className="p-6 bg-gray-900/60 border border-gray-800 rounded-2xl hover:border-yellow-500/30 transition-all"
                        >
                            {/* Stars */}
                            <div className="flex gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={16}
                                        className={star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
                                    />
                                ))}
                            </div>

                            {/* Content */}
                            <p className="text-gray-300 mb-4 line-clamp-4">"{review.content}"</p>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {(review.user.name || review.user.email)[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-white">
                                        {review.user.name || review.user.email.split('@')[0]}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(review.createdAt).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
