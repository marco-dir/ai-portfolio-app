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

async function search(query) {
    const url = `https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(query)}&limit=10&apikey=${FMP_API_KEY}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log(`Query: "${query}" -> Found: ${data.length}`);
        data.forEach(d => console.log(` - ${d.symbol} (${d.name}) [${d.currency}]`));
    } catch (e) { console.log(e.message); }
}

async function test() {
    await search('Bund');
    await search('Germany 10Y');
    await search('BTP');
    await search('Italy 10Y');
    await search('VSTOXX');
    await search('Euro Stoxx 50 Volatility');
    await search('UK 10Y');
    await search('Gilt');
}

test();
