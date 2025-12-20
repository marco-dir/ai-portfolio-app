"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { EquityData } from '@/lib/data-fetcher'

interface Props {
    data: EquityData[]
}

export default function DiramcoEquityChart({ data }: Props) {
    return (
        <div className="w-full h-[500px] bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
            <div className="mb-6 text-center">
                <h3 className="text-xl font-bold text-white mb-2">DIRAMCO Equity Line</h3>
                <p className="text-gray-400 text-sm">Andamento storico del valore della quota (Base 100)</p>
            </div>

            <ResponsiveContainer width="100%" height="100%" minHeight={400}>
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
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
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />

                    <Line
                        type="monotone"
                        dataKey="EUR"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                        activeDot={{ r: 8 }}
                        name="DIRAMCO (EUR)"
                    />
                    <Line
                        type="monotone"
                        dataKey="USD"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                        activeDot={{ r: 8 }}
                        name="DIRAMCO (USD)"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
