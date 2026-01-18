export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8 min-h-screen animate-pulse">
            <div className="flex flex-col gap-6">
                {/* Page Header */}
                <div>
                    <div className="h-9 w-64 bg-gray-800 rounded mb-2"></div>
                    <div className="h-5 w-96 bg-gray-800 rounded"></div>
                </div>

                {/* Search Bar */}
                <div className="w-full max-w-2xl">
                    <div className="h-12 w-full bg-gray-800 rounded-lg"></div>
                </div>

                <div className="h-4 w-3/4 bg-gray-800 rounded mt-2"></div>

                {/* Company Header Skeleton */}
                <div className="mt-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg bg-gray-800"></div>
                            <div>
                                <div className="h-8 w-48 bg-gray-800 rounded mb-2"></div>
                                <div className="flex gap-2">
                                    <div className="h-5 w-20 bg-gray-800 rounded"></div>
                                    <div className="h-5 w-24 bg-gray-800 rounded"></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="h-8 w-32 bg-gray-800 rounded"></div>
                            <div className="h-5 w-24 bg-gray-800 rounded"></div>
                        </div>
                    </div>
                </div>

                {/* Tabs Skeleton */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-10 w-32 bg-gray-800 rounded-lg shrink-0"></div>
                    ))}
                </div>

                {/* Content Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <div className="h-96 bg-gray-900/50 rounded-xl border border-gray-800"></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-32 bg-gray-900/50 rounded-xl border border-gray-800"></div>
                            <div className="h-32 bg-gray-900/50 rounded-xl border border-gray-800"></div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="h-64 bg-gray-900/50 rounded-xl border border-gray-800"></div>
                        <div className="h-64 bg-gray-900/50 rounded-xl border border-gray-800"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
