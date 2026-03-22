import { useState } from 'react'
import type { Bill, BillItem, Member, UpdateBillData, CreateBillData } from '../../lib/types'
import { updateBill, createBill } from '../../lib/api/bills'
import type { FriendWithAlias } from '../../lib/api/friends'
import type { Group } from '../../lib/api/groups'
import type { Tag } from '../../lib/api/tags'
import MemberPickerSheet from '../MemberPicker/MemberPickerSheet'
import BottomSheet from '../shared/BottomSheet'

const ICON_LIST = ['🍔', '🍕', '🍣', '🍜', '🧋', '☕', '🍰', '🎮', '🎬', '🛒',
    '✈️', '🏨', '⛽', '💊', '🎁', '🎪', '🎵', '🏋️', '🛁', '💡', '🧴', '🛵', '🚌', '🍻']

interface BillSheetProps {
    bill?: Bill | null
    friends: FriendWithAlias[]
    groups: Group[]
    tags: Tag[]
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

export default function BillSheet({ bill, friends, groups, tags, onClose, onSaved }: BillSheetProps) {
    const isCreate = !bill
    const [icon, setIcon] = useState(bill?.icon || '🧾')
    const [title, setTitle] = useState(bill?.title || '')
    const [description, setDescription] = useState(bill?.description || '')
    const [items, setItems] = useState<EditItem[]>(bill ? bill.items.map(itemToEdit) : [newItem()])
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
            if (isNaN(parseFloat(it.price)) || parseFloat(it.price) === 0) { setError('商品价格不能为0'); return }
            if (it.memberIds.length === 0) { setError('每个商品至少分给一人'); return }
        }

        const itemsPayload = items.map(it => ({
            name: it.name.trim(),
            price: parseFloat(it.price),
            qty: parseFloat(it.qty) || 1,
            member_ids: it.memberIds,
        }))

        setSaving(true)
        setError('')
        try {
            if (isCreate) {
                const payload: CreateBillData = {
                    icon,
                    title: title.trim(),
                    description: description.trim() || undefined,
                    items: itemsPayload,
                }
                await createBill(payload)
            } else {
                const payload: UpdateBillData = {
                    icon,
                    title: title.trim(),
                    description: description.trim() || undefined,
                    items: itemsPayload,
                }
                await updateBill(bill.id, payload)
            }
            onSaved()
            onClose()
        } catch (e) {
            setError(e instanceof Error ? e.message : (isCreate ? '创建失败' : '保存失败'))
        } finally {
            setSaving(false)
        }
    }

    return (
        <BottomSheet
            onClose={onClose}
            title={isCreate ? '新建账单' : '编辑账单'}
            maxHeight="92vh"
            headerRight={
                <button className="sheet-cancel" style={{ fontWeight: 700 }} onClick={handleSave} disabled={saving}>
                    {saving ? '保存...' : '保存'}
                </button>
            }
        >
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
                                        className="fi" type="number" inputMode="decimal" step="any" placeholder="1"
                                        value={item.qty} onChange={e => updateItem(idx, { qty: e.target.value })}
                                    />
                                </div>
                                {/* Member assignment — 3-module picker */}
                                <div style={{ paddingTop: 10 }}>
                                    <span className="fl" style={{ width: '100%', marginBottom: 4 }}>分给</span>
                                    <MemberPickerSheet
                                        friends={friends}
                                        groups={groups}
                                        tags={tags}
                                        selectedIds={item.memberIds}
                                        onChange={(ids) => updateItem(idx, { memberIds: ids })}
                                    />
                                </div>
                            </div>
                        ))}

                        {error && (
                            <div style={{ color: 'var(--red)', fontSize: 13, textAlign: 'center', padding: '8px 0' }}>
                                {error}
                            </div>
                        )}

                        <button className="sb" onClick={handleSave} disabled={saving}>
                            {saving ? (isCreate ? '创建中...' : '保存中...') : (isCreate ? '✓ 创建账单' : '✓ 保存更改')}
                        </button>
        </BottomSheet>
    )
}
