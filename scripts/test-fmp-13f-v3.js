const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            let value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
            process.env[key] = value;
        }
    });
}

const FMP_API_KEY = process.env.FMP_API_KEY;
const BASE_URL = "https://financialmodelingprep.com/api/v3";

async function fetchFMP(endpoint) {
    if (!FMP_API_KEY) {
        console.error("FMP_API_KEY is missing!");
        return;
    }
    const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}apikey=${FMP_API_KEY}`;
    console.log(`Fetching: ${url.replace(FMP_API_KEY, 'HIDDEN')}`);
    try {
        const res = await fetch(url);
        const data = await res.json();
        return data;
    } catch (e) {
        console.error(e);
    }
}

async function test() {
    const CIK = '0001067983'; // Berkshire
    console.log(`\n--- Fetching Available 13F Filings for CIK ${CIK} ---`);
    // Endpoint to get list of filings: /13f-filing/{cik}
    const filings = await fetchFMP(`/13f-filing/${CIK}`);

    if (Array.isArray(filings) && filings.length > 0) {
        console.log(`Found ${filings.length} filings.`);
        console.log('Latest 3 filings:', JSON.stringify(filings.slice(0, 3), null, 2));

        const latestDate = filings[0].date;
        console.log(`\n--- Fetching Holdings for Date ${latestDate} ---`);
        // Endpoint for holdings: /form-13f?cik={cik}&date={date}
        const holdings = await fetchFMP(`/form-13f?cik=${CIK}&date=${latestDate}`);

        if (Array.isArray(holdings) && holdings.length > 0) {
            console.log(`Found ${holdings.length} holdings.`);
            console.log('First 2 holdings:', JSON.stringify(holdings.slice(0, 2), null, 2));
        } else {
            console.log('No holdings found for latest date.');
            // Try backup endpoint /13f/{cik}/{date} ?
            const backupHoldings = await fetchFMP(`/13f/${CIK}/${latestDate}`);
            if (backupHoldings) console.log('Backup endpoint result:', backupHoldings.length);
        }
    } else {
        console.log('No filings list found.');
    }
}

test();
