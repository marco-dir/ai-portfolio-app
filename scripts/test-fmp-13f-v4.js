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
            console.log(`Error ${res.status}: ${await res.text()}`);
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
    // Try Q3 2024
    const d = '2024-09-30';
    const holdings = await fetchFMP(`/institutional-ownership/portfolio-holdings?cik=${CIK_BERKSHIRE}&date=${d}`);

    if (holdings && holdings.length > 0) {
        console.log(`FOUND V4 DATA for ${d}! Count: ${holdings.length}`);
    } else {
        console.log(`No v4 data for ${d}`);
    }

    console.log('\n--- Searching for available dates in v4 ---');
    // Is there a way to get dates?
    // /institutional-ownership/rss_feed?cik=...
    const rss = await fetchFMP(`/institutional-ownership/rss_feed?cik=${CIK_BERKSHIRE}`);
    if (rss && rss.length > 0) {
        console.log('RSS Feed found:', rss.length);
        console.log(JSON.stringify(rss.slice(0, 2), null, 2));
    }

    // Maybe try /standard/13f? 
    // This endpoint lists 13F filings
    console.log('\n--- Testing /standard/13f ---');
    const standard = await fetchFMP(`/standard/13f?cik=${CIK_BERKSHIRE}`);
    if (standard && standard.length > 0) {
        console.log('Standard 13F found:', standard.length);
        console.log(JSON.stringify(standard.slice(0, 2), null, 2));
    }
}

test();
