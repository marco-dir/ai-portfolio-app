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

async function fetchFMP(endpoint) {
    if (!FMP_API_KEY) return;
    const url = `${BASE_URL_V4}${endpoint}${endpoint.includes('?') ? '&' : '?'}apikey=${FMP_API_KEY}`;
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

const CIK_BERKSHIRE = '0001067983';

async function test() {
    console.log(`\n--- Testing v4 Portfolio Holdings for Berkshire [${CIK_BERKSHIRE}] ---`);
    const dates = ['2025-09-30', '2025-06-30', '2025-03-31'];

    for (const d of dates) {
        const holdings = await fetchFMP(`/institutional-ownership/portfolio-holdings?cik=${CIK_BERKSHIRE}&date=${d}`);
        if (holdings && holdings.length > 0) {
            console.log(`FOUND V4 DATA for ${d}! Count: ${holdings.length}`);
            break;
        } else {
            console.log(`No v4 data for ${d}`);
        }
    }
}

test();
