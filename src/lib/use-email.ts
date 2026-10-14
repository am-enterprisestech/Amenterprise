/**
 * src/lib/use-email.ts
 *
 * Client-side helpers for sending emails via /api/send-email.
 * All calls go server-side; the RESEND_API_KEY never reaches the browser.
 */

export interface SendEmailOptions {
  to: string | string[];
  toName?: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Core send function
// ---------------------------------------------------------------------------

export async function sendEmail(opts: SendEmailOptions): Promise<SendEmailResult> {
  try {
    const resp = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opts),
    });
    const data = (await resp.json()) as SendEmailResult;
    return data;
  } catch (err) {
    console.error("[use-email] fetch failed", err);
    return { ok: false, error: "Network error — could not reach email service." };
  }
}

// ---------------------------------------------------------------------------
// Template renderer — replaces {{variable}} placeholders
// ---------------------------------------------------------------------------

export function renderTemplate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

// ---------------------------------------------------------------------------
// Pre-built email senders for common events
// These match the templates seeded in migration 0005.
// ---------------------------------------------------------------------------

/** Welcome email for a new client */
export async function sendWelcomeClient(opts: {
  to: string;
  name: string;
  amId: string;
  portalUrl?: string;
}) {
  const portalUrl = opts.portalUrl ?? "https://www.amenterprise.tech/clients";
  const html = renderTemplate(
    `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#1a1a1a;">Welcome to AM Enterprises, {{name}}!</h2>
      <p>Your client portal is ready. Click the button below to sign in.</p>
      <a href="{{portal_url}}" style="display:inline-block;background:#2F8FFF;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0;">
        Sign In to Portal
      </a>
      <p style="color:#666;font-size:14px;">Your AM Client ID: <strong>{{am_id}}</strong></p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
      <p style="color:#999;font-size:12px;">AM Enterprises &mdash; amenterprise.tech</p>
    </div>`,
    { name: opts.name, portal_url: portalUrl, am_id: opts.amId }
  );
  return sendEmail({
    to: opts.to,
    toName: opts.name,
    subject: `Welcome to AM Enterprises, ${opts.name}!`,
    html,
    text: `Welcome, ${opts.name}! Your portal: ${portalUrl}. Your AM ID: ${opts.amId}`,
  });
}

/** Welcome email for a new staff member */
export async function sendWelcomeStaff(opts: {
  to: string;
  name: string;
  amId: string;
  portalUrl?: string;
}) {
  const portalUrl = opts.portalUrl ?? "https://www.amenterprise.tech/staff";
  const html = renderTemplate(
    `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#1a1a1a;">Welcome to the AM Enterprises Team, {{name}}!</h2>
      <p>Your team portal is now active. Sign in to access your tasks, projects, and team messages.</p>
      <a href="{{portal_url}}" style="display:inline-block;background:#2F8FFF;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0;">
        Sign In to Team Portal
      </a>
      <p style="color:#666;font-size:14px;">Your AM Staff ID: <strong>{{am_id}}</strong></p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
      <p style="color:#999;font-size:12px;">AM Enterprises &mdash; amenterprise.tech</p>
    </div>`,
    { name: opts.name, portal_url: portalUrl, am_id: opts.amId }
  );
  return sendEmail({
    to: opts.to,
    toName: opts.name,
    subject: `Welcome to the AM Enterprises Team, ${opts.name}!`,
    html,
    text: `Welcome, ${opts.name}! Your team portal: ${portalUrl}. Your AM ID: ${opts.amId}`,
  });
}

/** Invoice notification */
export async function sendInvoiceEmail(opts: {
  to: string;
  name: string;
  invoiceNumber: string;
  amount: string;
  invoiceUrl: string;
}) {
  const html = renderTemplate(
    `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#1a1a1a;">Invoice #{{invoice_number}} Ready</h2>
      <p>Hi {{name}},</p>
      <p>Your invoice for <strong>{{amount}}</strong> is ready to view.</p>
      <a href="{{invoice_url}}" style="display:inline-block;background:#2F8FFF;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0;">
        View Invoice
      </a>
      <p style="color:#999;font-size:12px;margin-top:24px;">AM Enterprises &mdash; amenterprise.tech</p>
    </div>`,
    { name: opts.name, invoice_number: opts.invoiceNumber, amount: opts.amount, invoice_url: opts.invoiceUrl }
  );
  return sendEmail({
    to: opts.to,
    toName: opts.name,
    subject: `Invoice #${opts.invoiceNumber} — AM Enterprises`,
    html,
    text: `Hi ${opts.name}, Invoice #${opts.invoiceNumber} for ${opts.amount} is ready: ${opts.invoiceUrl}`,
  });
}

/** Project update notification */
export async function sendProjectUpdateEmail(opts: {
  to: string;
  name: string;
  projectName: string;
  updateMessage: string;
}) {
  const html = renderTemplate(
    `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#1a1a1a;">Update on {{project_name}}</h2>
      <p>Hi {{name}},</p>
      <p>{{update_message}}</p>
      <a href="https://www.amenterprise.tech/clients/projects" style="display:inline-block;background:#2F8FFF;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0;">
        View Project
      </a>
      <p style="color:#999;font-size:12px;margin-top:24px;">AM Enterprises &mdash; amenterprise.tech</p>
    </div>`,
    { name: opts.name, project_name: opts.projectName, update_message: opts.updateMessage }
  );
  return sendEmail({
    to: opts.to,
    toName: opts.name,
    subject: `Update on ${opts.projectName} — AM Enterprises`,
    html,
    text: `Hi ${opts.name}, Update on ${opts.projectName}: ${opts.updateMessage}`,
  });
}

/** Support reply notification */
export async function sendSupportReplyEmail(opts: {
  to: string;
  name: string;
  ticketSubject: string;
  replyBody: string;
}) {
  const html = renderTemplate(
    `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#1a1a1a;">Re: {{ticket_subject}}</h2>
      <p>Hi {{name}},</p>
      <div style="background:#f5f5f5;border-left:4px solid #2F8FFF;padding:16px;border-radius:4px;margin:16px 0;">
        {{reply_body}}
      </div>
      <a href="https://www.amenterprise.tech/clients/support" style="display:inline-block;background:#2F8FFF;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0;">
        View Ticket
      </a>
      <p style="color:#999;font-size:12px;margin-top:24px;">AM Enterprises Support &mdash; support@amenterprise.tech</p>
    </div>`,
    { name: opts.name, ticket_subject: opts.ticketSubject, reply_body: opts.replyBody }
  );
  return sendEmail({
    to: opts.to,
    toName: opts.name,
    subject: `Re: ${opts.ticketSubject}`,
    html,
    text: `Hi ${opts.name},\n\n${opts.replyBody}\n\nAM Enterprises Support`,
    replyTo: "support@amenterprise.tech",
  });
}

/** Quote received confirmation */
export async function sendQuoteConfirmationEmail(opts: {
  to: string;
  name: string;
  reference: string;
}) {
  const html = renderTemplate(
    `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#1a1a1a;">We received your quote request, {{name}}!</h2>
      <p>Thanks for reaching out to AM Enterprises. We've received your quote request and our team will get back to you within 24 hours.</p>
      <p style="color:#666;font-size:14px;">Reference: <strong>{{reference}}</strong></p>
      <p>In the meantime, feel free to explore our work or book a free discovery call.</p>
      <a href="https://www.amenterprise.tech/book" style="display:inline-block;background:#2F8FFF;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0;">
        Book a Discovery Call
      </a>
      <p style="color:#999;font-size:12px;margin-top:24px;">AM Enterprises &mdash; info@amenterprise.tech &mdash; +92 317 371 2950</p>
    </div>`,
    { name: opts.name, reference: opts.reference }
  );
  return sendEmail({
    to: opts.to,
    toName: opts.name,
    subject: `We received your quote request, ${opts.name}!`,
    html,
    text: `Hi ${opts.name}, Thanks! We received your quote request. Reference: ${opts.reference}. We'll reply within 24 hours.`,
    replyTo: "info@amenterprise.tech",
  });
}
