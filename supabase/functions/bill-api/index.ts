// supabase/functions/bill-api/index.ts
// Personal AI-accessible REST API for 分一下.
// Auth: Authorization: Bearer <api_token>
// Deploy: supabase functions deploy bill-api --no-verify-jwt

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// ── Bootstrap Supabase admin client ──────────────────────────────────────────
function makeAdmin() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ── Validate API token, return userId or null ─────────────────────────────────
async function resolveToken(
  db: ReturnType<typeof makeAdmin>,
  req: Request,
): Promise<string | null> {
  const raw = req.headers.get("Authorization") ?? "";
  const token = raw.startsWith("Bearer ") ? raw.slice(7) : raw;
  if (!token) return null;

  const { data } = await db
    .from("api_tokens")
    .select("user_id")
    .eq("token", token)
    .maybeSingle();

  if (!data) return null;

  // Fire-and-forget: update last_used_at
  db.from("api_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("token", token)
    .then(() => {});

  return data.user_id as string;
}

// ── Route dispatcher ──────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const db = makeAdmin();
  const userId = await resolveToken(db, req);
  if (!userId) return json({ error: "Invalid or missing API token" }, 401);

  const url = new URL(req.url);
  // Strip leading /functions/v1/bill-api or /bill-api
  const path = url.pathname.replace(/^.*\/bill-api\/?/, "").replace(/\/$/, "");
  const method = req.method;

  // GET /contacts — list friends the user can reference by name
  if (method === "GET" && path === "contacts") {
    return handleGetContacts(db, userId);
  }

  // GET /bills?filter=all|pending|collect
  if (method === "GET" && path === "bills") {
    return handleGetBills(db, userId, url.searchParams.get("filter") ?? "all");
  }

  // GET /summary
  if (method === "GET" && path === "summary") {
    return handleGetSummary(db, userId);
  }

  // POST /bills
  if (method === "POST" && path === "bills") {
    const body = await req.json().catch(() => null);
    if (!body) return json({ error: "Invalid JSON body" }, 400);
    return handleCreateBill(db, userId, body);
  }

  // POST /bills/:id/mark-paid
  const markPaidMatch = path.match(/^bills\/([^/]+)\/mark-paid$/);
  if (method === "POST" && markPaidMatch) {
    const body = await req.json().catch(() => ({}));
    return handleMarkPaid(db, userId, markPaidMatch[1]!, body);
  }

  return json({
    error: "Not found",
    available_endpoints: [
      "GET  /contacts",
      "GET  /bills?filter=all|pending|collect",
      "GET  /summary",
      "POST /bills",
      "POST /bills/:id/mark-paid",
    ],
  }, 404);
});

// ── GET /contacts ─────────────────────────────────────────────────────────────
async function handleGetContacts(
  db: ReturnType<typeof makeAdmin>,
  userId: string,
) {
  // Accepted friends (both directions)
  const { data: friendRows } = await db
    .from("friend_requests")
    .select("from_user, to_user")
    .or(`from_user.eq.${userId},to_user.eq.${userId}`)
    .eq("status", "accepted");

  const friendIds = (friendRows ?? []).map((r: { from_user: string; to_user: string }) =>
    r.from_user === userId ? r.to_user : r.from_user
  );

  if (friendIds.length === 0) return json({ contacts: [] });

  const { data: profiles } = await db
    .from("users")
    .select("id, name, emoji")
    .in("id", friendIds);

  return json({ contacts: profiles ?? [] });
}

// ── GET /bills ────────────────────────────────────────────────────────────────
async function handleGetBills(
  db: ReturnType<typeof makeAdmin>,
  userId: string,
  filter: string,
) {
  // Fetch all bills where user is payer or member
  const { data: rawBills, error } = await db
    .from("bills")
    .select(`
      id, icon, title, description, total_amount, date, payer_id, settled, color,
      payer:users!bills_payer_id_fkey(id, name, emoji, email),
      items:bill_items(
        id, name, price, qty, sort_order,
        members:bill_item_members(user:users(id, name, emoji))
      )
    `)
    .order("created_at", { ascending: false });

  if (error) return json({ error: error.message }, 500);

  // Filter to bills user is involved in
  type RawBill = {
    id: string; icon: string; title: string; description: string | null;
    total_amount: number; date: string; payer_id: string; settled: boolean; color: string | null;
    payer: { id: string; name: string; emoji: string; email: string } | null;
    items: { id: string; name: string; price: number; qty: number; sort_order: number;
      members: { user: { id: string; name: string; emoji: string } }[] }[];
  };

  const myBills = (rawBills ?? [] as RawBill[]).filter((b: RawBill) => {
    if (b.payer_id === userId) return true;
    return b.items?.some(item => item.members?.some(m => m.user?.id === userId));
  });

  // Load proofs and manual payments for these bills
  const billIds = myBills.map((b: RawBill) => b.id);
  const [{ data: proofData }, { data: manualData }] = await Promise.all([
    db.from("payment_proofs").select("bill_id, user_id").in("bill_id", billIds),
    db.from("manual_payments").select("bill_id, user_id").in("bill_id", billIds),
  ]);

  const proofByBill = new Map<string, Set<string>>();
  (proofData ?? []).forEach((p: { bill_id: string; user_id: string }) => {
    if (!proofByBill.has(p.bill_id)) proofByBill.set(p.bill_id, new Set());
    proofByBill.get(p.bill_id)!.add(p.user_id);
  });
  const manualByBill = new Map<string, Set<string>>();
  (manualData ?? []).forEach((p: { bill_id: string; user_id: string }) => {
    if (!manualByBill.has(p.bill_id)) manualByBill.set(p.bill_id, new Set());
    manualByBill.get(p.bill_id)!.add(p.user_id);
  });

  // Normalize
  const bills = myBills.map((b: RawBill) => {
    const proofIds = proofByBill.get(b.id) ?? new Set<string>();
    const manualIds = manualByBill.get(b.id) ?? new Set<string>();
    const isPayer = b.payer_id === userId;

    // Compute my share
    let myShare = 0;
    const items = (b.items ?? []).map(item => {
      const members = (item.members ?? []).map(m => m.user).filter(Boolean);
      const share = (item.price * item.qty) / (members.length || 1);
      if (members.some(m => m.id === userId)) myShare += share;
      return {
        name: item.name,
        price: item.price,
        qty: item.qty,
        members: members.map(m => ({ id: m.id, name: m.name, emoji: m.emoji })),
      };
    });

    // Determine payment status (from user's perspective)
    let status: string;
    const iManuallyPaid = manualIds.has(userId);
    const iHaveProof = proofIds.has(userId);
    if (b.settled) {
      status = "settled";
    } else if (isPayer) {
      const memberMap = new Map<string, { id: string; name: string; emoji: string }>();
      b.items?.forEach(item => item.members?.forEach(m => { if (m.user) memberMap.set(m.user.id, m.user); }));
      if (b.payer) memberMap.set(b.payer.id, b.payer);
      const nonPayers = [...memberMap.values()].filter(m => m.id !== userId);
      const allPaid = nonPayers.every(m => proofIds.has(m.id) || manualIds.has(m.id));
      status = allPaid ? "all_collected" : "pending_collection";
    } else if (iHaveProof || iManuallyPaid) {
      status = "paid";
    } else {
      status = "pending_payment";
    }

    // Compute pending amount (for payer: what's still owed; for member: my share)
    let pendingAmount = 0;
    if (isPayer) {
      b.items?.forEach(item => {
        const members = (item.members ?? []).map(m => m.user).filter(Boolean);
        const share = (item.price * item.qty) / (members.length || 1);
        members.forEach(m => {
          if (m.id !== userId && !proofIds.has(m.id) && !manualIds.has(m.id)) {
            pendingAmount += share;
          }
        });
      });
    } else {
      pendingAmount = (iHaveProof || iManuallyPaid) ? 0 : myShare;
    }

    return {
      id: b.id,
      title: b.title,
      icon: b.icon,
      description: b.description ?? "",
      date: b.date,
      total_amount: Math.round(b.total_amount * 100) / 100,
      my_share: Math.round(myShare * 100) / 100,
      pending_amount: Math.round(pendingAmount * 100) / 100,
      status,
      payer: b.payer ? { id: b.payer.id, name: b.payer.name, emoji: b.payer.emoji } : null,
      items,
    };
  });

  // Apply filter
  const filtered = bills.filter(b => {
    if (filter === "pending") return b.status === "pending_payment";
    if (filter === "collect") return b.status === "pending_collection";
    return true;
  });

  return json({ bills: filtered, total: filtered.length });
}

// ── GET /summary ──────────────────────────────────────────────────────────────
async function handleGetSummary(
  db: ReturnType<typeof makeAdmin>,
  userId: string,
) {
  const { data: rawBills, error } = await db
    .from("bills")
    .select(`
      id, payer_id, settled,
      items:bill_items(
        price, qty,
        members:bill_item_members(user:users(id))
      )
    `)
    .order("created_at", { ascending: false });

  if (error) return json({ error: error.message }, 500);

  type SummaryBill = {
    id: string; payer_id: string; settled: boolean;
    items: { price: number; qty: number; members: { user: { id: string } }[] }[];
  };

  const myBills = (rawBills ?? [] as SummaryBill[]).filter((b: SummaryBill) => {
    if (b.payer_id === userId) return true;
    return b.items?.some(item => item.members?.some(m => m.user?.id === userId));
  });

  const billIds = myBills.map((b: SummaryBill) => b.id);
  const [{ data: proofData }, { data: manualData }] = await Promise.all([
    db.from("payment_proofs").select("bill_id, user_id").in("bill_id", billIds),
    db.from("manual_payments").select("bill_id, user_id").in("bill_id", billIds),
  ]);

  const proofByBill = new Map<string, Set<string>>();
  (proofData ?? []).forEach((p: { bill_id: string; user_id: string }) => {
    if (!proofByBill.has(p.bill_id)) proofByBill.set(p.bill_id, new Set());
    proofByBill.get(p.bill_id)!.add(p.user_id);
  });
  const manualByBill = new Map<string, Set<string>>();
  (manualData ?? []).forEach((p: { bill_id: string; user_id: string }) => {
    if (!manualByBill.has(p.bill_id)) manualByBill.set(p.bill_id, new Set());
    manualByBill.get(p.bill_id)!.add(p.user_id);
  });

  let collected = 0, collectPending = 0, paid = 0, owePending = 0;

  myBills.forEach((b: SummaryBill) => {
    const proofIds = proofByBill.get(b.id) ?? new Set<string>();
    const manualIds = manualByBill.get(b.id) ?? new Set<string>();
    const isPayer = b.payer_id === userId;

    if (isPayer) {
      const memberShares = new Map<string, number>();
      b.items?.forEach(item => {
        const members = (item.members ?? []).map(m => m.user).filter(Boolean);
        const share = (item.price * item.qty) / (members.length || 1);
        members.forEach(m => {
          if (m.id !== userId) memberShares.set(m.id, (memberShares.get(m.id) ?? 0) + share);
        });
      });
      memberShares.forEach((amount, uid) => {
        if (b.settled || proofIds.has(uid) || manualIds.has(uid)) collected += amount;
        else collectPending += amount;
      });
    } else {
      let myShare = 0;
      b.items?.forEach(item => {
        const members = (item.members ?? []).map(m => m.user).filter(Boolean);
        if (members.some(m => m.id === userId)) {
          myShare += (item.price * item.qty) / (members.length || 1);
        }
      });
      const iManuallyPaid = manualIds.has(userId);
      const iHaveProof = proofIds.has(userId);
      if (b.settled || iHaveProof || iManuallyPaid) paid += myShare;
      else owePending += myShare;
    }
  });

  const round = (n: number) => Math.round(n * 100) / 100;
  return json({
    collected: round(collected),
    collect_pending: round(collectPending),
    paid: round(paid),
    owe_pending: round(owePending),
  });
}

// ── POST /bills ───────────────────────────────────────────────────────────────
// Body:
// {
//   "title": "晚饭",
//   "icon": "🍜",          // optional, defaults to 🧾
//   "date": "2025-06-16",  // optional, defaults to today
//   "description": "...",  // optional
//   "items": [
//     {
//       "name": "火锅",
//       "price": 120,
//       "qty": 1,           // optional, defaults to 1
//       "member_names": ["Leo", "Psypher"],  // names of friends
//       // OR "member_ids": ["uuid1", "uuid2"]
//     }
//   ]
// }
async function handleCreateBill(
  db: ReturnType<typeof makeAdmin>,
  userId: string,
  body: Record<string, unknown>,
) {
  if (!body.title) return json({ error: "title is required" }, 400);
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return json({ error: "items array is required and must not be empty" }, 400);
  }

  // Fetch user's friends for name → id lookup
  const { data: friendRows } = await db
    .from("friend_requests")
    .select("from_user, to_user")
    .or(`from_user.eq.${userId},to_user.eq.${userId}`)
    .eq("status", "accepted");

  const friendIds = (friendRows ?? []).map((r: { from_user: string; to_user: string }) =>
    r.from_user === userId ? r.to_user : r.from_user
  );

  // Fetch current user profile too (so "我" or own name can be resolved)
  const allIds = [userId, ...friendIds];
  const { data: profiles } = await db
    .from("users")
    .select("id, name")
    .in("id", allIds);

  const nameToId = new Map<string, string>();
  (profiles ?? []).forEach((p: { id: string; name: string }) => {
    nameToId.set(p.name.toLowerCase(), p.id);
  });

  // Process items
  type ItemInput = { name: string; price: number; qty?: number; member_names?: string[]; member_ids?: string[] };
  const items = body.items as ItemInput[];
  const processedItems: { name: string; price: number; qty: number; member_ids: string[] }[] = [];

  for (const item of items) {
    if (!item.name || typeof item.price !== "number") {
      return json({ error: `Each item must have name and price. Got: ${JSON.stringify(item)}` }, 400);
    }
    let memberIds: string[] = [];
    if (Array.isArray(item.member_ids) && item.member_ids.length > 0) {
      memberIds = item.member_ids;
    } else if (Array.isArray(item.member_names) && item.member_names.length > 0) {
      const unresolved: string[] = [];
      memberIds = item.member_names.map(name => {
        const id = nameToId.get(name.toLowerCase());
        if (!id) unresolved.push(name);
        return id ?? "";
      }).filter(Boolean);
      if (unresolved.length > 0) {
        return json({
          error: `Could not find contacts: ${unresolved.join(", ")}. Use GET /contacts to see available names.`,
        }, 400);
      }
    }
    // Default: split among all friends + self if no members specified
    if (memberIds.length === 0) memberIds = allIds;

    processedItems.push({ name: item.name, price: item.price, qty: item.qty ?? 1, member_ids: memberIds });
  }

  const totalAmount = processedItems.reduce((s, i) => s + i.price * i.qty, 0);
  const date = (body.date as string) ?? new Date().toISOString().slice(0, 10);

  // Insert bill
  const { data: bill, error: billErr } = await db
    .from("bills")
    .insert({
      icon: (body.icon as string) ?? "🧾",
      title: body.title as string,
      description: (body.description as string) ?? "",
      total_amount: totalAmount,
      date,
      payer_id: userId,
      settled: false,
      color: null,
    })
    .select()
    .single();

  if (billErr) return json({ error: billErr.message }, 500);

  // Insert items
  const itemRows = processedItems.map((item, i) => ({
    bill_id: bill.id,
    name: item.name,
    price: item.price,
    qty: item.qty,
    sort_order: i,
  }));

  const { data: insertedItems, error: itemsErr } = await db
    .from("bill_items")
    .insert(itemRows)
    .select();

  if (itemsErr) return json({ error: itemsErr.message }, 500);

  // Insert members
  const memberRows: { item_id: string; user_id: string }[] = [];
  insertedItems!.forEach((dbItem: { id: string }, i: number) => {
    processedItems[i]!.member_ids.forEach(uid => {
      memberRows.push({ item_id: dbItem.id, user_id: uid });
    });
  });

  if (memberRows.length > 0) {
    const { error: memErr } = await db.from("bill_item_members").insert(memberRows);
    if (memErr) return json({ error: memErr.message }, 500);
  }

  return json({
    success: true,
    bill_id: bill.id,
    title: bill.title,
    total_amount: Math.round(totalAmount * 100) / 100,
    date,
  }, 201);
}

// ── POST /bills/:id/mark-paid ─────────────────────────────────────────────────
// Body: { "user_name": "Leo" }  OR  { "user_id": "uuid" }
async function handleMarkPaid(
  db: ReturnType<typeof makeAdmin>,
  userId: string,
  billId: string,
  body: Record<string, unknown>,
) {
  // Verify caller is the payer
  const { data: bill } = await db
    .from("bills")
    .select("payer_id, settled")
    .eq("id", billId)
    .maybeSingle();

  if (!bill) return json({ error: "Bill not found" }, 404);
  if (bill.payer_id !== userId) return json({ error: "Only the payer can mark members as paid" }, 403);
  if (bill.settled) return json({ error: "Bill is already settled" }, 400);

  // Resolve target user
  let targetId = body.user_id as string | undefined;
  if (!targetId && body.user_name) {
    const { data: profile } = await db
      .from("users")
      .select("id")
      .ilike("name", body.user_name as string)
      .maybeSingle();
    if (!profile) return json({ error: `User "${body.user_name}" not found` }, 404);
    targetId = profile.id;
  }
  if (!targetId) return json({ error: "user_id or user_name is required" }, 400);
  if (targetId === userId) return json({ error: "Cannot mark yourself as paid" }, 400);

  // Toggle
  const { data: existing } = await db
    .from("manual_payments")
    .select("id")
    .eq("bill_id", billId)
    .eq("user_id", targetId)
    .maybeSingle();

  if (existing) {
    await db.from("manual_payments").delete().eq("id", existing.id);
    return json({ success: true, marked_paid: false, message: "Payment mark removed" });
  } else {
    const { error } = await db.from("manual_payments").insert({
      bill_id: billId,
      user_id: targetId,
      marked_by: userId,
    });
    if (error) return json({ error: error.message }, 500);
    return json({ success: true, marked_paid: true, message: "Marked as paid" });
  }
}
