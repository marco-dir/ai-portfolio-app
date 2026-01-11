import { Resend } from 'resend';

// Use a fallback key for build/dev if not provided. Runtime calls will fail if key is invalid, which is expected.
const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

export const sendWelcomeEmail = async (email: string, name?: string) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'DIRAMCO <noreply@diramco.com>',
            to: [email],
            subject: 'Benvenuto in DIRAMCO!',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1>Benvenuto ${name || ''}! 🚀</h1>
                    <p>Grazie per esserti iscritto a DIRAMCO. Siamo felici di averti a bordo.</p>
                    <p>Con la nostra piattaforma potrai:</p>
                    <ul>
                        <li>Monitorare i tuoi investimenti</li>
                        <li>Ricevere analisi basate sull'IA</li>
                        <li>Tenere traccia dei dividendi</li>
                        <li>Analizzare azioni, ETF e molto altro 📊</li>
                    </ul>
                    <p>A presto,<br/>Il team di DIRAMCO</p>
                </div>
            `,
        });

        if (error) {
            console.error('Error sending welcome email:', error);
            return false;
        }

        return true;
    } catch (e) {
        console.error('Exception sending welcome email:', e);
        return false;
    }
};

export const sendNewsletter = async (email: string, subject: string, content: string) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'DIRAMCO Newsletter <newsletter@diramco.com>',
            to: [email],
            subject: subject,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    ${content}
                    <hr style="margin-top: 40px; border: 0; border-top: 1px solid #eaeaea;" />
                    <p style="font-size: 12px; color: #666;">
                        Hai ricevuto questa mail perché sei iscritto alla newsletter di DIRAMCO.
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error('Error sending newsletter:', error);
            return false;
        }

        return true;
    } catch (e) {
        console.error('Exception sending newsletter:', e);
        return false;
    }
};

export const sendVerificationEmail = async (email: string, token: string) => {
    const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

    try {
        const { data, error } = await resend.emails.send({
            from: 'DIRAMCO <noreply@diramco.com>',
            to: [email],
            subject: 'Verifica la tua email',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1>Verifica il tuo indirizzo email</h1>
                    <p>Grazie per esserti registrato a DIRAMCO. Per completare la registrazione, clicca sul link qui sotto:</p>
                    <p>
                        <a href="${confirmLink}" style="display: inline-block; background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                            Verifica Email
                        </a>
                    </p>
                    <p style="font-size: 14px; color: #666;">
                        O copia e incolla questo link nel tuo browser:<br/>
                        <a href="${confirmLink}" style="color: #2563EB;">${confirmLink}</a>
                    </p>
                    <p>Se non hai richiesto questa email, puoi ignorarla.</p>
                </div>
            `,
        });

        if (error) {
            console.error('Error sending verification email:', error);
            return false;
        }

        return true;
    } catch (e) {
        console.error('Exception sending verification email:', e);
        return false;
    }
};

export const sendSubscriptionSuccessEmail = async (email: string, planName: string = "Pro") => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'DIRAMCO <noreply@diramco.com>',
            to: [email],
            subject: 'Pagamento ricevuto - Il tuo abbonamento è attivo! 🚀',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1>Grazie per il tuo supporto!</h1>
                    <p>Siamo felici di confermarti che il pagamento per il tuo abbonamento <strong>${planName}</strong> è andato a buon fine.</p>
                    <p>Hai ora accesso completo a tutte le funzionalità premium di DIRAMCO:</p>
                    <ul>
                        <li>Analisi finanziarie illimitate</li>
                        <li>Dati storici completi</li>
                        <li>Portafogli modello AI</li>
                        <li>E molto altro...</li>
                    </ul>
                    <p>Buon investimento!<br/>Il team di DIRAMCO</p>
                </div>
            `,
        });

        if (error) {
            console.error('Error sending subscription success email:', error);
            return false;
        }

        return true;
    } catch (e) {
        console.error('Exception sending subscription success email:', e);
        return false;
    }
};

export const sendSubscriptionCancelledEmail = async (email: string) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'DIRAMCO <noreply@diramco.com>',
            to: [email],
            subject: 'Conferma cancellazione abbonamento',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1>Ci dispiace vederti andare via</h1>
                    <p>Ti confermiamo che il rinnovo automatico del tuo abbonamento è stato annullato.</p>
                    <p>Potrai continuare ad accedere alle funzionalità premium fino alla fine del periodo di fatturazione corrente.</p>
                    <p>Se dovessi cambiare idea, saremo felici di riaverti con noi.</p>
                    <p>A presto,<br/>Il team di DIRAMCO</p>
                </div>
            `,
        });

        if (error) {
            console.error('Error sending subscription cancelled email:', error);
            return false;
        }

        return true;
    } catch (e) {
        console.error('Exception sending subscription cancelled email:', e);
        return false;
    }
};
