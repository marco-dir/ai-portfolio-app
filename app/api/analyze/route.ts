import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import OpenAI from "openai"
import { z } from "zod"
import { getProfile } from "@/lib/fmp"

const analyzeSchema = z.object({
    portfolioId: z.string().min(1),
})

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy",
})

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { portfolioId } = analyzeSchema.parse(body)

        const portfolio = await prisma.portfolio.findUnique({
            where: {
                id: portfolioId,
                userId: session.user.id
            },
            include: {
                stocks: true
            }
        })

        if (!portfolio) {
            return NextResponse.json({ message: "Portfolio not found" }, { status: 404 })
        }

        if (portfolio.stocks.length === 0) {
            return NextResponse.json({ analysis: "Portfolio is empty. Add stocks to analyze." })
        }

        // Enrich portfolio data with profile info (type, name, sector)
        const enrichedHoldings = await Promise.all(
            portfolio.stocks.map(async (stock) => {
                try {
                    const profiles = await getProfile(stock.symbol)
                    const profile = Array.isArray(profiles) ? profiles[0] : profiles

                    return {
                        symbol: stock.symbol,
                        quantity: stock.quantity,
                        buyPrice: stock.buyPrice,
                        type: profile?.isEtf ? "ETF" : "Stock",
                        name: profile?.companyName || stock.symbol,
                        sector: profile?.sector || "Unknown",
                        industry: profile?.industry || "Unknown",
                        description: profile?.description?.substring(0, 200) || "",
                    }
                } catch {
                    // Fallback if profile fetch fails
                    return {
                        symbol: stock.symbol,
                        quantity: stock.quantity,
                        buyPrice: stock.buyPrice,
                        type: "Unknown",
                        name: stock.symbol,
                        sector: "Unknown",
                        industry: "Unknown",
                        description: "",
                    }
                }
            })
        )

        // Separate ETFs and Stocks for the prompt
        const etfs = enrichedHoldings.filter(h => h.type === "ETF")
        const stocks = enrichedHoldings.filter(h => h.type === "Stock")

        const prompt = `
Analizza il seguente portafoglio e fornisci un report professionale in ITALIANO.

## Composizione del Portafoglio

${stocks.length > 0 ? `### Azioni (${stocks.length} titoli)
${stocks.map(s => `- **${s.name}** (${s.symbol}): ${s.quantity} azioni, prezzo acquisto $${s.buyPrice}, Settore: ${s.sector}`).join('\n')}
` : ''}

${etfs.length > 0 ? `### ETF (${etfs.length} fondi)
${etfs.map(e => `- **${e.name}** (${e.symbol}): ${e.quantity} quote, prezzo acquisto $${e.buyPrice}`).join('\n')}
` : ''}

Il report deve includere le seguenti sezioni formattate in Markdown:

## 1. Panoramica Generale
Un riassunto dello stato attuale del portafoglio, evidenziando la suddivisione tra Azioni singole e ETF.

## 2. Analisi dei Titoli
${stocks.length > 0 ? '- Per le **Azioni**: Punti di forza e debolezza delle principali posizioni aziendali.' : ''}
${etfs.length > 0 ? '- Per gli **ETF**: Descrivi l\'obiettivo di ciascun ETF (traccia un indice? settoriale? geografico?), i vantaggi della diversificazione che offrono, e considera l\'expense ratio tipico.' : ''}

## 3. Analisi Settoriale e Diversificazione
Valuta la diversificazione complessiva. Gli ETF contribuiscono già diversificazione intrinseca? Ci sono sovrapposizioni tra ETF e azioni singole?

## 4. Valutazione del Rischio
Dai un giudizio sul rischio complessivo (Basso, Medio, Alto). Considera che gli ETF diversificati tendono a ridurre il rischio rispetto alle singole azioni.

## 5. Suggerimenti
Consigli pratici per migliorare il portafoglio. Se ci sono troppi ETF sovrapposti, suggerisci consolidamento. Se ci sono poche azioni concentrate, suggerisci diversificazione.

Usa un tono professionale da consulente finanziario. Sii conciso ma dettagliato.
`

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({
                analysis: "## Mock Analysis (No API Key)\n\n**Sector Allocation**\n- Tech: 60%\n- Finance: 40%\n\n**Risk**: High\n\n*Please configure OPENAI_API_KEY to get real analysis.*"
            })
        }

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a professional financial analyst specialized in portfolio analysis. You understand both individual stocks and ETFs (Exchange Traded Funds)." }, { role: "user", content: prompt }],
            model: "gpt-4o",
        })

        const analysis = completion.choices[0].message.content

        return NextResponse.json({ analysis })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
    }
}

