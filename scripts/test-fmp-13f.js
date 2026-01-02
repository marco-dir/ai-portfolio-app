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
// Some 13F endpoints are v4
const BASE_URL_V4 = "https://financialmodelingprep.com/api/v4";

async function fetchFMP(endpoint, version = 'v3') {
    if (!FMP_API_KEY) {
        console.error("FMP_API_KEY is missing!");
        return;
    }
    const baseUrl = version === 'v3' ? BASE_URL : BASE_URL_V4;
    const url = `${baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}apikey=${FMP_API_KEY}`;
    console.log(`Fetching: ${url.replace(FMP_API_KEY, 'HIDDEN')}`);
    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`Error: ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.error(text);
            return;
        }
        const data = await res.json();
        console.log(`Response length: ${Array.isArray(data) ? data.length : 'Object'}`);
        if (Array.isArray(data) && data.length > 0) {
            console.log('First item:', JSON.stringify(data[0], null, 2));
        } else if (!Array.isArray(data)) {
            console.log('Data:', JSON.stringify(data, null, 2).slice(0, 500));
        }
        return data;
    } catch (e) {
        console.error(e);
    }
}

async function test() {
    console.log('--- Searching for Berkshire Hathaway CIK ---');
    // Search endpoint usually is /search or /cik-search
    // Let's try to find CIK for "Berkshire Hathaway"
    // FMP usually has a mapper
    await fetchFMP('/cik-search/Berkshire Hathaway', 'v3');

    console.log('\n--- Searching for Bridgewater CIK ---');
    const bridge = await fetchFMP('/cik-search/Bridgewater', 'v3');

    // Let's assume we found CIKs. 
    // Buffett (Berkshire): 0001067983
    // Burry (Scion): 0001649339 ? Let's verify
    // Ackman (Pershing): 0001336528

    const CIK_BERKSHIRE = '0001067983';

    console.log('\n--- Fetching 13F Filings for Berkshire ---');
    // v3/13f-filing/CIK?date=YYYY-MM-DD (optional date)
    // Or just get list
    const filings = await fetchFMP(`/13f/${CIK_BERKSHIRE}`, 'v3');

    if (filings && filings.length > 0) {
        const date = filings[0].date;
        console.log(`\n--- Fetching detailed holdings for date ${date} ---`);
        // The endpoint typically returns the holdings directly if queried by date or just the latest?
        // Let's check the structure of the previous call.
    }
}

test();
