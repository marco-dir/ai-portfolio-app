const yahooFinance = require('yahoo-finance2').default;

async function testAdvanced() {
    try {
        const symbol = 'AAPL';
        console.log(`Fetching advanced data for ${symbol}...`);

        const yf = new yahooFinance();

        // 1. Quote Summary for Sector and Beta
        const quoteSummary = await yf.quoteSummary(symbol, { modules: ['summaryProfile', 'defaultKeyStatistics'] });
        console.log('Sector:', quoteSummary.summaryProfile.sector);
        console.log('Beta:', quoteSummary.defaultKeyStatistics.beta);

        // 2. Historical Data (1 Year)
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);

        const queryOptions = { period1: oneYearAgo.toISOString(), interval: '1d' };
        const historical = await yf.historical(symbol, queryOptions);

        console.log(`Historical data points: ${historical.length}`);
        console.log('First point:', historical[0]);
        console.log('Last point:', historical[historical.length - 1]);

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

testAdvanced();
