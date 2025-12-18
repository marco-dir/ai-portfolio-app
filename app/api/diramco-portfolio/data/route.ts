import { NextResponse } from "next/server"

const SHEET_ID = '1D_hPCrPfAMxq6hvfclIuGI-6ti3ZmR39JCIv_CbI-Lc'
const DEFAULT_GID = '719610474'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const gid = searchParams.get('gid') || DEFAULT_GID

    const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`

    try {
        console.log(`Fetching Google Sheet from: ${CSV_URL}`)
        const response = await fetch(CSV_URL, {
            headers: {
                'Cache-Control': 'no-cache'
            }
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch sheet: ${response.statusText}`)
        }

        const text = await response.text()

        // Check if response is HTML (Google Login redirect)
        if (text.includes("<!doctype html>") || text.includes("<html")) {
            return NextResponse.json({
                error: "SHEET_PRIVATE",
                message: "The sheet is private. Please share it with 'Anyone with the link'."
            }, { status: 403 })
        }

        // Robust CSV Parser (handles quoted fields with commas)
        const parseCSV = (csvText: string) => {
            const rows: string[][] = []
            let currentRow: string[] = []
            let currentCell = ''
            let insideQuotes = false

            for (let i = 0; i < csvText.length; i++) {
                const char = csvText[i]
                const nextChar = csvText[i + 1]

                if (char === '"') {
                    if (insideQuotes && nextChar === '"') {
                        // Escaped quote (absolute rare in this context but good to handle)
                        currentCell += '"'
                        i++ // Skip next quote
                    } else {
                        // Toggle quote state
                        insideQuotes = !insideQuotes
                    }
                } else if (char === ',' && !insideQuotes) {
                    // Cell delimiter
                    currentRow.push(currentCell.trim())
                    currentCell = ''
                } else if (char === '\n' && !insideQuotes) {
                    // Row delimiter
                    currentRow.push(currentCell.trim())
                    if (currentRow.length > 1 || currentRow[0] !== '') { // Skip empty rows
                        rows.push(currentRow)
                    }
                    currentRow = []
                    currentCell = ''
                } else if (char === '\r') {
                    // Ignore carriage return
                    continue
                } else {
                    currentCell += char
                }
            }
            // Push last cell/row if exists
            if (currentCell || currentRow.length > 0) {
                currentRow.push(currentCell.trim())
                rows.push(currentRow)
            }
            return rows
        }

        const rows = parseCSV(text)
        const headers = rows[0]
        console.log("CSV Parsed Headers:", headers)
        const data = rows.slice(1)

        // Map headers to object keys
        const parsedData = data.map(row => {
            const obj: any = {}
            headers.forEach((header, index) => {
                // Remove quotes from header and value if present (parser handles quotes but trimming cleanup)
                const cleanHeader = header?.replace(/^"|"$/g, '').trim()
                const cleanValue = row[index]?.replace(/^"|"$/g, '')
                if (cleanHeader) obj[cleanHeader] = cleanValue
            })
            return obj
        })

        return NextResponse.json({
            headers,
            data: parsedData
        })

    } catch (error: any) {
        console.error("Sheet fetch error:", error)
        return NextResponse.json({ error: "FETCH_ERROR", message: error.message }, { status: 500 })
    }
}
