# Deploying this app to Vercel

This is a TanStack Start (SSR) app. By default it builds a **Cloudflare Worker**
bundle, which Vercel cannot serve — that is why the first request showed
"web not found" / an endless loading screen, and why `/api/chat` (the AI
chatbot) returned an error.

## 1. Build target

`vercel.json` in the repo root now forces the correct server build:

```json
{ "build": { "env": { "NITRO_PRESET": "vercel" } } }
```

Nitro then emits `.vercel/output` (Vercel Build Output API), which Vercel picks
up automatically. **Do not** set an "Output Directory" in the Vercel project
settings — leave it empty.

Framework preset in Vercel: **Other**.

## 2. Required environment variables

Add these in Vercel → Project → Settings → Environment Variables
(Production **and** Preview):

| Name | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | same value as in `.env` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | same value as in `.env` |
| `VITE_SUPABASE_PROJECT_ID` | same value as in `.env` |
| `SUPABASE_URL` | same value as in `.env` |
| `SUPABASE_PUBLISHABLE_KEY` | same value as in `.env` |
| `LOVABLE_API_KEY` | your Lovable AI Gateway key |

`LOVABLE_API_KEY` is injected automatically on Lovable hosting only. Without it
on Vercel the chatbot falls back to the "email us" message — that is the exact
symptom of the missing key. Copy the key from the Lovable project and paste it
here, then **redeploy** (env vars are only applied to new deployments).

## 3. Redeploy

After adding the variables, trigger a fresh deployment (Deployments → ⋯ →
Redeploy, with "Use existing Build Cache" **off**).

## 4. Verify

- `https://<your-app>.vercel.app/` loads on first hit (no reload needed)
- `https://<your-app>.vercel.app/about`, `/services`, `/portfolio`, `/team` load directly
- Open the chat bubble and send "hi" — you should get an AI reply, not the
  fallback email message.
