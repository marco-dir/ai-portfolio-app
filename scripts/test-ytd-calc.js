const yahooFinance = require('yahoo-finance2').default;

async function testYTDCalculation() {
    try {
        const symbol = 'AAPL';
        console.log(`Calculating YTD for ${symbol}...`);

        const yf = new yahooFinance();

        const currentYear = new Date().getFullYear();
        const period1 = `${currentYear}-01-01`;

        // Fetch chart data from start of year
        const chart = await yf.chart(symbol, { period1, interval: '1d' });

        if (chart.quotes && chart.quotes.length > 0) {
            const startPrice = chart.quotes[0].close;
            const currentPrice = chart.meta.regularMarketPrice;

            const ytd = ((currentPrice - startPrice) / startPrice) * 100;

            console.log(`Start Date: ${chart.quotes[0].date}`);
            console.log(`Start Price: ${startPrice}`);
            console.log(`Current Price: ${currentPrice}`);
            console.log(`Calculated YTD: ${ytd.toFixed(2)}%`);
        } else {
            console.log('No historical data found for this year.');
        }

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

testYTDCalculation();
