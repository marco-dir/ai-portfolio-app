export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8 min-h-screen animate-pulse">
            <div className="mb-8">
                <div className="h-10 w-96 bg-gray-800 rounded mb-2"></div>
                <div className="h-5 w-2/3 bg-gray-800 rounded"></div>
            </div>

            <div className="mb-8">
                <div className="h-12 w-full max-w-2xl bg-gray-800 rounded-lg"></div>
            </div>

            <div className="mt-8 space-y-6">
                {/* Company Overview Skeleton */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="h-8 w-48 bg-gray-800 rounded mb-2"></div>
                            <div className="h-5 w-32 bg-gray-800 rounded"></div>
                        </div>
                        <div className="text-right">
                            <div className="h-8 w-24 bg-gray-800 rounded mb-2"></div>
                            <div className="h-5 w-16 bg-gray-800 rounded ml-auto"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-20 bg-gray-800 rounded-lg"></div>
                        ))}
                    </div>
                </div>

                {/* Chart Skeleton */}
                <div className="h-96 bg-gray-900 border border-gray-800 rounded-xl"></div>

                {/* Score Skeleton */}
                <div className="h-40 bg-gray-900 border border-gray-800 rounded-xl"></div>

                {/* Indicators Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="h-24 bg-gray-900 border border-gray-800 rounded-xl"></div>
                    ))}
                </div>
            </div>
        </div>
    )
}
