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

async function test() {
    const url = `https://financialmodelingprep.com/api/v4/institutional-ownership/portfolio-holdings?cik=0001067983&date=2025-09-30&apikey=${FMP_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data && data.length > 0) {
        console.log('First item keys:', Object.keys(data[0]));
        console.log('First 2 items:', JSON.stringify(data.slice(0, 2), null, 2));
    } else {
        console.log('Raw response:', data);
    }
}

test();
