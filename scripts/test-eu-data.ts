
export { }

const FMP_API_KEY = process.env.FMP_API_KEY;

async function testEU() {
    if (!FMP_API_KEY) { console.error("Missing API KEY"); return; }

    console.log("Testing EU Indices...");
    // Indices
    const indices = ["^STOXX50E", "^GDAXI", "^FCHI", "FTSEMIB.MI"];
    const url = `https://financialmodelingprep.com/api/v3/quote/${indices.join(',')}?apikey=${FMP_API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log("Indices found:", data.map((d: any) => ({ s: d.symbol, p: d.price, c: d.changesPercentage })));
    } catch (e) { console.log(e); }

    // Currencies
    const forex = ["EURUSD"];
    try {
        const fRes = await fetch(`https://financialmodelingprep.com/api/v3/quote/${forex.join(',')}?apikey=${FMP_API_KEY}`);
        const fData = await fRes.json();
        console.log("Forex:", fData.map((d: any) => ({ s: d.symbol, p: d.price })));
    } catch (e) { }
}

testEU();
