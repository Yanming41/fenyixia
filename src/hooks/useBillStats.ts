import { useMemo } from 'react'
import type { Bill } from '../lib/types'
import { getCategoryForIcon } from '../lib/constants'

export interface DateRange {
  year: number
  month: number // 1-12
}

export interface CategoryStat {
  category: string
  amount: number
  percentage: number
}

export interface ParticipantStat {
  id: string
  name: string
  emoji: string
  amount: number
  percentage: number
}

export interface TrendPoint {
  label: string
  amount: number
}

export interface BillStatsResult {
  total: number
  categories: CategoryStat[]
  participants: ParticipantStat[]
  trend: TrendPoint[]
}

export function useBillStats(
  bills: Bill[],
  dateRange: DateRange,
  type: 'expense' | 'income',
  userId: string | undefined,
): BillStatsResult {
  return useMemo(() => {
    if (!userId || !bills.length) {
      return { total: 0, categories: [], participants: [], trend: [] }
    }

    // Filter bills by date range
    const filtered = bills.filter(b => {
      const d = new Date(b.date)
      return d.getFullYear() === dateRange.year && d.getMonth() + 1 === dateRange.month
    })

    // Aggregate based on type
    const categoryMap = new Map<string, number>()
    const participantMap = new Map<string, { name: string; emoji: string; amount: number }>()
    const dayMap = new Map<number, number>()
    let total = 0

    for (const bill of filtered) {
      const isPayer = bill.payer_id === userId

      if (type === 'expense') {
        // Expense: money the user paid out to others
        if (!isPayer) continue
        // The user paid total_amount but gets back their own share, so net expense = total - my_share
        const expenseAmount = bill.total_amount - bill.my_share
        if (expenseAmount <= 0) continue

        total += expenseAmount

        // Category
        const cat = getCategoryForIcon(bill.icon)
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + expenseAmount)

        // Participants: distribute expense to each non-payer member proportionally
        const otherMembers = bill.members.filter(m => m.id !== userId)
        if (otherMembers.length > 0) {
          const perMember = expenseAmount / otherMembers.length
          for (const m of otherMembers) {
            const prev = participantMap.get(m.id) || { name: m.name, emoji: m.emoji, amount: 0 }
            prev.amount += perMember
            participantMap.set(m.id, prev)
          }
        }

        // Trend by day
        const day = new Date(bill.date).getDate()
        dayMap.set(day, (dayMap.get(day) || 0) + expenseAmount)
      } else {
        // Income: money the user received from others (bills where user is NOT the payer)
        if (isPayer) continue
        const incomeAmount = bill.my_share
        if (incomeAmount <= 0) continue

        total += incomeAmount

        // Category
        const cat = getCategoryForIcon(bill.icon)
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + incomeAmount)

        // Participant: the payer
        const prev = participantMap.get(bill.payer_id) || {
          name: bill.payer_name,
          emoji: bill.payer_emoji,
          amount: 0,
        }
        prev.amount += incomeAmount
        participantMap.set(bill.payer_id, prev)

        // Trend by day
        const day = new Date(bill.date).getDate()
        dayMap.set(day, (dayMap.get(day) || 0) + incomeAmount)
      }
    }

    // Build categories sorted by amount desc
    const categories: CategoryStat[] = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)

    // Build participants sorted by amount desc
    const participants: ParticipantStat[] = Array.from(participantMap.entries())
      .map(([id, { name, emoji, amount }]) => ({
        id,
        name,
        emoji,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)

    // Build trend: all days of the month
    const daysInMonth = new Date(dateRange.year, dateRange.month, 0).getDate()
    const trend: TrendPoint[] = []
    for (let d = 1; d <= daysInMonth; d++) {
      trend.push({
        label: `${d}`,
        amount: dayMap.get(d) || 0,
      })
    }

    return { total, categories, participants, trend }
  }, [bills, dateRange, type, userId])
}
