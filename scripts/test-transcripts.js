const FMP_API_KEY = process.env.FMP_API_KEY;

async function testTranscripts() {
    const symbol = 'AAPL';
    console.log(`Fetching transcripts for ${symbol}...`);

    // Test v4 list endpoint
    const listUrl = `https://financialmodelingprep.com/api/v4/earning_call_transcript?symbol=${symbol}&apikey=${FMP_API_KEY}`;

    try {
        const res = await fetch(listUrl);
        const list = await res.json();
        console.log('Available transcripts:', Array.isArray(list) ? list.length : 'Not Array');

        if (Array.isArray(list) && list.length > 0) {
            const latest = list[0];
            console.log('Latest metadata:', latest);

            // Handle array format [quarter, year, date]
            const quarter = Array.isArray(latest) ? latest[0] : latest.quarter;
            const year = Array.isArray(latest) ? latest[1] : latest.year;

            if (quarter && year) {
                console.log(`Fetching content for Q${quarter} ${year}...`);
                const contentUrl = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${symbol}?quarter=${quarter}&year=${year}&apikey=${FMP_API_KEY}`;

                const resContent = await fetch(contentUrl);
                const contentData = await resContent.json();

                if (Array.isArray(contentData) && contentData.length > 0) {
                    console.log('Transcript Object Keys:', Object.keys(contentData[0]));
                    console.log('Date:', contentData[0].date);
                    console.log('Snippet:', contentData[0].content ? contentData[0].content.substring(0, 200) + '...' : 'No content');
                } else {
                    console.log('Content response:', JSON.stringify(contentData).substring(0, 200));
                }
            }
        }

    } catch (e) {
        console.error(e);
    }
}

testTranscripts();
