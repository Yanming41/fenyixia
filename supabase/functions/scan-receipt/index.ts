// supabase/functions/scan-receipt/index.ts
// Edge Function: 接收图片 base64，调用 Claude API 识别小票，返回 JSON
// 部署: supabase functions deploy scan-receipt --no-verify-jwt

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    if (!ANTHROPIC_KEY) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const { image_base64, media_type, prompt } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "missing prompt" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // Build message content: image + text if image provided, text-only otherwise
    const content = [];
    if (image_base64) {
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: media_type || "image/jpeg",
          data: image_base64,
        },
      });
    }
    content.push({ type: "text", text: prompt });

    // 调用 Claude API
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: image_base64 ? "claude-opus-4-20250514" : "claude-haiku-4-5-20251001",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content,
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return new Response(
        JSON.stringify({ error: err.error?.message || `Claude API error ${res.status}` }),
        { status: res.status, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
