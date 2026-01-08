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

        const apiKey = process.env.MAILCHIMP_API_KEY;
        const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
        const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX; // e.g., "us21"

        if (!apiKey || !audienceId || !serverPrefix) {
            console.error("Mailchimp configuration missing:", {
                hasApiKey: !!apiKey,
                hasAudienceId: !!audienceId,
                hasServerPrefix: !!serverPrefix
            });
            return NextResponse.json(
                { error: "Configurazione newsletter mancante" },
                { status: 500 }
            );
        }

        // Call Mailchimp API
        const response = await fetch(
            `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`,
                },
                body: JSON.stringify({
                    email_address: email,
                    status: "subscribed", // Use "pending" for double opt-in
                }),
            }
        );

        const data = await response.json();

        if (response.ok) {
            return NextResponse.json({
                success: true,
                message: "Iscrizione completata! Benvenuto nella nostra newsletter.",
            });
        }

        // Handle Mailchimp specific errors
        if (data.title === "Member Exists") {
            return NextResponse.json(
                { error: "Questa email è già iscritta alla newsletter" },
                { status: 409 }
            );
        }

        if (data.title === "Invalid Resource") {
            return NextResponse.json(
                { error: "Email non valida. Verifica l'indirizzo inserito." },
                { status: 400 }
            );
        }

        console.error("Mailchimp API error:", data);
        return NextResponse.json(
            { error: data.detail || "Errore durante l'iscrizione" },
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

