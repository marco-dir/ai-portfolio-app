export interface EquityData {
    year: string;
    EUR: number;
    USD: number;
}

const SHEET_ID = '1D_hPCrPfAMxq6hvfclIuGI-6ti3ZmR39JCIv_CbI-Lc'; // Diramco Portfolio Sheet
const GID = '141458487';

export async function fetchEquityData(): Promise<EquityData[]> {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

    try {
        const response = await fetch(url, { next: { revalidate: 60 } });
        if (!response.ok) {
            // Log detailed error for debugging
            console.error(`Fetch failed for ${url}: ${response.status} ${response.statusText}`);
            throw new Error(`Failed to fetch sheet data: ${response.statusText}`);
        }
        const text = await response.text();

        // Parse CSV
        // The sheet seems to have 2 header rows. 
        // Row 1: Periodo,DIRAMCO Equity Line,
        // Row 2: Anno,EUR,USD
        // We should look for the row starting with "Anno" or just skip known headers.

        const lines = text.split(/\r?\n/);

        // Find header row index
        const headerIndex = lines.findIndex(line => line.toLowerCase().includes('anno') && line.toLowerCase().includes('eur'));

        // If not found, default to skipping the first few lines if we are unsure, 
        // but better to be safe. If we start processing from headerIndex + 1, we get data.
        const startRow = headerIndex !== -1 ? headerIndex + 1 : 2; // Default to 2 (skip 0 and 1) if not found but assuming structure

        const data: EquityData[] = lines.slice(startRow)
            .map(row => {
                // Robust CSV split for "100,64"
                // This regex matches comma separators that are NOT inside quotes
                // const parts = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
                // The above simple match might fail on complex CSVs but for this specific Google export:
                // Google exports numbers with commas in quotes: "100,64"

                // Simpler approach: split by comma, but rejoin if we split a quoted string
                // Actually, let's use a dedicated standard parse line function

                const parseLine = (line: string) => {
                    const res = [];
                    let current = '';
                    let inQuotes = false;
                    for (let i = 0; i < line.length; i++) {
                        if (line[i] === '"') {
                            inQuotes = !inQuotes;
                        } else if (line[i] === ',' && !inQuotes) {
                            res.push(current.trim());
                            current = '';
                        } else {
                            current += line[i];
                        }
                    }
                    res.push(current.trim());
                    return res;
                };

                const columns = parseLine(row);
                if (columns.length < 3) return null; // Need Year, EUR, USD

                const year = columns[0].replace(/"/g, '');
                const eurStr = columns[1];
                const usdStr = columns[2];

                if (!year || !eurStr || !usdStr) return null;

                const parseValue = (val: string) => {
                    // Remove quotes: "100,64" -> 100,64
                    const cleanVal = val.replace(/^"|"$/g, '').trim();
                    // Handle Italian format: 1.000,00 -> 1000.00
                    // Remove dots (thousands separator), replace comma with dot
                    const normalized = cleanVal.replace(/\./g, '').replace(',', '.');
                    return parseFloat(normalized);
                };

                return {
                    year,
                    EUR: parseValue(eurStr),
                    USD: parseValue(usdStr)
                };
            })
            .filter((item): item is EquityData => item !== null && !isNaN(item.EUR) && !isNaN(item.USD));

        return data;
    } catch (error) {
        console.error('Error fetching equity data:', error);
        return []; // Return empty array on error to prevent crash
    }
}
