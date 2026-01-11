
const FMP_API_KEY = process.env.FMP_API_KEY;

async function testEURiskData() {
    // 1. Yields
    // We found DE10YT. Let's look for DE02YT or similar for 2Y.
    const yields = ["DE10YT", "DE02YT", "DE02Y", "DE2Y", "GET", "GDB"];
    console.log("Testing Yield Symbols:", yields);
    try {
        const res = await fetch(`https://financialmodelingprep.com/api/v3/quote/${yields.join(',')}?apikey=${FMP_API_KEY}`);
        const data = await res.json();
        console.log("Yield Quotes:", data.map(d => ({ s: d.symbol, n: d.name, p: d.price })));
    } catch (e) { }

    // 2. Inflation (CPI)
    // FMP often requires 'names' for economic data.
    // Let's try to search for "Germany Inflation" or "Euro Inflation"
    console.log("\nSearching for Inflation Indicators...");
    try {
        const s1 = await fetch(`https://financialmodelingprep.com/api/v3/search?query=Germany CPI&limit=5&apikey=${FMP_API_KEY}`);
        console.log("Search 'Germany CPI':", await s1.json());

        const s2 = await fetch(`https://financialmodelingprep.com/api/v3/search?query=Euro CPI&limit=5&apikey=${FMP_API_KEY}`);
        console.log("Search 'Euro CPI':", await s2.json());
    } catch (e) { }

    // Direct check for potential codes if known (often countryISO + INDICATOR)
    // or just rely on manual update if API is tricky.
    // Let's try fetching "ZYIEUR" (Eurozone CPI sometimes?)
    // Or just look at the 'economic_indicator_list' if possible? No, listing is huge.
}

testEURiskData();
