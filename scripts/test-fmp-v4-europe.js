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
const BASE_URL_V4 = "https://financialmodelingprep.com/api/v4";

async function fetchV4(name, country) {
    // url: v4/economic?name=name&country=country
    // or try without name?

    let url = `${BASE_URL_V4}/economic?apikey=${FMP_API_KEY}`;
    if (name) url += `&name=${encodeURIComponent(name)}`;
    if (country) url += `&country=${encodeURIComponent(country)}`;

    console.log(`Fetching V4: ${name} (${country})...`);
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
            console.log(`[SUCCESS] Found ${data.length} records. Latest:`, data[0]);
        } else {
            // console.log(`[FAIL] No data`);
        }
    } catch (e) { console.error(e.message); }
}

async function test() {
    const indicators = ['GDP', 'CPI', 'Unemployment Rate', 'Interest Rate', 'Inflation Rate', 'HICP'];
    const countries = ['Germany', 'Italy', 'United Kingdom', 'Euro Area', 'France', 'EU'];

    // 1. Try V4 with country param
    for (const ind of indicators) {
        for (const c of countries) {
            await fetchV4(ind, c);
        }
    }

    // 2. Try to just search for anything 'Germany'
    // This is hard without a search endpoint.

    // 3. Try fetching a known key if documentation suggests.
    // Documentation says "name" is required.
    // Potential names: "GDP Growth Rate", "Harmonised Unemployment Rate", etc.

    const specificNames = [
        'German ZEW Economic Sentiment',
        'ZEW Economic Sentiment',
        'Euro Area Inflation Rate',
        'European Union GDP Growth Rate'
    ];

    for (const name of specificNames) {
        await fetchV4(name, null);
    }
}

test();
