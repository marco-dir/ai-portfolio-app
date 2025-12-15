import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import OpenAI from "openai"
import { z } from "zod"

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

        // Construct prompt
        const holdings = portfolio.stocks.map(s => `${s.quantity} shares of ${s.symbol} bought at $${s.buyPrice}`).join("\n")

        const prompt = `
      Analizza il seguente portafoglio azionario e fornisci un report professionale in ITALIANO.
      
      Dati del Portafoglio:
      ${JSON.stringify(portfolio.stocks, null, 2)}

      Il report deve includere le seguenti sezioni formattate in Markdown:
      
      ## 1. Panoramica Generale
      Un riassunto dello stato attuale del portafoglio.

      ## 2. Analisi dei Titoli
      Punti di forza e di debolezza delle principali posizioni.

      ## 3. Analisi Settoriale e Diversificazione
      Valuta la diversificazione del portafoglio. Sei troppo esposto su un settore specifico?

      ## 4. Valutazione del Rischio
      Dai un giudizio sul rischio complessivo (Basso, Medio, Alto) basandoti sulla volatilità tipica dei titoli posseduti (es. Tech vs Consumer Staples). Spiega il perché.

      ## 5. Suggerimenti
      Consigli pratici per migliorare il portafoglio (es. ribilanciamento, nuovi settori da considerare).

      Usa un tono professionale da consulente finanziario. Sii conciso ma dettagliato.
    `

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({
                analysis: "## Mock Analysis (No API Key)\n\n**Sector Allocation**\n- Tech: 60%\n- Finance: 40%\n\n**Risk**: High\n\n*Please configure OPENAI_API_KEY to get real analysis.*"
            })
        }

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a professional financial analyst." }, { role: "user", content: prompt }],
            model: "gpt-4o",
        })

        const analysis = completion.choices[0].message.content

        return NextResponse.json({ analysis })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
    }
}
