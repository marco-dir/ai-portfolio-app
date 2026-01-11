
const fs = require('fs');
const path = require('path');
const https = require('https');

// Read .env manually
const envPath = path.resolve(__dirname, '../.env');
let apiKey = null;
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/FMP_API_KEY=(.+)/);
    if (match) apiKey = match[1].trim();
} catch (e) {
    console.error("Could not read .env", e);
}

if (!apiKey) {
    console.log("FMP_API_KEY not found or empty");
    process.exit(1);
}

// Remove quotes if present
apiKey = apiKey.replace(/^["']|["']$/g, '');

const symbol = "AAPL";
const url = `https://financialmodelingprep.com/api/v3/historical-price-full/stock_dividend/${symbol}?apikey=${apiKey}`;

console.log(`Fetching dividends for ${symbol}... using key ending in ...${apiKey.slice(-4)}`);

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        try {
            const json = JSON.parse(data);
            if (json.historical) {
                console.log(`Found ${json.historical.length} records.`);
                const sorted = json.historical.sort((a, b) => new Date(b.date) - new Date(a.date));
                console.log("Most recent 3:", sorted.slice(0, 3));

                const currentYear = new Date().getFullYear();
                const thisYear = sorted.filter(d => new Date(d.paymentDate || d.date).getFullYear() === currentYear);
                console.log(`${currentYear} Dividends Count:`, thisYear.length);
                console.log(thisYear);
            } else {
                console.log("No 'historical' field found.");
                console.log("Response:", JSON.stringify(json, null, 2));
            }
        } catch (e) {
            console.error("Error parsing JSON:", e);
            console.log("Raw body:", data);
        }
    });
}).on('error', (e) => {
    console.error("Request Error:", e);
});
