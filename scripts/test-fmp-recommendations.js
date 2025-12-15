const https = require('https');

const apiKey = process.env.FMP_API_KEY;
const symbol = 'AAPL';

if (!apiKey) {
    console.error('Please set FMP_API_KEY environment variable');
    process.exit(1);
}

const url = `https://financialmodelingprep.com/api/v3/analyst-stock-recommendations/${symbol}?limit=5&apikey=${apiKey}`;

https.get(url, (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
        data += chunk;
    });

    resp.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log("Response data for", symbol, ":");
            console.log(JSON.stringify(json[0], null, 2));
        } catch (e) {
            console.error("Error parsing JSON:", e.message);
        }
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});
