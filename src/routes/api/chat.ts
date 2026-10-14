import { createFileRoute } from "@tanstack/react-router";

type ChatMsg = { role: "user" | "assistant" | "system"; content: string };

const SYSTEM_PROMPT = `You are the AM Enterprises AI assistant — a helpful concierge for AM Enterprises, a digital ecosystem company based in Islamabad, Pakistan, with a presence in the United Kingdom.

AM Enterprises builds complete digital ecosystems for businesses: strategy, websites, web applications, mobile products, custom software, ERP and CRM systems, AI automation, cloud infrastructure and integrations.

Key facts:
- Founder & CEO: Moez Rehman. Co-Founder & CTO: Ayesha Moez.
- Offices: Islamabad HQ (Office, 6th Road, Techno City, Blue Area), Rawat Technology Park, and United Kingdom.
- Pakistan: +92 317 371 2950. UK: +44 771 722 9638. Email: info@amenterprise.tech
- Website: amenterprise.tech

How to answer:
- Be concise, warm and genuinely helpful. Use short paragraphs and bullets where useful.
- For pricing: every project is scoped individually. Suggest booking a free 30-minute discovery call.
- Answer in the same language the user writes in (English, Urdu, Roman Urdu, Arabic — all fine).
- If asked about topics unrelated to AM Enterprises, help briefly then bring it back.
- Never claim to be human. You are an AI assistant.
- Never invent statistics, case studies or client names.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const raw = await request.text();
          if (raw.length > 20000) return new Response("Payload too large", { status: 413 });
          let body: { messages?: unknown };
          try {
            body = JSON.parse(raw) as { messages?: unknown };
          } catch {
            return new Response("Invalid JSON", { status: 400 });
          }
          if (!Array.isArray(body.messages) || body.messages.length === 0) {
            return new Response("Invalid messages", { status: 400 });
          }
          if (body.messages.length > 20) {
            return new Response("Too many messages", { status: 400 });
          }
          const messages: ChatMsg[] = [];
          for (const m of body.messages) {
            if (typeof m !== "object" || m === null) return new Response("Invalid message", { status: 400 });
            const { role, content } = m as { role?: unknown; content?: unknown };
            if (role !== "user" && role !== "assistant") return new Response("Invalid role", { status: 400 });
            if (typeof content !== "string" || content.trim().length === 0 || content.length > 2000) {
              return new Response("Invalid message content", { status: 400 });
            }
            messages.push({ role, content });
          }
          // Server-side only. Never exposed to the browser (no VITE_ prefix).
          // On Lovable hosting LOVABLE_API_KEY is injected automatically; on
          // Vercel/self-hosting set CHATBOT_API_KEY in the environment.
          const key =
            process.env.CHATBOT_API_KEY ||
            process.env.LOVABLE_API_KEY ||
            process.env.AI_GATEWAY_API_KEY ||
            "";
          const model = process.env.CHATBOT_MODEL || "google/gemini-3-flash-preview";
          const baseUrl = process.env.CHATBOT_API_URL || "https://ai.gateway.lovable.dev/v1/chat/completions";

          if (!key) {
            return Response.json(
              {
                reply:
                  "I'm temporarily offline on this deployment because the AI key isn't configured. Please email info@amenterprise.tech or call +92 317 371 2950 and our team will help you right away.",
                degraded: true,
              },
              { status: 200 },
            );
          }

          const resp = await fetch(baseUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${key}`,
              "Lovable-API-Key": key,
            },
            body: JSON.stringify({
              model,
              messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
            }),
          });

          if (!resp.ok) {
            const text = await resp.text();
            console.error(`AI gateway error [${resp.status}]: ${text}`);
            if (resp.status === 429 || resp.status === 402) {
              return Response.json(
                {
                  reply:
                    resp.status === 429
                      ? "We're getting a lot of requests right now — please try again in a few seconds."
                      : "Our AI assistant is temporarily unavailable. Please email info@amenterprise.tech and we'll reply fast.",
                  degraded: true,
                },
                { status: 200 },
              );
            }
            return Response.json({ error: text || "Upstream error", status: resp.status }, { status: 502 });
          }
          const data = (await resp.json()) as { choices?: { message?: { content?: string } }[] };
          const reply = data?.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";
          return Response.json({ reply });
        } catch (e) {
          console.error("chat handler failed", e);
          return Response.json(
            {
              reply:
                "Sorry — I couldn't reach the assistant just now. Please email info@amenterprise.tech or call +92 317 371 2950.",
              degraded: true,
            },
            { status: 200 },
          );
        }
      },
    },
  },
});
