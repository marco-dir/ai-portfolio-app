"use client"

interface DiramcoScoreProps {
    score: number | null
}

export function DiramcoScore({ score }: DiramcoScoreProps) {
    if (score === null) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-2">Score DIRAMCO</h3>
                <p className="text-gray-400">Non disponibile al momento</p>
            </div>
        )
    }

    // Determine color and label based on score
    let scoreColor = "#ff4444" // Red
    let scoreEmoji = "🔴"
    let scoreLabel = "Cautela"

    if (score >= 9) {
        scoreColor = "#00b300" // Dark green
        scoreEmoji = "🟢🟢"
        scoreLabel = "Eccellente"
    } else if (score >= 8) {
        scoreColor = "#00e600" // Green
        scoreEmoji = "🟢"
        scoreLabel = "Molto Buono"
    } else if (score >= 6) {
        scoreColor = "#ffd700" // Yellow
        scoreEmoji = "🟡"
        scoreLabel = "Accettabile"
    }

    return (
        <div
            className="rounded-xl p-6 border-2"
            style={{
                backgroundColor: `${scoreColor}20`,
                borderColor: scoreColor
            }}
        >
            <h2
                className="text-2xl font-bold text-center mb-2"
                style={{ color: scoreColor }}
            >
                {scoreEmoji} Score DIRAMCO: {score.toFixed(1)}/10
            </h2>
            <p className="text-center text-lg">
                Valutazione qualità Analisi Fondamentale - {scoreLabel}
            </p>
            <p className="text-center text-sm text-gray-400 mt-2">
                Indica indirettamente il MOAT del Titolo
            </p>
        </div>
    )
}
