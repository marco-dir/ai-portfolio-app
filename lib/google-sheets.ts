// Utility functions for Google Sheets integration

export async function getDiramcoScore(ticker: string): Promise<number | null> {
    try {
        const SHEET_ID = '1cGXPRbrhanUTeEQPklLK8j_rJzG_4XAjAZmVUPcrRQc' // Watchlist DIRAMCO Sheet
        const SHEET_GID = '1613026528' // Specific GID for scores

        if (!SHEET_ID || !SHEET_GID) {
            console.warn('Google Sheets credentials not configured')
            return null
        }

        const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`

        const response = await fetch(csvUrl, { cache: 'no-store' })
        if (!response.ok) {
            throw new Error(`Failed to fetch Google Sheet: ${response.statusText}`)
        }

        const csvText = await response.text()
        const lines = csvText.split('\n')

        if (lines.length < 2) {
            return null
        }

        // Parse CSV
        const headers = lines[0].split(',')
        const tickerColumnIndex = 2 // Column C (0-indexed)
        const scoreColumnIndex = 6  // Column G (0-indexed)

        const tickerUpper = ticker.toUpperCase()

        // Search for ticker in rows
        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',')
            if (row.length > scoreColumnIndex) {
                const rowTicker = row[tickerColumnIndex]?.trim().toUpperCase()
                if (rowTicker === tickerUpper) {
                    const score = parseFloat(row[scoreColumnIndex])
                    if (!isNaN(score)) {
                        return score
                    }
                }
            }
        }

        return null
    } catch (error) {
        console.error('Error fetching DIRAMCO score:', error)
        return null
    }
}
