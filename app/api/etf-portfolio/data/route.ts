import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";

// --- CONFIGURATION ---
const SPREADSHEET_ID = '1rA2S6V5Hrr53x4jXszN9jim4y9U7vZlTlocyYLgTA5Y'; // ETF Portfolio Sheet
// ---------------------

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const gid = searchParams.get('gid') || '0';

    const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${gid}`;

    try {
        const response = await fetch(csvUrl);

        if (!response.ok) {
            if (response.status === 403) {
                // Trying to access a private sheet without auth
                return NextResponse.json({ error: 'SHEET_PRIVATE' }, { status: 403 });
            }
            return NextResponse.json({ error: `Failed to fetch CSV: ${response.statusText}` }, { status: response.status });
        }

        const csvText = await response.text();

        // Check for explicit sign-in redirect (HTML content instead of CSV)
        if (csvText.includes("<!DOCTYPE html") || csvText.includes("<html")) {
            return NextResponse.json({ error: 'SHEET_PRIVATE' }, { status: 403 });
        }

        const parsed = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
        });

        if (parsed.errors.length > 0) {
            return NextResponse.json({ error: 'CSV Parsing Error', details: parsed.errors }, { status: 500 });
        }

        return NextResponse.json({ data: parsed.data });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
