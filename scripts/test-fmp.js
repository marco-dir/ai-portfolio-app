
const fs = require('fs');
const path = require('path');

// Manually read .env
const envPath = path.join(__dirname, '../.env');
let apiKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/FMP_API_KEY=(.*)/);
    if (match && match[1]) {
        apiKey = match[1].trim();
    }
} catch (e) {
    console.error('Could not read .env:', e.message);
}

if (!apiKey) {
    console.error('FMP_API_KEY not found in .env');
    process.exit(1);
}

const symbol = 'AAPL';
// Test 'monthly' which is the goal
const url = `https://financialmodelingprep.com/api/v3/ratios/${symbol}?period=monthly&limit=5&apikey=${apiKey}`;

console.log(`Fetching: ${url.replace(apiKey, 'HIDDEN')}`);

fetch(url)
    .then(res => res.json())
    .then(data => {
        // FMP often returns error message in JSON or empty array if invalid period
        if (Array.isArray(data)) {
            console.log(`Received array with ${data.length} items`);
            if (data.length > 0) {
                console.log('First item:', JSON.stringify(data[0], null, 2));
            }
        } else {
            console.log('Received object:', JSON.stringify(data, null, 2));
        }
    })
    .catch(err => console.error('Error:', err));
