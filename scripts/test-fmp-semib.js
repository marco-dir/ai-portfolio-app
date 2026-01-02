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
    const url = `${BASE_URL}${endpoint}?apikey=${FMP_API_KEY}`;
    console.log(`Fetching: ${endpoint}`);
    try {
        const res = await fetch(url);
        const data = await res.json();
        const snippet = JSON.stringify(data, null, 2).slice(0, 500);
        console.log(`Response:\n${snippet}`);
    } catch (e) {
        console.error(e);
    }
}

async function test() {
    console.log('--- Testing Italian Indices ---');
    await fetchFMP('/quote/FTSEMIB.MI');
    await fetchFMP('/quote/^FTSEMIB');
    await fetchFMP('/search?query=FTSE MIB');
}

test();
