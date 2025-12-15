# Guida al Deploy su Vercel

Questa guida ti spiega passo dopo passo come mettere online la tua applicazione usando Vercel.

## 1. Preparazione del Codice (Fatto ✅)
Il tuo progetto è già ottimizzato per Vercel (Next.js è creato da Vercel).
Ho verificato che:
- `Prisma` sia configurato correttamente.
- Lo script `postinstall` sia presente (lo aggiungerò se manca) per generare il client del database durante il deploy.

## 2. Push su GitHub
Se non l'hai ancora fatto, devi caricare il codice su GitHub:
1. Crea un nuovo repository su [GitHub](https://github.com/new).
2. Esegui questi comandi nel terminale di VS Code:
   ```bash
   git add .
   git commit -m "Ready for deploy"
   git branch -M main
   git remote add origin <URL_TUO_REPO_GITHUB>
   git push -u origin main
   ```

## 3. Configurazione su Vercel
1. Vai su [vercel.com](https://vercel.com) e accedi con GitHub.
2. Clicca su **"Add New..."** -> **"Project"**.
3. Seleziona il repository `ai-portfolio-app` che hai appena caricato.
4. Clicca **"Import"**.

## 4. Variabili d'Ambiente (Importante! 🔑)
Nella schermata di configurazione del progetto su Vercel, devi inserire le **Environment Variables**.
Copia i valori dal tuo file local `.env` e incollali nella sezione **Environment Variables**:

| Nome | Valore (Esempio/Note) |
|------|-----------------------|
| `DATABASE_URL` | `postgresql://...:6543/postgres?pgbouncer=true` (Usa quella con porta 6543) |
| `DIRECT_URL` | `postgresql://...:5432/postgres` (Usa quella con porta 5432) |
| `NEXTAUTH_SECRET` | `hqpgMP5ax...` (Copia dal tuo .env o generali uno nuovo) |
| `NEXTAUTH_URL` | **NON SERVE** su Vercel (lo imposta automaticamente), ma se lo metti non fa danni. |
| `OPENAI_API_KEY` | `sk-proj...` |
| `FMP_API_KEY` | `t0HB...` |
| `NEXT_PUBLIC_GOOGLE_SHEET_ID` | `...` |
| `NEXT_PUBLIC_GOOGLE_SHEET_GID` | `...` |
| `PERPLEXITY_API_KEY` | `...` |

## 5. Deploy
1. Clicca su **"Deploy"**.
2. Aspetta qualche minuto che Vercel costruisca l'app.
3. Se tutto va bene, vedrai i coriandoli! 🎉

## 6. Verifica Post-Deploy
- Apri il link del sito (es. `ai-portfolio-app.vercel.app`).
- Prova a fare Login (dovrebbe funzionare se il Database è collegato).
- Controlla che le pagine carichino i dati.

---
**Nota per il futuro**: Ogni volta che farai `git push` su GitHub, Vercel aggiornerà automaticamente il sito!
