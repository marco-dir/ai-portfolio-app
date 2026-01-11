import { NextResponse } from "next/server"
import { rateLimit, getClientIp, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit"

// Site context for the AI
const SITE_CONTEXT = `
Sei l'assistente IA di DIRAMCO, una piattaforma italiana di analisi finanziaria e gestione portafogli.

INFORMAZIONI SUL SITO:

1. SERVIZI PRINCIPALI:
- Analisi finanziaria avanzata con dati storici fino a 30 anni
- Creazione di portafogli personalizzati tramite IA
- Watchlist personalizzate per monitorare titoli
- Portafogli modello (Conservativo, Moderato, Aggressivo, Dividendi, ETF)
- Monitoraggio in tempo reale del portafoglio DIRAMCO

2. PORTAFOGLI MODELLO:
- Portafoglio Conservativo: 60% obbligazioni, 30% azioni, 10% liquidità
- Portafoglio Moderato: 50% azioni, 40% obbligazioni, 10% liquidità
- Portafoglio Aggressivo: 80% azioni, 15% obbligazioni, 5% liquidità
- Portafoglio Dividendi: Focus su titoli ad alto dividendo
- Portafoglio ETF: Diversificazione tramite ETF globali

3. ABBONAMENTO PREMIUM:
- Prezzo: 240€/anno (invece di 348€)
- Prova gratuita: 14 giorni
- Include tutte le funzionalità avanzate

4. CONTATTI:
- Email: info@diramco.com
- Sito: diramco.com

5. PAGINE PRINCIPALI:
- /dashboard - Dashboard personale
- /abbonamento - Pagina abbonamento
- /blog - Articoli e analisi
- /missione - La nostra missione
- /contatti - Contatti

ISTRUZIONI:
- Rispondi sempre in italiano
- Sii professionale ma amichevole
- Se non conosci la risposta, suggerisci di contattare il supporto
- Non fornire consigli finanziari specifici, solo informazioni generali
- Mantieni le risposte concise (max 2-3 frasi per punto)
`

export async function POST(request: Request) {
    try {
        // Rate limiting
        const clientIp = getClientIp(request)
        const rateLimitResult = rateLimit(`chat:${clientIp}`, { maxRequests: 20, windowSeconds: 60 })

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: "Hai inviato troppi messaggi. Riprova tra qualche minuto." },
                { status: 429 }
            )
        }

        const { message } = await request.json()

        if (!message || typeof message !== "string" || message.length > 1000) {
            return NextResponse.json(
                { error: "Messaggio non valido" },
                { status: 400 }
            )
        }

        const apiKey = process.env.OPENAI_API_KEY

        if (!apiKey) {
            console.error("OPENAI_API_KEY not configured")
            return NextResponse.json(
                { error: "Il servizio chat non è attualmente disponibile" },
                { status: 503 }
            )
        }

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: SITE_CONTEXT },
                    { role: "user", content: message }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        })

        if (!response.ok) {
            const error = await response.json()
            console.error("OpenAI API error:", error)
            return NextResponse.json(
                { error: "Si è verificato un errore. Riprova più tardi." },
                { status: 500 }
            )
        }

        const data = await response.json()
        const aiMessage = data.choices?.[0]?.message?.content || "Mi dispiace, non ho una risposta al momento."

        return NextResponse.json({ message: aiMessage })

    } catch (error) {
        console.error("Chat API error:", error)
        return NextResponse.json(
            { error: "Si è verificato un errore. Riprova più tardi." },
            { status: 500 }
        )
    }
}
