const yahooFinance = require('yahoo-finance2').default;

async function testChart() {
    try {
        const symbol = 'AAPL';
        console.log(`Fetching chart data for ${symbol}...`);

        const yf = new yahooFinance();

        // Fetch 1 year of data with daily interval
        const queryOptions = { period1: '2024-01-01', interval: '1d' };
        // Or better, use range
        const chartResult = await yf.chart(symbol, { range: '1y', interval: '1d' });

        console.log('Chart result quotes length:', chartResult.quotes.length);
        console.log('First quote:', chartResult.quotes[0]);
        console.log('Last quote:', chartResult.quotes[chartResult.quotes.length - 1]);

    } catch (error) {
        console.error('Error fetching chart:', error);
    }
}

testChart();
