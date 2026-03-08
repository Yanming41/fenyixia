import { supabase } from '../supabase'
import { ICON_COLORS } from '../utils'
import type { Bill, BillItem, CreateBillData, UpdateBillData } from '../types'
import { getCurrentUser } from './auth'

interface RawBillItem {
  id: string
  name: string
  price: number | string
  qty: number
  sort_order: number
  members: { user: { id: string; name: string; emoji: string } }[]
}

interface RawBill {
  id: string
  icon: string
  title: string
  description: string | null
  total_amount: number
  date: string
  payer_id: string
  settled: boolean
  color: string | null
  payer: { id: string; name: string; emoji: string } | null
  items: RawBillItem[]
}

function normalizeBill(raw: RawBill, currentUserId: string): Bill {
  const items: BillItem[] = (raw.items || []).map(item => ({
    id: item.id,
    name: item.name,
    price: Number(item.price),
    qty: item.qty || 1,
    members: (item.members || []).map(m => m.user),
  }))

  const totalAmount = items.reduce((s, i) => s + i.price * i.qty, 0)

  let myShare = 0
  items.forEach(item => {
    const isMember = item.members.some(m => m.id === currentUserId)
    if (isMember && item.members.length > 0) {
      myShare += (item.price * item.qty) / item.members.length
    }
  })

  const memberMap = new Map<string, { id: string; name: string; emoji: string }>()
  items.forEach(item => {
    item.members.forEach(m => memberMap.set(m.id, m))
  })
  if (raw.payer) memberMap.set(raw.payer.id, raw.payer)
  const allMembers = [...memberMap.values()]

  const perAmount = allMembers.length > 0 ? totalAmount / allMembers.length : 0

  return {
    id: raw.id,
    icon: raw.icon,
    title: raw.title,
    description: raw.description || '',
    total_amount: totalAmount,
    date: raw.date,
    payer_id: raw.payer_id,
    payer_name: raw.payer?.name || '未知',
    payer_emoji: raw.payer?.emoji || '😀',
    settled: raw.settled,
    color: raw.color || ICON_COLORS[raw.icon] || ICON_COLORS['🧾'] || '',
    items,
    members: allMembers,
    per_amount: perAmount,
    my_share: myShare,
  }
}

export async function fetchMyBills(): Promise<Bill[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const { data, error } = await supabase
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
    .order('date', { ascending: false })

  if (error) throw error

  return (data || []).filter((bill: RawBill) => {
    if (bill.payer_id === user.id) return true
    return bill.items?.some(item =>
      item.members?.some(m => m.user?.id === user.id)
    )
  }).map((bill: RawBill) => normalizeBill(bill, user.id))
}

export async function createBill(billData: CreateBillData): Promise<string> {
  const user = await getCurrentUser()
  if (!user) throw new Error('未登录')

  const totalAmount = billData.items.reduce((s, i) => s + i.price * (i.qty || 1), 0)
  const color = billData.color || ICON_COLORS[billData.icon] || ICON_COLORS['🧾']

  const { data: bill, error: billErr } = await supabase
    .from('bills')
    .insert({
      icon: billData.icon,
      title: billData.title,
      description: billData.description || '',
      total_amount: totalAmount,
      date: billData.date || new Date().toISOString().slice(0, 10),
      payer_id: user.id,
      settled: false,
      color,
    })
    .select()
    .single()

  if (billErr) throw billErr

  const itemRows = billData.items.map((item, i) => ({
    bill_id: bill.id,
    name: item.name,
    price: item.price,
    qty: item.qty || 1,
    sort_order: i,
  }))

  const { data: insertedItems, error: itemsErr } = await supabase
    .from('bill_items')
    .insert(itemRows)
    .select()

  if (itemsErr) throw itemsErr

  const memberRows: { item_id: string; user_id: string }[] = []
  insertedItems!.forEach((dbItem: { id: string }, i: number) => {
    const memberIds = billData.items[i]!.member_ids || []
    memberIds.forEach(uid => {
      memberRows.push({ item_id: dbItem.id, user_id: uid })
    })
  })

  if (memberRows.length > 0) {
    const { error: memErr } = await supabase
      .from('bill_item_members')
      .insert(memberRows)
    if (memErr) throw memErr
  }

  return bill.id
}

export async function updateBill(billId: string, billData: UpdateBillData) {
  const totalAmount = billData.items.reduce((s, i) => s + i.price * (i.qty || 1), 0)

  const { error: billErr } = await supabase
    .from('bills')
    .update({
      title: billData.title,
      icon: billData.icon,
      description: billData.description,
      total_amount: totalAmount,
    })
    .eq('id', billId)
  if (billErr) throw billErr

  const { data: oldItems } = await supabase
    .from('bill_items')
    .select('id')
    .eq('bill_id', billId)
  if (oldItems && oldItems.length > 0) {
    const oldIds = oldItems.map((i: { id: string }) => i.id)
    await supabase.from('bill_item_members').delete().in('item_id', oldIds)
    await supabase.from('bill_items').delete().eq('bill_id', billId)
  }

  const itemRows = billData.items.map((item, i) => ({
    bill_id: billId,
    name: item.name,
    price: item.price,
    qty: item.qty || 1,
    sort_order: i,
  }))
  const { data: insertedItems, error: itemsErr } = await supabase
    .from('bill_items')
    .insert(itemRows)
    .select()
  if (itemsErr) throw itemsErr

  const memberRows: { item_id: string; user_id: string }[] = []
  insertedItems!.forEach((dbItem: { id: string }, i: number) => {
    const memberIds = billData.items[i]!.member_ids || []
    memberIds.forEach(uid => {
      memberRows.push({ item_id: dbItem.id, user_id: uid })
    })
  })
  if (memberRows.length > 0) {
    const { error: memErr } = await supabase
      .from('bill_item_members')
      .insert(memberRows)
    if (memErr) throw memErr
  }
}

export async function deleteBill(billId: string) {
  const { error } = await supabase
    .from('bills')
    .delete()
    .eq('id', billId)
  if (error) throw error
}

export async function toggleSettled(billId: string, settled: boolean) {
  const { error } = await supabase
    .from('bills')
    .update({ settled })
    .eq('id', billId)
  if (error) throw error
}
