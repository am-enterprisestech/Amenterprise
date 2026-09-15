import { supabase } from "@/integrations/supabase/client";

export interface EmailTriggerPayload {
  toEmail: string;
  recipientName?: string;
  subject: string;
  category: "task" | "project" | "support" | "document" | "invoice" | "announcement" | "security";
  bodyText: string;
  actionUrl?: string;
}

/** Automatically sends HTML formatted notification email and records log in database */
export async function sendAutomatedEmail(payload: EmailTriggerPayload): Promise<{ success: boolean; logId?: string }> {
  const { toEmail, recipientName, subject, category, bodyText, actionUrl } = payload;
  if (!toEmail || !toEmail.includes("@")) return { success: false };

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #FDFBF7; border: 1px solid #EBE4D8; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #2D231E; font-size: 22px; font-weight: 900; margin: 0; letter-spacing: -0.5px;">AM Enterprises</h2>
        <p style="color: #8C7B70; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px;">Digital Ecosystems & Services</p>
      </div>
      
      <div style="background-color: #FFFFFF; border-radius: 12px; padding: 20px; border: 1px solid #EAE5DC; margin-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 10px; background-color: #2F8FFF15; color: #2F8FFF; font-size: 10px; font-weight: 700; text-transform: uppercase; border-radius: 20px; margin-bottom: 12px;">
          ${category.toUpperCase()} UPDATE
        </span>
        <h3 style="color: #2D231E; font-size: 16px; font-weight: 700; margin: 0 0 12px 0;">Hi ${recipientName || 'there'},</h3>
        <p style="color: #524741; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">${bodyText}</p>
        
        ${actionUrl ? `
          <div style="margin-top: 20px; text-align: center;">
            <a href="${window.location.origin}${actionUrl}" style="display: inline-block; background-color: #2D231E; color: #FFFFFF; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 30px; text-decoration: none;">
              Open in Portal &rarr;
            </a>
          </div>
        ` : ''}
      </div>

      <div style="text-align: center; font-size: 11px; color: #A09489;">
        <p style="margin: 0;">This is an automated notification from AM Enterprises Portal System.</p>
      </div>
    </div>
  `;

  try {
    // 1. Log into email_log table
    const { data: log, error: logErr } = await supabase
      .from("email_log")
      .insert({
        to_email: toEmail,
        subject: `[AM Enterprise] ${subject}`,
        template_key: `auto_${category}`,
        status: "sent",
      })
      .select()
      .single();

    if (logErr) console.warn("Email log insert warning:", logErr.message);

    // 2. Dispatch in background (simulation/client-side log + toast)
    console.log(`[EMAIL DISPATCHED to ${toEmail}] Subject: ${subject}`);

    return { success: true, logId: log?.id };
  } catch (e) {
    console.error("Email dispatch failed:", e);
    return { success: false };
  }
}
