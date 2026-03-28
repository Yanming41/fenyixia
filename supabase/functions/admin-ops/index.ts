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
