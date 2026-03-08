import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Bill, BillItem, Member, UpdateBillData } from '../../lib/types'
import { updateBill } from '../../lib/api/bills'

const ICON_LIST = ['🍔', '🍕', '🍣', '🍜', '🧋', '☕', '🍰', '🎮', '🎬', '🛒',
    '✈️', '🏨', '⛽', '💊', '🎁', '🎪', '🎵', '🏋️', '🛁', '💡', '🧴', '🛵', '🚌', '🍻']

interface BillSheetProps {
    bill: Bill
    friends: Member[]
    onClose: () => void
    onSaved: () => void
}

interface EditItem {
    name: string
    price: string
    qty: string
    memberIds: string[]
}

function itemToEdit(item: BillItem): EditItem {
    return {
        name: item.name,
        price: String(item.price),
        qty: String(item.qty || 1),
        memberIds: item.members.map(m => m.id),
    }
}

function newItem(): EditItem {
    return { name: '', price: '', qty: '1', memberIds: [] }
}

export default function BillSheet({ bill, friends, onClose, onSaved }: BillSheetProps) {
    const [icon, setIcon] = useState(bill.icon)
    const [title, setTitle] = useState(bill.title)
    const [description, setDescription] = useState(bill.description || '')
    const [items, setItems] = useState<EditItem[]>(bill.items.map(itemToEdit))
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const updateItem = (index: number, patch: Partial<EditItem>) => {
        setItems(prev => prev.map((it, i) => i === index ? { ...it, ...patch } : it))
    }

    const toggleMember = (itemIndex: number, memberId: string) => {
        setItems(prev => prev.map((it, i) => {
            if (i !== itemIndex) return it
            const has = it.memberIds.includes(memberId)
            return {
                ...it,
                memberIds: has
                    ? it.memberIds.filter(id => id !== memberId)
                    : [...it.memberIds, memberId],
            }
        }))
    }

    const addItem = () => setItems(prev => [...prev, newItem()])
    const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index))

    const handleSave = async () => {
        if (!title.trim()) { setError('请填写账单名称'); return }
        if (items.length === 0) { setError('至少需要一个商品'); return }
        for (const it of items) {
            if (!it.name.trim()) { setError('商品名不能为空'); return }
            if (isNaN(parseFloat(it.price)) || parseFloat(it.price) <= 0) { setError('商品价格必须大于0'); return }
            if (it.memberIds.length === 0) { setError('每个商品至少分给一人'); return }
        }

        const payload: UpdateBillData = {
            icon,
            title: title.trim(),
            description: description.trim() || undefined,
            items: items.map(it => ({
                name: it.name.trim(),
                price: parseFloat(it.price),
                qty: parseInt(it.qty) || 1,
                member_ids: it.memberIds,
            })),
        }

        setSaving(true)
        setError('')
        try {
            await updateBill(bill.id, payload)
            onSaved()
            onClose()
        } catch (e) {
            setError(e instanceof Error ? e.message : '保存失败')
        } finally {
            setSaving(false)
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                className="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28 }}
                onClick={onClose}
            >
                <motion.div
                    className="sheet"
                    style={{ maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'tween', duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="sh" />
                    {/* Title bar */}
                    <div className="sheet-titlebar">
                        <button className="sheet-cancel" onClick={onClose}>取消</button>
                        <div className="sh-title">编辑账单</div>
                        <button className="sheet-cancel" style={{ fontWeight: 700 }} onClick={handleSave} disabled={saving}>
                            {saving ? '保存...' : '保存'}
                        </button>
                    </div>

                    <div className="sheet-body" style={{ overflowY: 'auto', flex: 1 }}>
                        {/* Icon picker */}
                        <div className="fg-label">图标</div>
                        <div className="icon-picker">
                            {ICON_LIST.map(ic => (
                                <button
                                    key={ic}
                                    className={`ip-btn ${icon === ic ? 'on' : ''}`}
                                    onClick={() => setIcon(ic)}
                                >
                                    {ic}
                                </button>
                            ))}
                        </div>

                        {/* Basic fields */}
                        <div className="fg-label">基本信息</div>
                        <div className="form-group">
                            <div className="fg">
                                <span className="fl">名称</span>
                                <input
                                    className="fi"
                                    type="text"
                                    placeholder="账单名称"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="fg">
                                <span className="fl">备注</span>
                                <input
                                    className="fi"
                                    type="text"
                                    placeholder="可选"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Items */}
                        <div className="fg-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>商品明细</span>
                            <button
                                onClick={addItem}
                                style={{
                                    background: 'none', border: 'none', color: 'var(--blue)',
                                    fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', padding: '0 4px',
                                }}
                            >
                                + 添加
                            </button>
                        </div>

                        {items.map((item, idx) => (
                            <div key={idx} className="form-group" style={{ marginBottom: 12 }}>
                                <div className="fg">
                                    <span className="fl">名称</span>
                                    <input
                                        className="fi" type="text" placeholder="商品名"
                                        value={item.name} onChange={e => updateItem(idx, { name: e.target.value })}
                                    />
                                    <button
                                        onClick={() => removeItem(idx)}
                                        style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: 18, cursor: 'pointer', padding: '0 4px' }}
                                    >
                                        ×
                                    </button>
                                </div>
                                <div className="fg">
                                    <span className="fl">单价</span>
                                    <input
                                        className="fi" type="number" inputMode="decimal" placeholder="0.00"
                                        value={item.price} onChange={e => updateItem(idx, { price: e.target.value })}
                                    />
                                </div>
                                <div className="fg">
                                    <span className="fl">数量</span>
                                    <input
                                        className="fi" type="number" inputMode="numeric" placeholder="1"
                                        value={item.qty} onChange={e => updateItem(idx, { qty: e.target.value })}
                                    />
                                </div>
                                {/* Member assignment */}
                                <div className="fg" style={{ flexWrap: 'wrap', gap: 6, paddingTop: 10 }}>
                                    <span className="fl" style={{ width: '100%', marginBottom: 4 }}>分给</span>
                                    {friends.map(m => {
                                        const selected = item.memberIds.includes(m.id)
                                        return (
                                            <button
                                                key={m.id}
                                                onClick={() => toggleMember(idx, m.id)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: 4,
                                                    padding: '4px 10px', borderRadius: 20,
                                                    border: selected ? '1.5px solid var(--accent)' : '1.5px solid var(--sep)',
                                                    background: selected ? 'rgba(48,209,88,0.15)' : 'none',
                                                    color: selected ? 'var(--accent)' : 'var(--label2)',
                                                    fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                                                }}
                                            >
                                                {m.emoji} {m.name}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}

                        {error && (
                            <div style={{ color: 'var(--red)', fontSize: 13, textAlign: 'center', padding: '8px 0' }}>
                                {error}
                            </div>
                        )}

                        <button className="sb" onClick={handleSave} disabled={saving}>
                            {saving ? '保存中...' : '✓ 保存更改'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
