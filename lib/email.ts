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
