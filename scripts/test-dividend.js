const yahooFinance = require('yahoo-finance2').default;

async function testDividend() {
    try {
        const symbol = 'KO'; // Coca-Cola
        console.log(`Fetching quote for ${symbol}...`);

        const yf = new yahooFinance();
        const quote = await yf.quote(symbol);

        console.log('Dividend Yield:', quote.dividendYield);
        console.log('Trailing Annual Dividend Yield:', quote.trailingAnnualDividendYield);

    } catch (error) {
        console.error('Error fetching quote:', error);
    }
}

testDividend();
