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
    // Try with no country first (US default usually)
    // Then try with &country=
    // Then try searching for name "German CPI" etc.
    if (!FMP_API_KEY) return;

    console.log(`\nTesting ${name}...`);

    // 1. Standard
    // const urlUS = `${BASE_URL_V4}/economic?name=${name}&apikey=${FMP_API_KEY}`;
    // const resUS = await fetch(urlUS);
    // const dataUS = await resUS.json();
    // console.log(`US records: ${Array.isArray(dataUS) ? dataUS.length : 'error'}`);

    // 2. With country param? (Guessing)
    /*
    const countries = ['Germany', 'Italy', 'United Kingdom', 'Euro Area', 'China'];
    for (const c of countries) {
         // Note: proper parameter might not be 'country'. FMP v4 docs are sparse.
         // Often needed to look at the list of all indicators.
         // Let's try v4/economic?name=${name}&country=${c}
         const urlC = `${BASE_URL_V4}/economic?name=${name}&country=${c}&apikey=${FMP_API_KEY}`;
         try {
            const res = await fetch(urlC);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                console.log(`[SUCCESS] ${c} ${name}: Found ${data.length} records. Latest:`, data[0]);
            } else {
               // console.log(`[FAIL] ${c} ${name}`);
            }
         } catch(e) {}
    }
    */

    // Actually, to find the specific names like "GDP" for other countries, we might need to search the list of indicators.
    // But let's try assuming the standard names work with a country list if that feature exists.
}

async function searchIndicators() {
    // There isn't a search endpoint easily accessible without documentation, 
    // but sometimes `v4/economic-calendar` or similar has country codes.
    // However, for `v4/economic`, let's try to see if we can get German CPI.

    const attempts = [
        'GDP', 'CPI', 'Unemployment Rate', 'Interest Rate'
    ];

    // Testing v3 economic indicator which is more robust for countries usually
    // https://financialmodelingprep.com/api/v3/economic-indicator/CPI?from=2020-01-01&to=2023-01-01&country=Germany&apikey=...

    const BASE_URL_V3 = "https://financialmodelingprep.com/api/v3";
    const countries = ['Germany', 'Italy', 'United Kingdom', 'Euro Area', 'France'];

    for (const ind of attempts) {
        for (const country of countries) {
            const url = `${BASE_URL_V3}/economic-indicator/${ind}?country=${country}&limit=5&apikey=${FMP_API_KEY}`;
            console.log(`Fetching v3 ${ind} for ${country}...`);
            try {
                const res = await fetch(url);
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    console.log(`SUCCESS V3: ${country} ${ind}:`, JSON.stringify(data[0], null, 2));
                } else {
                    console.log(`FAIL V3: ${country} ${ind}`);
                }
            } catch (e) { console.error(e.message); }
        }
    }
}

searchIndicators();
