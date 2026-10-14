import { createFileRoute } from "@tanstack/react-router";

/**
 * POST /api/send-email
 *
 * Server-side only — the RESEND_API_KEY never reaches the browser.
 *
 * Body (JSON):
 * {
 *   to:      string | string[]   — recipient email(s)
 *   toName?: string              — display name
 *   subject: string
 *   html:    string              — HTML body
 *   text?:   string              — plain-text fallback
 *   replyTo?: string             — reply-to address
 *   tags?:   { name: string; value: string }[]
 * }
 *
 * Returns:
 *   200  { ok: true,  id: string }
 *   400  { ok: false, error: string }
 *   500  { ok: false, error: string }
 */

interface SendEmailBody {
  to: string | string[];
  toName?: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export const Route = createFileRoute("/api/send-email")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // ── Parse body ──────────────────────────────────────────────────
          const raw = await request.text();
          if (raw.length > 100_000) {
            return Response.json({ ok: false, error: "Payload too large" }, { status: 413 });
          }

          let body: SendEmailBody;
          try {
            body = JSON.parse(raw) as SendEmailBody;
          } catch {
            return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
          }

          const { to, toName, subject, html, text, replyTo, tags } = body;

          if (!to || !subject || !html) {
            return Response.json(
              { ok: false, error: "Missing required fields: to, subject, html" },
              { status: 400 }
            );
          }

          // ── Resolve API key ──────────────────────────────────────────────
          const apiKey = process.env.RESEND_API_KEY ?? "";
          if (!apiKey) {
            console.warn("[send-email] RESEND_API_KEY not set — email skipped");
            return Response.json(
              { ok: false, error: "Email service not configured (RESEND_API_KEY missing)" },
              { status: 503 }
            );
          }

          // ── Build from address ───────────────────────────────────────────
          const from =
            process.env.EMAIL_FROM ?? "AM Enterprises <no-reply@amenterprise.tech>";

          // ── Build recipients ─────────────────────────────────────────────
          const recipients = Array.isArray(to) ? to : [to];
          const toField = toName && recipients.length === 1
            ? [`${toName} <${recipients[0]}>`]
            : recipients;

          // ── Call Resend API ──────────────────────────────────────────────
          const payload: Record<string, unknown> = {
            from,
            to: toField,
            subject,
            html,
            ...(text ? { text } : {}),
            ...(replyTo ? { reply_to: replyTo } : {}),
            ...(tags ? { tags } : {}),
          };

          const resp = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload),
          });

          const data = (await resp.json()) as { id?: string; message?: string };

          if (!resp.ok) {
            console.error("[send-email] Resend error", resp.status, data);
            return Response.json(
              { ok: false, error: data?.message ?? `Resend returned ${resp.status}` },
              { status: 502 }
            );
          }

          return Response.json({ ok: true, id: data.id ?? "sent" });
        } catch (err) {
          console.error("[send-email] Unhandled error", err);
          return Response.json({ ok: false, error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
