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
        console.log(`Response length: ${Array.isArray(data) ? data.length : 'Not an array'}`);
        if (Array.isArray(data) && data.length > 0) {
            console.log('First item:', JSON.stringify(data[0], null, 2));
        } else {
            console.log('Full response:', JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error(e);
    }
}

async function test() {
    console.log('--- Testing AAPL Recommendations ---');
    await fetchFMP('/analyst-stock-recommendations/AAPL');

    console.log('--- Testing AAPL Ratings ---');
    await fetchFMP('/historical-rating/AAPL');
}

test();
