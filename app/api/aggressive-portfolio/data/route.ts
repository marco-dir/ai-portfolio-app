import { NextResponse } from 'next/server'

// Aggressivo Portfolio Sheet ID
const SHEET_ID = '1lPjBmL0g2Og_L1IJ36vvOmYSO5vg6bMjNYpp9j580TE'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const gid = searchParams.get('gid')

    if (!gid) {
        return NextResponse.json({ error: 'Missing GID parameter' }, { status: 400 })
    }

    try {
        const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`
        console.log(`[Aggressive Portfolio] Fetching CSV from: ${csvUrl}`)

        const response = await fetch(csvUrl, {
            cache: 'no-store',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; PortfolioApp/1.0)'
            }
        })

        if (!response.ok) {
            console.error(`[Aggressive Portfolio] Fetch failed with status: ${response.status}`)
            if (response.status === 403) {
                return NextResponse.json({ error: 'SHEET_PRIVATE' }, { status: 403 })
            }
            return NextResponse.json({ error: 'Failed to fetch CSV' }, { status: response.status })
        }

        const csvText = await response.text()

        // --- Robust CSV Parser (handles quoted fields and newlines) ---
        const rows: any[] = []
        const lines = csvText.split(/\r?\n/)

        // Heuristic: Identify header row. Usually the first non-empty row.
        let headerRowIndex = -1
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().length > 0) {
                headerRowIndex = i
                break
            }
        }

        if (headerRowIndex === -1) {
            return NextResponse.json({ data: [] })
        }

        // Helper to split CSV line respecting quotes
        const parseLine = (line: string) => {
            const result = []
            let current = ''
            let inQuotes = false

            for (let i = 0; i < line.length; i++) {
                const char = line[i]
                if (char === '"') {
                    inQuotes = !inQuotes
                } else if (char === ',' && !inQuotes) {
                    result.push(current.trim())
                    current = ''
                } else {
                    current += char
                }
            }
            result.push(current.trim())
            return result
        }

        // Parse headers
        const headers = parseLine(lines[headerRowIndex]).map(h => h.replace(/^"|"$/g, '').trim()) // Remove outer quotes if any
        console.log('[Aggressive Portfolio] Headers:', headers)

        for (let i = headerRowIndex + 1; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) continue

            const values = parseLine(line)

            // Skip empty rows (sometimes trailing commas remain)
            if (values.every(v => !v)) continue

            const rowData: Record<string, string> = {}
            headers.forEach((header, index) => {
                // Clean value: remove outer quotes
                let val = values[index] || ''
                val = val.replace(/^"|"$/g, '')
                rowData[header] = val
            })

            rows.push(rowData)
        }

        return NextResponse.json({ data: rows })

    } catch (error) {
        console.error('[Aggressive Portfolio] API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
