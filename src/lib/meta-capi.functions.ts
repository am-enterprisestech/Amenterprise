import { createServerFn } from "@tanstack/react-start";
import { createHash } from "node:crypto";
import { z } from "zod";

function sha256(value: string): string {
  return createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex");
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  return createHash("sha256")
    .update(digits)
    .digest("hex");
}

const capiPayloadSchema = z.object({
  event_name: z.string().min(1),
  event_id: z.string().min(1),
  event_source_url: z.string().optional(),

  user_data: z
    .object({
      email: z.string().optional(),
      phone: z.string().optional(),
      name: z.string().optional(),
      client_ip_address: z.string().optional(),
      client_user_agent: z.string().optional(),
      fbc: z.string().optional(),
      fbp: z.string().optional(),
    })
    .optional(),

  custom_data: z.record(z.unknown()).optional(),

  action_source: z
    .enum([
      "website",
      "email",
      "app",
      "phone_call",
      "chat",
      "other",
    ])
    .default("website"),
});

export type CapiEventInput = z.infer<typeof capiPayloadSchema>;

export const sendMetaCapiEvent = createServerFn({
  method: "POST",
})
  .validator((data) => capiPayloadSchema.parse(data))
  .handler(async ({ data }) => {
    const pixelId =
      process.env.META_PIXEL_ID ||
      process.env.VITE_META_PIXEL_ID ||
      "1562782738404590";

    const accessToken =
      process.env.META_CAPI_ACCESS_TOKEN ||
      process.env.FB_CAPI_ACCESS_TOKEN;

    if (!accessToken) {
      // Graceful fallback when CAPI token is not yet configured in env
      return {
        ok: false,
        skipped: true,
        reason:
          "META_CAPI_ACCESS_TOKEN environment variable is not configured.",
        event_id: data.event_id,
        event_name: data.event_name,
      };
    }

    try {
      const userDataPayload: Record<string, unknown> = {};

      if (data.user_data?.email) {
        userDataPayload.em = [
          sha256(data.user_data.email),
        ];
      }

      if (data.user_data?.phone) {
        userDataPayload.ph = [
          normalizePhone(data.user_data.phone),
        ];
      }

      if (data.user_data?.name) {
        const parts = data.user_data.name
          .trim()
          .split(/\s+/);

        if (parts[0]) {
          userDataPayload.fn = [
            sha256(parts[0]),
          ];
        }

        if (parts.length > 1) {
          userDataPayload.ln = [
            sha256(parts.slice(1).join(" ")),
          ];
        }
      }

      if (data.user_data?.client_ip_address) {
        userDataPayload.client_ip_address =
          data.user_data.client_ip_address;
      }

      if (data.user_data?.client_user_agent) {
        userDataPayload.client_user_agent =
          data.user_data.client_user_agent;
      }

      if (data.user_data?.fbc) {
        userDataPayload.fbc = data.user_data.fbc;
      }

      if (data.user_data?.fbp) {
        userDataPayload.fbp = data.user_data.fbp;
      }

      const eventPayload = {
        data: [
          {
            event_name: data.event_name,
            event_time: Math.floor(Date.now() / 1000),
            event_id: data.event_id,
            event_source_url:
              data.event_source_url ||
              "https://www.amenterprise.tech/",
            action_source: data.action_source,
            user_data: userDataPayload,
            custom_data: data.custom_data || {},
          },
        ],
      };

      const url =
        `https://graph.facebook.com/v19.0/${pixelId}/events` +
        `?access_token=${accessToken}`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventPayload),
      });

      const json = await res.json();

      if (!res.ok) {
        console.warn("[Meta CAPI Error]", json);

        return {
          ok: false,
          error:
            json?.error?.message ||
            "Failed to send event to Meta CAPI",
          event_id: data.event_id,
        };
      }

      return {
        ok: true,
        events_received: json?.events_received || 1,
        fbtrace_id: json?.fbtrace_id,
        event_id: data.event_id,
      };
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : String(err);

      console.warn("[Meta CAPI Exception]", msg);

      return {
        ok: false,
        error: msg,
        event_id: data.event_id,
      };
    }
  });
