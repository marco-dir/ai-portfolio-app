
const FMP_API_KEY = process.env.FMP_API_KEY;

async function testEUData() {
    if (!FMP_API_KEY) { console.error("Missing API KEY"); return; }

    console.log("--- Testing EU Indices ---");
    const indices = ["^FCHI", "^FTSE"]; // CAC 40, FTSE 100
    try {
        const res = await fetch(`https://financialmodelingprep.com/api/v3/quote/${indices.join(',')}?apikey=${FMP_API_KEY}`);
        const data = await res.json();
        console.log("Indices:", data.map((d) => ({ s: d.symbol, n: d.name, p: d.price })));
    } catch (e) { console.log("Error Indices:", e); }

    console.log("\n--- Testing EU Economics ---");
    // FMP economic indicator endpoint: /v4/economic?name=CPI&country=Germany? or similar
    // Actually the standard endpoint is /api/v4/economic?name=...
    // Let's try to list available indicators or guess.
    // Documentation says: https://financialmodelingprep.com/api/v4/economic?name=CPI&apikey=...
    // Does it default to US? Yes.
    // Is there a country param?
    // Let's try 'em:

    // We will try to fetch 'CPI' and look at the structure to see if it has country.
    // Or try specific names like 'CPIGermany', 'HICPEuroArea'.
    // FMP usually has separate naming for other countries if supported.
    // Let's try a search or just known ones: https://financialmodelingprep.com/api/v3/economic_indicator_list?apikey=... (if exists)

    // Actually, let's try to fetch 'all' or filtered.
    // We will test `v4/economic?name=CPI` and see if it's just US.

    try {
        // Trying Euro Area CPI if possible. 
        // Often labeled 'consumerPricesEurope' or something?
        // Let's try to just fetch "CPI" and "GDP" with `?country=Euro Area` (unlikely but worth a try) or `Germany`
        // Some docs suggest /v4/economic?name=GDP&country=China

        const countries = ["Germany", "United Kingdom", "France", "Euro Area", "European Union"];
        for (const c of countries) {
            const url = `https://financialmodelingprep.com/api/v4/economic?name=CPI&country=${c}&apikey=${FMP_API_KEY}`;
            const r = await fetch(url);
            const d = await r.json();
            if (Array.isArray(d) && d.length > 0) {
                console.log(`Found CPI for ${c}:`, d[0]);
            } else {
                // console.log(`No CPI for ${c}`);
            }
        }
    } catch (e) { console.log(e); }

    console.log("\n--- Testing EU Yields (Bunds) ---");
    // German Bunds are the benchmark. 10Y, 2Y.
    // Symbols often `DE10Y`, `DE02Y` in quotes or specialized endpoints.
    // Or `^GDB`?
    // Let's try searching for 'Germany 10 Year'
    const searchUrl = `https://financialmodelingprep.com/api/v3/search?query=Germany 10 Year&limit=5&apikey=${FMP_API_KEY}`;
    try {
        const sr = await fetch(searchUrl);
        const sd = await sr.json();
        console.log("Search 'Germany 10 Year':", sd);
    } catch (e) { }

    // Direct quote check for potential yield symbols
    const yields = ["DE10Y", "DE02Y", "DE10YT=X", "GDB"];
    try {
        const yr = await fetch(`https://financialmodelingprep.com/api/v3/quote/${yields.join(',')}?apikey=${FMP_API_KEY}`);
        const yd = await yr.json();
        console.log("Yield Quotes:", yd);
    } catch (e) { }
}

testEUData();
