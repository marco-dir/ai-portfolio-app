const yahooFinance = require('yahoo-finance2').default;

async function testYTD() {
    try {
        const symbol = 'AAPL';
        console.log(`Fetching data for ${symbol}...`);

        const yf = new yahooFinance();

        // Check quote
        const quote = await yf.quote(symbol);
        console.log('Quote YTD:', quote.ytdReturn); // Often undefined for stocks, usually for funds

        // Check quoteSummary modules
        const summary = await yf.quoteSummary(symbol, { modules: ['defaultKeyStatistics', 'financialData', 'summaryDetail'] });

        console.log('KeyStats YTD:', summary.defaultKeyStatistics.ytdReturn);
        console.log('FinancialData Return:', summary.financialData.returnOnEquity); // Just checking other returns
        console.log('SummaryDetail YTD:', summary.summaryDetail.ytdReturn);

        // If YTD is not directly available, we might need to calculate it from historical data
        // Price at start of year vs current price

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

testYTD();
