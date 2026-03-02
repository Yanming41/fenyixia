/* ══════════════════════════════════════════════════════════════
   Supabase 数据层
   ── 连接 · 认证 · CRUD ──
══════════════════════════════════════════════════════════════ */

// ⚠️ 替换为你的 Supabase 项目信息（Settings → API）
const SUPABASE_URL  = 'https://rpqhceaezxlekrnwpvwt.supabase.co';
const SUPABASE_KEY  = 'sb_publishable_d_oOZ3JAZVTHXn9KrVoTlg_ga6XC0a9';

// CDN 引入后 window 上有 supabase 对象
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ══════════════════════════════════════════════════════════════
   认证
══════════════════════════════════════════════════════════════ */

// 获取当前登录用户（null = 未登录）
async function getCurrentUser() {
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

// 邮箱 + 密码注册（PIN 作为密码）
async function signUp(email, password, name, emoji, color) {
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) throw error;

  // 写入 users 表补充信息
  if (data.user) {
    await sb.from('users').upsert({
      id:    data.user.id,
      email,
      name,
      emoji: emoji || '😀',
      color: color || '#1c1c26',
    });
  }
  return data;
}

// 登录
async function signIn(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// 登出
async function signOut() {
  await sb.auth.signOut();
}

// 监听登录状态变化
function onAuthChange(callback) {
  sb.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
}

/* ══════════════════════════════════════════════════════════════
   好友
══════════════════════════════════════════════════════════════ */

// 获取我的所有好友
async function getFriends() {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await sb.rpc('get_friends', { uid: user.id });
  // 如果 rpc 不存在，fallback 用两次查询
  if (error) {
    const [r1, r2] = await Promise.all([
      sb.from('friendships').select('user_b(id,name,emoji,color)').eq('user_a', user.id),
      sb.from('friendships').select('user_a(id,name,emoji,color)').eq('user_b', user.id),
    ]);
    const friends = [
      ...(r1.data || []).map(r => r.user_b),
      ...(r2.data || []).map(r => r.user_a),
    ];
    return friends;
  }
  return data || [];
}

// 通过邮箱添加好友
async function addFriend(email) {
  const user = await getCurrentUser();
  if (!user) throw new Error('未登录');

  // 查找目标用户
  const { data: target, error: findErr } = await sb
    .from('users')
    .select('id')
    .eq('email', email)
    .single();
  if (findErr || !target) throw new Error('找不到该用户');
  if (target.id === user.id) throw new Error('不能加自己');

  // 保证 user_a < user_b 避免重复
  const [a, b] = [user.id, target.id].sort();
  const { error } = await sb.from('friendships').upsert({ user_a: a, user_b: b });
  if (error) throw error;
  return target;
}

/* ══════════════════════════════════════════════════════════════
   账单 CRUD
══════════════════════════════════════════════════════════════ */

// 图标 → 颜色映射
const ICON_COLORS = {
  '🧾': 'linear-gradient(135deg,#8E8E93,#636366)',
  '🛒': 'linear-gradient(135deg,#34C759,#28A745)',
  '🍜': 'linear-gradient(135deg,#FF9500,#FF6B00)',
  '⚡': 'linear-gradient(135deg,#FF3B30,#FF2D55)',
  '☕': 'linear-gradient(135deg,#007AFF,#5AC8FA)',
  '🏸': 'linear-gradient(135deg,#AF52DE,#5E5CE6)',
  '🎮': 'linear-gradient(135deg,#FF2D55,#AF52DE)',
  '🚗': 'linear-gradient(135deg,#FF9500,#FF6B00)',
  '🏥': 'linear-gradient(135deg,#FF453A,#FF3B30)',
  '🛍️': 'linear-gradient(135deg,#5AC8FA,#007AFF)',
};

/**
 * 拉取和我相关的所有账单（我垫付的 + 我参与分摊的）
 * 返回前端可直接用的格式
 */
async function fetchMyBills() {
  const user = await getCurrentUser();
  if (!user) return [];

  // 一次查询拿到账单 + 条目 + 条目分摊人
  const { data, error } = await sb
    .from('bills')
    .select(`
      *,
      payer:users!bills_payer_id_fkey(id,name,emoji),
      items:bill_items(
        id, name, price, qty, sort_order,
        members:bill_item_members(
          user:users(id,name,emoji)
        )
      )
    `)
    .order('date', { ascending: false });

  if (error) throw error;

  // 过滤：只保留和我相关的（payer 是我 或 某条目的 member 包含我）
  return (data || []).filter(bill => {
    if (bill.payer_id === user.id) return true;
    return bill.items?.some(item =>
      item.members?.some(m => m.user?.id === user.id)
    );
  }).map(bill => normalizeBill(bill, user.id));
}

/**
 * 把 Supabase 原始数据转成前端卡片格式
 */
function normalizeBill(raw, currentUserId) {
  const items = (raw.items || []).map(item => ({
    id:      item.id,
    name:    item.name,
    price:   Number(item.price),
    qty:     item.qty || 1,
    members: (item.members || []).map(m => m.user),
  }));

  // 计算总金额
  const totalAmount = items.reduce((s, i) => s + i.price * i.qty, 0);

  // 计算"我"应摊多少
  let myShare = 0;
  items.forEach(item => {
    const isMember = item.members.some(m => m.id === currentUserId);
    if (isMember && item.members.length > 0) {
      myShare += (item.price * item.qty) / item.members.length;
    }
  });

  // 所有唯一参与人
  const memberMap = new Map();
  items.forEach(item => {
    item.members.forEach(m => memberMap.set(m.id, m));
  });
  // 垫付人也算
  if (raw.payer) memberMap.set(raw.payer.id, raw.payer);
  const allMembers = [...memberMap.values()];

  // 均摊金额（总 ÷ 人数）
  const perAmount = allMembers.length > 0 ? totalAmount / allMembers.length : 0;

  return {
    id:           raw.id,
    icon:         raw.icon,
    title:        raw.title,
    description:  raw.description || '',
    total_amount: totalAmount,
    date:         raw.date,           // ISO 'YYYY-MM-DD'
    payer_id:     raw.payer_id,
    payer_name:   raw.payer?.name || '未知',
    payer_emoji:  raw.payer?.emoji || '😀',
    settled:      raw.settled,
    color:        raw.color || ICON_COLORS[raw.icon] || ICON_COLORS['🧾'],
    items,
    members:      allMembers,         // [{ id, name, emoji }, ...]
    per_amount:   perAmount,
    my_share:     myShare,
  };
}

/**
 * 创建新账单（含条目 + 分摊人）
 *
 * billData: {
 *   icon, title, description, date,
 *   items: [{ name, price, qty, member_ids: [uuid, ...] }, ...]
 * }
 */
async function createBill(billData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('未登录');

  const totalAmount = billData.items.reduce((s, i) => s + i.price * (i.qty || 1), 0);
  const color = billData.color || ICON_COLORS[billData.icon] || ICON_COLORS['🧾'];

  // 1. 插入账单主记录
  const { data: bill, error: billErr } = await sb
    .from('bills')
    .insert({
      icon:         billData.icon,
      title:        billData.title,
      description:  billData.description || '',
      total_amount: totalAmount,
      date:         billData.date || new Date().toISOString().slice(0, 10),
      payer_id:     user.id,
      settled:      false,
      color,
    })
    .select()
    .single();

  if (billErr) throw billErr;

  // 2. 插入条目
  const itemRows = billData.items.map((item, i) => ({
    bill_id:    bill.id,
    name:       item.name,
    price:      item.price,
    qty:        item.qty || 1,
    sort_order: i,
  }));

  const { data: insertedItems, error: itemsErr } = await sb
    .from('bill_items')
    .insert(itemRows)
    .select();

  if (itemsErr) throw itemsErr;

  // 3. 插入每个条目的分摊人
  const memberRows = [];
  insertedItems.forEach((dbItem, i) => {
    const memberIds = billData.items[i].member_ids || [];
    memberIds.forEach(uid => {
      memberRows.push({ item_id: dbItem.id, user_id: uid });
    });
  });

  if (memberRows.length > 0) {
    const { error: memErr } = await sb
      .from('bill_item_members')
      .insert(memberRows);
    if (memErr) throw memErr;
  }

  return bill.id;
}

/**
 * 标记账单已结清 / 取消结清
 */
async function toggleSettled(billId, settled) {
  const { error } = await sb
    .from('bills')
    .update({ settled })
    .eq('id', billId);
  if (error) throw error;
}

/**
 * 删除账单（级联删除条目和分摊人）
 */
async function deleteBill(billId) {
  const { error } = await sb
    .from('bills')
    .delete()
    .eq('id', billId);
  if (error) throw error;
}

/* ══════════════════════════════════════════════════════════════
   导出
══════════════════════════════════════════════════════════════ */
window.DB = {
  sb,
  // Auth
  getCurrentUser,
  signUp,
  signIn,
  signOut,
  onAuthChange,
  // Friends
  getFriends,
  addFriend,
  // Bills
  fetchMyBills,
  createBill,
  toggleSettled,
  deleteBill,
  // Helpers
  normalizeBill,
  ICON_COLORS,
};
