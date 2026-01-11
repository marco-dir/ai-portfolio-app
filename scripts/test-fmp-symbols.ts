
const FMP_API_KEY = process.env.FMP_API_KEY;

async function fetchFMP(endpoint: string) {
    const url = `https://financialmodelingprep.com/api/v3${endpoint}?apikey=${FMP_API_KEY}`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status}`);
        return await res.json();
    } catch (e) {
        console.error(e);
        return null;
    }
}

async function testSymbols() {
    const symbols = [
        "^VIX", "DX-Y.NYB", "CL.1", "CLUSD", "HG.1", "HGUSD", // Commodities/Indices
        "EURUSD", "^STOXX50E", "^GDAXI" // Others
    ];

    console.log("--- Quotes ---");
    for (const s of symbols) {
        const data = await fetchFMP(`/quote/${s}`);
        if (data && data.length > 0) {
            console.log(`${s}: ${data[0].price} (${data[0].name})`);
        } else {
            console.log(`${s}: Not found`);
        }
    }

    console.log("\n--- Economic Indicators ---");
    const indicators = ["CPI", "PPI", "consumerSentiment", "realGDP"];
    for (const ind of indicators) {
        // v4 endpoint for economic data
        const url = `https://financialmodelingprep.com/api/v4/economic?name=${ind}&apikey=${FMP_API_KEY}`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                console.log(`${ind}: Found ${data.length} records. Last: ${data[0].value} on ${data[0].date}`);
            } else {
                console.log(`${ind}: No data`);
            }
        } catch (e) { console.log(`${ind}: Error ${e}`); }
    }
}

testSymbols();
