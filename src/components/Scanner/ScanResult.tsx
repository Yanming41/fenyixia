import { useState } from 'react'
import type { ScanResultItem } from '../../lib/api/scan'

interface ScanResultProps {
  icon: string
  title: string
  desc: string
  date: string
  merchant: string
  items: ScanResultItem[]
  totalAmount: number
  perAmount: number
  onItemsChange: (items: ScanResultItem[]) => void
}

export default function ScanResult({
  icon, title, desc, date, merchant,
  items, totalAmount, perAmount, onItemsChange
}: ScanResultProps) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editQty, setEditQty] = useState(1)
  const [editPrice, setEditPrice] = useState(0)

  const startEdit = (idx: number) => {
    const item = items[idx]
    if (!item) return
    setEditingIdx(idx)
    setEditName(item.name)
    setEditQty(item.qty || 1)
    setEditPrice(item.price)
  }

  const confirmEdit = () => {
    if (editingIdx === null) return
    if (!editName.trim()) { cancelEdit(); return }
    const next = [...items]
    next[editingIdx] = { name: editName.trim(), qty: editQty, price: editPrice }
    onItemsChange(next)
    setEditingIdx(null)
  }

  const cancelEdit = () => setEditingIdx(null)

  const deleteItem = (idx: number) => {
    onItemsChange(items.filter((_, i) => i !== idx))
    setEditingIdx(null)
  }

  return (
    <div className="scanner-result">
      <div className="scanner-result-header">
        <span className="scanner-result-icon">{icon}</span>
        <div>
          <div className="scanner-result-title">{title}</div>
          <div className="scanner-result-desc">{desc}</div>
        </div>
      </div>

      <div className="scanner-result-meta">
        <span>📅 {date}</span>
        <span>🏪 {merchant}</span>
      </div>

      <div className="scanner-result-amounts">
        <div className="scanner-result-total">CA$ {totalAmount.toFixed(2)}</div>
        <div className="scanner-result-per">每人 CA$ {perAmount.toFixed(2)}</div>
      </div>

      <div className="scanner-items-list">
        <div className="scanner-items-header">
          <span>商品 / 服务</span>
          <span>数量</span>
          <span>金额</span>
        </div>
        {items.map((item, idx) => {
          const isDiscount = item.price < 0

          if (editingIdx === idx) {
            return (
              <div key={idx} className="scanner-item-row editing">
                <input
                  className="scanner-item-edit-input"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="商品名称"
                  autoFocus
                />
                <input
                  className="scanner-item-edit-input qty"
                  type="number"
                  min={0.1}
                  step="any"
                  value={editQty}
                  onChange={e => setEditQty(parseFloat(e.target.value) || 1)}
                />
                <input
                  className="scanner-item-edit-input price"
                  type="number"
                  step="0.01"
                  value={editPrice}
                  onChange={e => setEditPrice(parseFloat(e.target.value) || 0)}
                />
                <div className="scanner-item-edit-actions">
                  <button className="scanner-item-delete" onClick={() => deleteItem(idx)}>删除</button>
                  <button className="scanner-item-cancel" onClick={cancelEdit}>取消</button>
                  <button className="scanner-item-ok" onClick={confirmEdit}>确定</button>
                </div>
              </div>
            )
          }

          return (
            <div key={idx} className="scanner-item-row" onClick={() => startEdit(idx)}>
              <span className="scanner-item-name">{item.name}</span>
              <span className="scanner-item-qty">×{item.qty || 1}</span>
              <span className={`scanner-item-price${isDiscount ? ' discount' : ''}`}>
                {isDiscount ? '-' : ''}CA${Math.abs(item.price).toFixed(2)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
