const yahooFinance = require('yahoo-finance2').default;

async function testChart() {
    try {
        const symbol = 'AAPL';
        console.log(`Fetching chart data for ${symbol}...`);

        const yf = new yahooFinance();

        // Period1 is required. Let's use a date string or timestamp.
        const period1 = '2024-01-01';

        const chartResult = await yf.chart(symbol, { period1, interval: '1d' });

        console.log('Chart result quotes length:', chartResult.quotes.length);
        console.log('First quote:', chartResult.quotes[0]);

    } catch (error) {
        console.error('Error fetching chart:', error);
    }
}

testChart();
