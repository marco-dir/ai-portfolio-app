import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        // Validate email
        if (!email || !email.includes("@")) {
            return NextResponse.json(
                { error: "Email non valida" },
                { status: 400 }
            );
        }

        const apiKey = process.env.MAILPOET_API_KEY;
        const listId = process.env.MAILPOET_LIST_ID;
        const wpUrl = process.env.WORDPRESS_URL || "https://diramco.com";

        if (!apiKey) {
            console.error("MAILPOET_API_KEY not configured");
            return NextResponse.json(
                { error: "Configurazione newsletter mancante" },
                { status: 500 }
            );
        }

        // Call MailPoet API
        const response = await fetch(`${wpUrl}/wp-json/mailpoet/v1/subscribers`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
            },
            body: JSON.stringify({
                email: email,
                status: "subscribed",
                lists: listId ? [parseInt(listId, 10)] : undefined,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            return NextResponse.json({
                success: true,
                message: "Iscrizione completata! Controlla la tua email per confermare.",
            });
        }

        // Handle MailPoet specific errors
        if (response.status === 409 || data.code === "mailpoet_subscriber_exists") {
            return NextResponse.json(
                { error: "Questa email è già iscritta alla newsletter" },
                { status: 409 }
            );
        }

        console.error("MailPoet API error:", data);
        return NextResponse.json(
            { error: data.message || "Errore durante l'iscrizione" },
            { status: response.status }
        );
    } catch (error) {
        console.error("Newsletter subscription error:", error);
        return NextResponse.json(
            { error: "Errore del server. Riprova più tardi." },
            { status: 500 }
        );
    }
}
