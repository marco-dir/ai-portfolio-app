// API route for Perplexity AI analysis

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { symbol, companyName } = await request.json()

        if (!symbol || !companyName) {
            return NextResponse.json(
                { error: 'Symbol and company name are required' },
                { status: 400 }
            )
        }

        const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY

        if (!PERPLEXITY_API_KEY) {
            return NextResponse.json(
                { error: 'Perplexity API key not configured' },
                { status: 500 }
            )
        }

        const prompt = `Analizza gli ultimi risultati finanziari per ${companyName} (simbolo: ${symbol}).
    
Fornisci un analisi finale senza mostrare alcun ragionamento o processo di ricerca. Analisi deve:
1. Descrivere nel dettaglio gli ultimi risultati finanziari pubblicati nell'ultimo trimestre
2. Menzionare eventi significativi o annunci dell'azienda
3. Indicare il sentiment del mercato e previsioni degli analisti

Rispondi direttamente con l'analisi finale, senza introduzioni né commenti sul tuo processo di pensiero.`

        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
            },
            body: JSON.stringify({
                model: 'sonar',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 512
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Perplexity API error:', errorText)
            return NextResponse.json(
                { error: 'Failed to get AI analysis' },
                { status: response.status }
            )
        }

        const data = await response.json()
        const analysis = data.choices?.[0]?.message?.content || 'Analisi non disponibile'

        return NextResponse.json({ analysis })
    } catch (error) {
        console.error('Error in AI analysis:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
