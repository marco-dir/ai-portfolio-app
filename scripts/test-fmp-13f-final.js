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
    if (!FMP_API_KEY) return;
    const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}apikey=${FMP_API_KEY}`;
    console.log(`Fetching: ${url.replace(FMP_API_KEY, 'HIDDEN')}`);
    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.log(`Error ${res.status}`);
            return null;
        }
        const data = await res.json();
        return data;
    } catch (e) {
        console.error(e);
        return null;
    }
}

const SUPERINVESTORS = [
    { name: "Berkshire Hathaway (Buffett)", cik: "0001067983" },
    { name: "Bridgewater (Dalio)", cik: "0001350694" },
    { name: "Renaissance Tech (Simons)", cik: "0001037389" },
    { name: "Citadel (Griffin)", cik: "0001423053" },
    { name: "Bill & Melinda Gates", cik: "0001166559" }
];

async function test() {
    for (const inv of SUPERINVESTORS) {
        console.log(`\n--- Testing ${inv.name} [${inv.cik}] ---`);

        // Try getting list of dates first
        // /13f-filing/{cik} might return just dates?
        // Note: some docs say /rss/13f?cik=... for dates

        // Try simple /13f/{cik} expecting list
        const list = await fetchFMP(`/13f/${inv.cik}`);
        if (Array.isArray(list) && list.length > 0) {
            console.log(`FOUND DATA! ${list.length} records.`);
            console.log('Sample:', JSON.stringify(list[0], null, 2));
        } else {
            console.log('No data from /13f/{cik}. Trying /form-13f?cik=...&date=2024-09-30');
            const d = '2024-09-30';
            const holdings = await fetchFMP(`/form-13f?cik=${inv.cik}&date=${d}`);
            if (Array.isArray(holdings) && holdings.length > 0) {
                console.log(`FOUND HOLDINGS for ${d}! Count: ${holdings.length}`);
            } else {
                console.log(`No holdings for ${d}`);
            }
        }
    }

    // One last try: what if I search for "13F" in general?
    // /v4/institutional-ownership/symbol-ownership?symbol=AAPL...
    // But we want by Investor.
}

test();
