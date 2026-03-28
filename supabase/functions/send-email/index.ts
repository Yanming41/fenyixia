// supabase/functions/send-email/index.ts
// Edge Function: 通用邮件发送函数，通过 Resend API 投递
// 部署: supabase functions deploy send-email --no-verify-jwt

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const APP_URL = Deno.env.get("APP_URL") ?? "https://fenyixia.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// --- 邮件模板 ---

function inviteEmail(data: { inviterName: string; token: string; to: string }) {
  const registerUrl = `${APP_URL}/login?invite=${data.token}&email=${encodeURIComponent(data.to)}`;
  return {
    subject: `${data.inviterName} 邀请你加入「分一下」`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
        <h2 style="margin: 0 0 16px;">你好！</h2>
        <p style="color: #444; line-height: 1.6;">
          <strong>${data.inviterName}</strong> 邀请你使用「分一下」一起分账。
        </p>
        <a href="${registerUrl}" style="
          display: inline-block; margin: 24px 0; padding: 12px 32px;
          background: #007AFF; color: #fff; text-decoration: none;
          border-radius: 10px; font-weight: 600; font-size: 15px;
        ">注册并加入</a>
        <p style="color: #999; font-size: 13px; margin-top: 32px;">
          如果你不认识 ${data.inviterName}，请忽略此邮件。
        </p>
      </div>
    `,
  };
}

const templates: Record<
  string,
  (data: Record<string, string>) => { subject: string; html: string }
> = {
  invite: inviteEmail,
};

// --- 主逻辑 ---

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const { type, to, data } = await req.json();

    if (!type || !to) {
      return json({ error: "missing type or to" }, 400);
    }

    const templateFn = templates[type];
    if (!templateFn) {
      return json({ error: "Unknown email type" }, 400);
    }

    const { subject, html } = templateFn({ ...data, to });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "分一下 <noreply@fenyixia.com>",
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return json(
        { error: err.message || `Resend API error ${res.status}` },
        res.status,
      );
    }

    const result = await res.json();

    // Log to admin_email_log (best-effort, don't fail the request if this fails)
    if (SUPABASE_URL && SERVICE_ROLE_KEY) {
      try {
        const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
        await adminClient.from("admin_email_log").insert({
          recipient_email: to,
          email_type: type,
        });
      } catch (_) { /* ignore log errors */ }
    }

    return json({ success: true, id: result.id });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
