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

async function fetchEconomic(name) {
    if (!FMP_API_KEY) return;
    const url = `${BASE_URL_V4}/economic?name=${name}&apikey=${FMP_API_KEY}`;
    console.log(`Fetching ${name}...`);
    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.log(`Error ${res.status}`);
            return null;
        }
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
            console.log(`Found ${data.length} records for ${name}. Latest:`, JSON.stringify(data[0], null, 2));
            return data;
        } else {
            console.log(`No data for ${name}`);
            return null;
        }
    } catch (e) {
        console.error(e);
        return null;
    }
}

async function test() {
    // List of potential FMP economic indicator names to test
    // Based on documentation or common names
    const indicators = [
        'CPI', // Consumer Price Index
        'PPI', // Producer Price Index
        'consumerSentiment', // Consumer Confidence?
        'unemploymentRate',
        'GDP',
        'federalFunds',
        'ISM', // PMI?
        'manufacturingPMI',
        'servicesPMI',
        'retailSales',
        'durableGoods',
        'housingStarts',
        'industrialProduction',
        'consumerConfidence'
    ];

    for (const ind of indicators) {
        await fetchEconomic(ind);
    }

    // Also check Treasury
    console.log('\nFetching Treasury Rates...');
    const tUrl = `${BASE_URL_V4}/treasury?apikey=${FMP_API_KEY}`;
    const tRes = await fetch(tUrl);
    const tData = await tRes.json();
    if (tData && tData.length > 0) console.log('Treasury Data Found:', tData[0]);

}

test();
