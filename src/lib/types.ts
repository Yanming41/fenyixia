export interface Member {
  id: string
  name: string
  emoji: string
  color?: string
}

export interface BillItem {
  id?: string
  name: string
  price: number
  qty: number
  members: Member[]
}

export interface Bill {
  id: string
  icon: string
  title: string
  description: string
  total_amount: number
  date: string // ISO 'YYYY-MM-DD'
  payer_id: string
  payer_name: string
  payer_emoji: string
  settled: boolean
  color: string
  items: BillItem[]
  members: Member[]
  per_amount: number
  my_share: number
  /** Whether current user has uploaded a payment proof */
  _hasMeProof?: boolean
  /** Set of user IDs who have uploaded proofs for this bill */
  _proofUserIds?: Set<string>
  /** Set of user IDs manually marked as paid by the payer */
  _manualPaidUserIds?: Set<string>
}

export interface PaymentProof {
  id: string
  bill_id: string
  user_id: string
  image_url: string
  created_at: string
  user?: Member | null
}

export interface BillReaction {
  id: string
  bill_id: string
  user_id: string
  anger_count: number
  seen: boolean
  user?: Member | null
}

export interface CreateBillData {
  icon: string
  title: string
  description?: string
  date?: string
  color?: string
  items: {
    name: string
    price: number
    qty?: number
    member_ids: string[]
  }[]
}

export interface UpdateBillData {
  title: string
  icon: string
  description?: string
  items: {
    name: string
    price: number
    qty?: number
    member_ids: string[]
  }[]
}
