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
        // console.log(`Response length: ${Array.isArray(data) ? data.length : 'Object'}`);
        return data;
    } catch (e) {
        console.error(e);
    }
}

async function test() {
    console.log('--- Fetching Institutional Holders of AAPL ---');
    // This should list big players like Berkshire
    const holders = await fetchFMP('/institutional-holder/AAPL');

    if (Array.isArray(holders)) {
        console.log(`Found ${holders.length} holders.`);
        const berkshire = holders.find(h => h.holder.toUpperCase().includes('BERKSHIRE'));
        const vanguard = holders.find(h => h.holder.toUpperCase().includes('VANGUARD'));

        console.log('Berkshire Entry:', berkshire);
        console.log('Vanguard Entry:', vanguard); // Vanguard usually has 13F too

        // Unfortunately, this endpoint might NOT return CIK.
        // Let's force search "Berkshire Hathaway Inc" in cik-search again.
    }

    console.log('\n--- Searching CIK again ---');
    const searchRes = await fetchFMP('/cik-search/Berkshire Hathaway Inc');
    console.log('Search Results:', JSON.stringify(searchRes, null, 2));

    // Known CIK for Berkshire Hathaway Inc that files 13F is 0001067983
    // Let's try DATE based fetch using 2024-09-30 (Q3 2024)
    const CIK = '0001067983';
    console.log(`\n--- Fetching 13F for CIK ${CIK} with strict date ---`);
    // Example: /api/v3/13f/0001067983?date=2024-09-30
    // We need to know available dates first usually? 
    // FMP has RSS feed for 13F? /api/v4/rss/13f?cik=... 
    // Or /api/v3/form-13f/CIK?date=...

    // Let's try to get valid dates first if possible, or try a specific recent quarter end
    // 2024-09-30, 2024-06-30, 2023-12-31
    const dates = ['2024-09-30', '2024-06-30'];
    for (const d of dates) {
        const res = await fetchFMP(`/13f/${CIK}?date=${d}`);
        if (res && res.length > 0) {
            console.log(`Found data for ${d}! First item:`, res[0]);
            break;
        } else {
            console.log(`No data for ${d}`);
        }
    }
}

test();
