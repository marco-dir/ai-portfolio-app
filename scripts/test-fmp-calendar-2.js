const https = require('https');

const apiKey = process.env.FMP_API_KEY;
const symbol = 'AAPL';

if (!apiKey) {
  console.error('Please set FMP_API_KEY environment variable');
  process.exit(1);
}

const endpoints = [
    `/historical/earning_calendar/${symbol}`,
    `/earnings-surprises/${symbol}`,
    `/earning_calendar?from=2024-01-01&to=2025-01-01` // Note: this might be large if not filtered by symbol, but this endpoint doesn't filter by symbol easily usually?
];

endpoints.forEach(ep => {
    const url = `https://financialmodelingprep.com/api/v3${ep}${ep.includes('?') ? '&' : '?'}apikey=${apiKey}`;
    console.log(`Fetching ${url}...`);

    https.get(url, (resp) => {
      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (Array.isArray(json) && json.length > 0) {
                 console.log(`SUCCESS ${ep} returned ${json.length} items. First item:`, json[0]);
            } else {
                 console.log(`EMPTY or Object ${ep}:`, Array.isArray(json) ? "Array(0)" : json);
            }
        } catch (e) {
            console.error("Error parsing JSON:", e.message);
        }
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
});
