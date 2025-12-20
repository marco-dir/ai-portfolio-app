"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Data from Google Sheet
const data = [
    {
        year: '2024',
        'Conservativo': 2.87,
        'Moderato': 5.78,
        'Aggressivo': 10.05,
        'Dividendi': 9.14,
        'ETF': 22.65,
        'DIRAMCO': 16.36,
    },
    {
        year: '2025',
        'Conservativo': 3.29,
        'Moderato': 8.09,
        'Aggressivo': 9.35,
        'Dividendi': 16.20,
        'ETF': 10.34,
        'DIRAMCO': 3.70,
    },
]

export default function PortfoliosChart() {
    return (
        <div className="w-full h-[500px] bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis
                        dataKey="year"
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af' }}
                        tickLine={{ stroke: '#9ca3af' }}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af' }}
                        tickLine={{ stroke: '#9ca3af' }}
                        unit="%"
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: any) => [`${value}%`]}
                        cursor={{ fill: '#374151', opacity: 0.2 }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />

                    <Bar dataKey="Conservativo" fill="#3b82f6" name="Conservativo" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Moderato" fill="#8b5cf6" name="Moderato" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Aggressivo" fill="#ef4444" name="Aggressivo" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Dividendi" fill="#10b981" name="Dividendi" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ETF" fill="#f59e0b" name="ETF" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="DIRAMCO" fill="#6366f1" name="DIRAMCO" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
