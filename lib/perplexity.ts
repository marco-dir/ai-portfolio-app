
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY

if (!PERPLEXITY_API_KEY) {
    console.warn("PERPLEXITY_API_KEY is not set in environment variables")
}

export async function getPerplexityNews(ticker: string, companyName: string) {
    if (!PERPLEXITY_API_KEY) return []

    try {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'sonar-pro',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a financial news assistant. Provide a JSON response with array of recent news items (max 5). Each item should have: title (in Italian), text (summary in Italian), publishedDate (ISO string), site (source name), url (if available, otherwise use #), and symbol (the ticker). Return ONLY valid JSON.'
                    },
                    {
                        role: 'user',
                        content: `Find the 5 most recent financial news for ${companyName} (${ticker}). Provide the titles and summaries in Italian. Format as JSON list inside a "news" key.`
                    }
                ]
            })
        })

        if (!response.ok) {
            console.error(`Perplexity API Error: ${response.status} ${response.statusText}`)
            return []
        }

        const data = await response.json()
        const content = data.choices[0]?.message?.content

        // Try to parse JSON from the response
        try {
            // content might be wrapped in ```json ... ```
            const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim()
            const parsed = JSON.parse(jsonStr)

            return (parsed.news || []).map((item: any) => ({
                symbol: ticker,
                publishedDate: item.publishedDate || new Date().toISOString(),
                title: item.title,
                image: '', // Perplexity doesn't usually return images in this mode
                site: item.site || 'Perplexity AI',
                text: item.text,
                url: item.url || '#'
            }))
        } catch (parseError) {
            console.error("Failed to parse Perplexity response:", parseError)
            return []
        }

    } catch (error) {
        console.error("Failed to fetch news from Perplexity:", error)
        return []
    }
}
