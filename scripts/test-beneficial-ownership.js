const fs = require('fs');
const path = require('path');

async function main() {
    let apiKey = process.env.FMP_API_KEY;

    if (!apiKey) {
        try {
            const envPath = path.resolve(__dirname, '../.env');
            if (fs.existsSync(envPath)) {
                const envContent = fs.readFileSync(envPath, 'utf8');
                const match = envContent.match(/FMP_API_KEY=(.*)/);
                if (match) {
                    apiKey = match[1].trim().replace(/^["']|["']$/g, ''); // Remove quotes
                }
            }
        } catch (e) {
            console.error('Error reading .env:', e.message);
        }
    }

    if (!apiKey) {
        console.error('Could not load FMP_API_KEY');
        return;
    }

    const symbol = 'AAPL';
    const url = `https://financialmodelingprep.com/api/v4/insider/ownership/acquisition_of_beneficial_ownership?symbol=${symbol}&apikey=${apiKey}`;

    console.log(`Fetching from: ${url}`);

    try {
        const res = await fetch(url);
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`${res.status} ${res.statusText}: ${text}`);
        }
        const data = await res.json();

        console.log(`Records found: ${data.length}`);
        if (data.length > 0) {
            console.log('First record structure:', JSON.stringify(data[0], null, 2));
        }
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

main();
