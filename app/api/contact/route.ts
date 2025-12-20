import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { name, email, subject, message } = await req.json();

        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'Tutti i campi sono obbligatori' },
                { status: 400 }
            );
        }

        const data = await resend.emails.send({
            from: 'Diramco Contact Form <info@diramco.com>', // Verified domain
            to: ['info@diramco.com'],
            replyTo: email,
            subject: `Nuovo messaggio da Diramco: ${subject}`,
            html: `
        <h2>Nuovo messaggio dal modulo contatti</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Oggetto:</strong> ${subject}</p>
        <br/>
        <p><strong>Messaggio:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
        });

        if (data.error) {
            return NextResponse.json({ error: data.error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json(
            { error: 'Errore durante l\'invio del messaggio' },
            { status: 500 }
        );
    }
}
