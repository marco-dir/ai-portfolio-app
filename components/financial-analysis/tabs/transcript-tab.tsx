import { ScrollText, Calendar } from "lucide-react"

export function TranscriptTab({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                <ScrollText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Nessun transcript disponibile</h3>
                <p className="text-gray-400">Non siamo riusciti a trovare transcript recenti per questo titolo.</p>
            </div>
        )
    }

    const transcript = data[0] // Latest transcript

    return (
        <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-800">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <ScrollText className="text-blue-400" size={24} />
                            Earnings Call Transcript
                        </h3>
                        <p className="text-gray-400 mt-1">
                            Q{transcript.quarter} {transcript.year} • {new Date(transcript.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-lg">
                        <span className="text-blue-400 font-medium text-sm">Trimestrale {transcript.quarter}</span>
                    </div>
                </div>

                <div className="prose prose-invert max-w-none">
                    <div className="bg-gray-950/50 rounded-lg p-6 font-mono text-sm leading-relaxed text-gray-300 whitespace-pre-wrap max-h-[800px] overflow-y-auto custom-scrollbar border border-gray-800">
                        {transcript.content}
                    </div>
                </div>

                <p className="text-xs text-center text-gray-500 mt-4">
                    Disclaimer: I transcript sono generati automaticamente e potrebbero contenere imprecisioni.
                    Fare riferimento sempre ai documenti ufficiali depositati presso la SEC.
                </p>
            </div>
        </div>
    )
}
