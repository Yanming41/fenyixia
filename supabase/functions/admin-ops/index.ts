// supabase/functions/admin-ops/index.ts
// Admin-only Edge Function. Requires SUPABASE_SERVICE_ROLE_KEY secret.
// Deploy: supabase functions deploy admin-ops

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_EMAIL = "yiming4144@gmail.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  // ── Auth: verify JWT and check admin email ──
  const authHeader = req.headers.get("Authorization") ?? "";
  const jwt = authHeader.replace("Bearer ", "");
  if (!jwt) return json({ error: "Unauthorized" }, 401);

  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: { user }, error: authError } = await adminClient.auth.getUser(jwt);
  if (authError || !user) return json({ error: "Unauthorized" }, 401);
  if (user.email !== ADMIN_EMAIL) return json({ error: "Forbidden" }, 403);

  // ── Route by action ──
  const { action, ...params } = await req.json().catch(() => ({}));

  if (action === "list_users") {
    return handleListUsers(adminClient);
  }
  if (action === "generate_magic_link") {
    return handleGenerateMagicLink(adminClient, params.email);
  }
  if (action === "get_email_stats") {
    return handleGetEmailStats(adminClient);
  }
  if (action === "get_token_stats") {
    return handleGetTokenStats(adminClient);
  }

  return json({ error: "Unknown action" }, 400);
});

// ── list_users ──
async function handleListUsers(adminClient: ReturnType<typeof createClient>) {
  const { data, error } = await adminClient.auth.admin.listUsers({ perPage: 200 });
  if (error) return json({ error: error.message }, 500);

  const authUsers = data.users;
  const userIds = authUsers.map((u) => u.id);

  // Fetch public profile data (name, emoji)
  const { data: profiles } = await adminClient
    .from("users")
    .select("id, name, emoji")
    .in("id", userIds);

  const profileMap = new Map((profiles ?? []).map((p: { id: string; name: string; emoji: string }) => [p.id, p]));

  const users = authUsers.map((u) => {
    const profile = profileMap.get(u.id) as { name?: string; emoji?: string } | undefined;
    return {
      id: u.id,
      email: u.email,
      name: profile?.name ?? null,
      emoji: profile?.emoji ?? null,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
    };
  }).sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return json({ users });
}

// ── generate_magic_link ──
async function handleGenerateMagicLink(
  adminClient: ReturnType<typeof createClient>,
  email: string,
) {
  if (!email) return json({ error: "email required" }, 400);

  const { data, error } = await adminClient.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (error) return json({ error: error.message }, 500);

  return json({ action_link: data.properties?.action_link });
}

// ── get_token_stats ──
async function handleGetTokenStats(adminClient: ReturnType<typeof createClient>) {
  // Aggregate token usage per user
  const { data, error } = await adminClient
    .from("token_usage")
    .select("user_id, feature, model, input_tokens, output_tokens, created_at")
    .order("created_at", { ascending: false });

  if (error) return json({ error: error.message }, 500);

  // Fetch user profiles for display names
  const userIds = [...new Set((data ?? []).map((r: { user_id: string }) => r.user_id))];
  const { data: profiles } = await adminClient
    .from("users")
    .select("id, name, emoji, email")
    .in("id", userIds);

  const profileMap = new Map(
    (profiles ?? []).map((p: { id: string; name: string; emoji: string; email: string }) => [p.id, p])
  );

  // Group by user
  type Row = { user_id: string; feature: string; model: string; input_tokens: number; output_tokens: number; created_at: string };
  const byUser = new Map<string, { input: number; output: number; calls: number; last_at: string }>();
  for (const row of (data ?? []) as Row[]) {
    const existing = byUser.get(row.user_id) ?? { input: 0, output: 0, calls: 0, last_at: '' };
    byUser.set(row.user_id, {
      input: existing.input + row.input_tokens,
      output: existing.output + row.output_tokens,
      calls: existing.calls + 1,
      last_at: existing.last_at || row.created_at,
    });
  }

  const stats = [...byUser.entries()].map(([userId, totals]) => {
    const profile = profileMap.get(userId) as { name?: string; emoji?: string; email?: string } | undefined;
    return {
      user_id: userId,
      name: profile?.name ?? '未知',
      emoji: profile?.emoji ?? '👤',
      email: profile?.email ?? '',
      calls: totals.calls,
      input_tokens: totals.input,
      output_tokens: totals.output,
      last_at: totals.last_at,
    };
  }).sort((a, b) => (b.input_tokens + b.output_tokens) - (a.input_tokens + a.output_tokens));

  return json({ stats });
}

// ── get_email_stats ──
async function handleGetEmailStats(adminClient: ReturnType<typeof createClient>) {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  const [hourRes, dayRes, recentRes] = await Promise.all([
    adminClient
      .from("admin_email_log")
      .select("id", { count: "exact", head: true })
      .gte("sent_at", oneHourAgo),
    adminClient
      .from("admin_email_log")
      .select("id", { count: "exact", head: true })
      .gte("sent_at", oneDayAgo),
    adminClient
      .from("admin_email_log")
      .select("recipient_email, email_type, sent_at")
      .order("sent_at", { ascending: false })
      .limit(20),
  ]);

  return json({
    last_hour: hourRes.count ?? 0,
    last_day: dayRes.count ?? 0,
    recent: recentRes.data ?? [],
  });
}
