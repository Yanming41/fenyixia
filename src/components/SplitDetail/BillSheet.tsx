import { useState, useMemo, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Bill, BillItem, Member, UpdateBillData, CreateBillData } from '../../lib/types'
import { updateBill, createBill } from '../../lib/api/bills'
import type { FriendWithAlias } from '../../lib/api/friends'
import type { Group } from '../../lib/api/groups'
import type { Tag } from '../../lib/api/tags'
import { getFriendsByTag } from '../../lib/api/tags'
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
    spreadDiscount?: boolean
}

type DragPayload =
    | { type: 'friend'; id: string }
    | { type: 'group'; id: string }
    | { type: 'tag'; id: string }

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

function applyDiscountSpread(items: EditItem[]): EditItem[] {
    let result = items.map(it => ({ ...it }))
    const spreadItems = result.filter(it => it.spreadDiscount && parseFloat(it.price) < 0)
    for (const disc of spreadItems) {
        const discTotal = Math.abs(parseFloat(disc.price) * (parseFloat(disc.qty) || 1))
        const positives = result.filter(it => !it.spreadDiscount && parseFloat(it.price) > 0)
        const posTotal = positives.reduce((s, it) => s + parseFloat(it.price) * (parseFloat(it.qty) || 1), 0)
        if (posTotal <= 0) continue
        result = result.map(it => {
            if (it.spreadDiscount || parseFloat(it.price) <= 0) return it
            const itemTotal = parseFloat(it.price) * (parseFloat(it.qty) || 1)
            const share = discTotal * (itemTotal / posTotal)
            const newPrice = Math.round((parseFloat(it.price) - share / (parseFloat(it.qty) || 1)) * 100) / 100
            return { ...it, price: String(newPrice) }
        })
    }
    return result.filter(it => !it.spreadDiscount || parseFloat(it.price) >= 0)
}

function computePreviewPrices(items: EditItem[]): Map<number, string> | null {
    const hasSpread = items.some(it => it.spreadDiscount && parseFloat(it.price) < 0)
    if (!hasSpread) return null
    const preview = new Map<number, string>()
    const totalDiscount = items
        .filter(it => it.spreadDiscount && parseFloat(it.price) < 0)
        .reduce((s, it) => s + Math.abs(parseFloat(it.price) * (parseFloat(it.qty) || 1)), 0)
    const posTotal = items
        .filter(it => !it.spreadDiscount && parseFloat(it.price) > 0)
        .reduce((s, it) => s + parseFloat(it.price) * (parseFloat(it.qty) || 1), 0)
    if (posTotal <= 0) return null
    items.forEach((it, idx) => {
        if (it.spreadDiscount || parseFloat(it.price) <= 0) return
        const itemTotal = parseFloat(it.price) * (parseFloat(it.qty) || 1)
        const share = totalDiscount * (itemTotal / posTotal)
        const newPrice = Math.round((parseFloat(it.price) - share / (parseFloat(it.qty) || 1)) * 100) / 100
        preview.set(idx, String(newPrice))
    })
    return preview
}

export default function BillSheet({ bill, friends, groups, tags, onClose, onSaved }: BillSheetProps) {
    const isCreate = !bill
    const [icon, setIcon] = useState(bill?.icon || '🧾')
    const [title, setTitle] = useState(bill?.title || '')
    const [description, setDescription] = useState(bill?.description || '')
    const [items, setItems] = useState<EditItem[]>(bill ? bill.items.map(itemToEdit) : [newItem()])
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [showIconPicker, setShowIconPicker] = useState(false)
    const [expandedIdx, setExpandedIdx] = useState<number | null>(isCreate ? 0 : null)

    // Drag-to-assign state
    const [dragPayload, setDragPayload] = useState<DragPayload | null>(null)
    const [dropTarget, setDropTarget] = useState<number | null>(null)
    const itemCardRefs = useRef<(HTMLDivElement | null)[]>([])

    // Pre-resolve tag members for instant drag assignment
    const [resolvedTags, setResolvedTags] = useState<Record<string, string[]>>({})
    useEffect(() => {
        tags.forEach(t => {
            getFriendsByTag(t.id).then(members => {
                setResolvedTags(prev => ({ ...prev, [t.id]: members.map(m => m.id) }))
            }).catch(() => { /* ignore */ })
        })
    }, [tags])

    const previewPrices = computePreviewPrices(items)

    const allMembersById = useMemo(() => {
        const m = new Map<string, Member>()
        groups.forEach(g => g.members.forEach(mem => { if (!m.has(mem.id)) m.set(mem.id, mem) }))
        friends.forEach(f => m.set(f.id, { id: f.id, name: f.alias || f.name, emoji: f.emoji, color: f.color }))
        return m
    }, [friends, groups])

    const updateItem = (index: number, patch: Partial<EditItem>) =>
        setItems(prev => prev.map((it, i) => i === index ? { ...it, ...patch } : it))

    const addItem = () => {
        const newIdx = items.length
        setItems(prev => [...prev, newItem()])
        setExpandedIdx(newIdx)
    }

    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index))
        setExpandedIdx(null)
    }

    // ── Drag helpers ──
    const findDropTarget = (point: { x: number; y: number }) => {
        let found: number | null = null
        itemCardRefs.current.forEach((ref, idx) => {
            if (!ref) return
            const r = ref.getBoundingClientRect()
            if (point.x >= r.left && point.x <= r.right && point.y >= r.top && point.y <= r.bottom) {
                found = idx
            }
        })
        return found
    }

    const applyDrop = (itemIdx: number, drag: DragPayload) => {
        const item = items[itemIdx]
        if (!item) return
        if (drag.type === 'friend') {
            const has = item.memberIds.includes(drag.id)
            updateItem(itemIdx, {
                memberIds: has ? item.memberIds.filter(id => id !== drag.id) : [...item.memberIds, drag.id]
            })
        } else if (drag.type === 'group') {
            const g = groups.find(g => g.id === drag.id)
            if (!g) return
            const gIds = g.members.map(m => m.id)
            const allIn = gIds.every(id => item.memberIds.includes(id))
            updateItem(itemIdx, {
                memberIds: allIn
                    ? item.memberIds.filter(id => !gIds.includes(id))
                    : [...new Set([...item.memberIds, ...gIds])]
            })
        } else if (drag.type === 'tag') {
            const tIds = resolvedTags[drag.id] ?? []
            if (tIds.length === 0) return
            const allIn = tIds.every(id => item.memberIds.includes(id))
            updateItem(itemIdx, {
                memberIds: allIn
                    ? item.memberIds.filter(id => !tIds.includes(id))
                    : [...new Set([...item.memberIds, ...tIds])]
            })
        }
    }

    const handleSave = async () => {
        if (!title.trim()) { setError('请填写账单名称'); return }
        if (items.length === 0) { setError('至少需要一个商品'); return }
        for (const it of items) {
            if (!it.name.trim()) { setError('商品名不能为空'); return }
            if (isNaN(parseFloat(it.price)) || parseFloat(it.price) === 0) { setError('商品价格不能为0'); return }
            if (it.memberIds.length === 0) { setError('每个商品至少分给一人'); return }
        }
        const spreadItems = applyDiscountSpread(items)
        const itemsPayload = spreadItems.map(it => ({
            name: it.name.trim(),
            price: parseFloat(it.price),
            qty: parseFloat(it.qty) || 1,
            member_ids: it.memberIds,
        }))
        setSaving(true)
        setError('')
        try {
            if (isCreate) {
                await createBill({ icon, title: title.trim(), description: description.trim() || undefined, items: itemsPayload } as CreateBillData)
            } else {
                await updateBill(bill.id, { icon, title: title.trim(), description: description.trim() || undefined, items: itemsPayload } as UpdateBillData)
            }
            onSaved()
            onClose()
        } catch (e) {
            setError(e instanceof Error ? e.message : (isCreate ? '创建失败' : '保存失败'))
        } finally {
            setSaving(false)
        }
    }

    const isDragging = dragPayload !== null

    return (
        <BottomSheet
            onClose={onClose}
            title={isCreate ? '新建账单' : '编辑账单'}
            maxHeight="92vh"
            className="bill-sheet"
            headerRight={
                <button className="sheet-cancel" style={{ fontWeight: 700 }} onClick={handleSave} disabled={saving}>
                    {saving ? '保存...' : '保存'}
                </button>
            }
        >
            {/* ── Fixed top ── */}
            <div className="bs-fixed-top">
                {/* Header card */}
                <div className="bs-header-card">
                    <button
                        className={`bs-icon-btn${showIconPicker ? ' bs-icon-btn-active' : ''}`}
                        onClick={() => setShowIconPicker(v => !v)}
                    >
                        {icon}
                    </button>
                    <div className="bs-header-inputs">
                        <input className="bs-title-input" type="text" placeholder="账单名称"
                            value={title} onChange={e => setTitle(e.target.value)} />
                        <input className="bs-desc-input" type="text" placeholder="备注（可选）"
                            value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                </div>

                {/* Icon picker inline */}
                {showIconPicker && (
                    <div className="bs-icon-grid">
                        {ICON_LIST.map(ic => (
                            <button key={ic} className={`ip-btn${icon === ic ? ' on' : ''}`}
                                onClick={() => { setIcon(ic); setShowIconPicker(false) }}>
                                {ic}
                            </button>
                        ))}
                    </div>
                )}

                {/* Member palette */}
                <div className="bs-palette-wrap">
                    <div className="bs-palette-hint">
                        {isDragging ? '拖到下方条目来分配' : '拖拽或点击分配成员'}
                    </div>
                    <div className="bs-palette">
                        {/* Friends */}
                        {friends.map(f => (
                            <motion.button
                                key={f.id}
                                className="bs-pal-friend"
                                drag
                                dragSnapToOrigin
                                dragMomentum={false}
                                dragElastic={0.6}
                                onDragStart={() => setDragPayload({ type: 'friend', id: f.id })}
                                onDrag={(_, info) => setDropTarget(findDropTarget(info.point))}
                                onDragEnd={(_, info) => {
                                    const target = findDropTarget(info.point)
                                    if (target !== null) applyDrop(target, { type: 'friend', id: f.id })
                                    setDragPayload(null)
                                    setDropTarget(null)
                                }}
                                onClick={() => {
                                    if (expandedIdx !== null) applyDrop(expandedIdx, { type: 'friend', id: f.id })
                                }}
                                whileDrag={{ scale: 1.15, zIndex: 100, boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }}
                                whileTap={{ scale: 0.88 }}
                                style={{ touchAction: 'none' }}
                            >
                                <span className="bs-pal-emoji">{f.emoji}</span>
                                <span className="bs-pal-name">{f.alias || f.name}</span>
                            </motion.button>
                        ))}

                        {/* Separator */}
                        {groups.length > 0 && <div className="bs-pal-sep" />}

                        {/* Groups */}
                        {groups.map(g => (
                            <motion.button
                                key={g.id}
                                className="bs-pal-group"
                                drag
                                dragSnapToOrigin
                                dragMomentum={false}
                                dragElastic={0.6}
                                onDragStart={() => setDragPayload({ type: 'group', id: g.id })}
                                onDrag={(_, info) => setDropTarget(findDropTarget(info.point))}
                                onDragEnd={(_, info) => {
                                    const target = findDropTarget(info.point)
                                    if (target !== null) applyDrop(target, { type: 'group', id: g.id })
                                    setDragPayload(null)
                                    setDropTarget(null)
                                }}
                                onClick={() => {
                                    if (expandedIdx !== null) applyDrop(expandedIdx, { type: 'group', id: g.id })
                                }}
                                whileDrag={{ scale: 1.12, zIndex: 100, boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }}
                                whileTap={{ scale: 0.88 }}
                                style={{ touchAction: 'none' }}
                            >
                                <span>{g.emoji}</span>
                                <span className="bs-pal-name">{g.name}</span>
                            </motion.button>
                        ))}

                        {/* Tags */}
                        {tags.length > 0 && <div className="bs-pal-sep" />}
                        {tags.map(t => (
                            <motion.button
                                key={t.id}
                                className="bs-pal-tag"
                                style={{ borderColor: t.color, color: t.color, touchAction: 'none' }}
                                drag
                                dragSnapToOrigin
                                dragMomentum={false}
                                dragElastic={0.6}
                                onDragStart={() => setDragPayload({ type: 'tag', id: t.id })}
                                onDrag={(_, info) => setDropTarget(findDropTarget(info.point))}
                                onDragEnd={(_, info) => {
                                    const target = findDropTarget(info.point)
                                    if (target !== null) applyDrop(target, { type: 'tag', id: t.id })
                                    setDragPayload(null)
                                    setDropTarget(null)
                                }}
                                onClick={() => {
                                    if (expandedIdx !== null) applyDrop(expandedIdx, { type: 'tag', id: t.id })
                                }}
                                whileDrag={{ scale: 1.12, zIndex: 100, boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }}
                                whileTap={{ scale: 0.88 }}
                            >
                                {t.name}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Items label */}
                <div className="fg-label bs-items-label">
                    <span>商品明细</span>
                    <button className="bs-add-btn" onClick={addItem}>＋ 添加</button>
                </div>
            </div>

            {/* ── Scrollable items area ── */}
            <div className="bs-items-scroll">
                {items.map((item, idx) => {
                    const isExpanded = expandedIdx === idx
                    const isDropTarget = dropTarget === idx
                    const isDiscount = parseFloat(item.price) < 0
                    const hasPositives = items.some((it, i) => i !== idx && parseFloat(it.price) > 0)
                    const preview = previewPrices?.get(idx)
                    const rawTotal = parseFloat(item.price) * (parseFloat(item.qty) || 1)
                    const priceDisplay = item.price === '' || isNaN(rawTotal) ? '—' : `¥${rawTotal.toFixed(2)}`

                    return (
                        <div
                            key={idx}
                            ref={el => { itemCardRefs.current[idx] = el }}
                            className={[
                                'bs-item',
                                isExpanded ? 'bs-item--open' : 'bs-item--closed',
                                isDragging ? 'bs-item--droppable' : '',
                                isDropTarget ? 'bs-item--drop-target' : '',
                            ].join(' ')}
                        >
                            {/* Clickable header row */}
                            <button
                                className="bs-item-hdr"
                                onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                            >
                                <div className="bs-item-hdr-left">
                                    <span className="bs-item-hdr-name">
                                        {item.name || <span className="bs-item-placeholder">未命名商品</span>}
                                    </span>
                                    {item.memberIds.length > 0 && (
                                        <div className="bs-avatars">
                                            {item.memberIds.slice(0, 8).map(id => {
                                                const m = allMembersById.get(id)
                                                return m ? <span key={id} className="bs-av">{m.emoji}</span> : null
                                            })}
                                            {item.memberIds.length > 8 && (
                                                <span className="bs-av bs-av-more">+{item.memberIds.length - 8}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="bs-item-hdr-right">
                                    {preview
                                        ? <span className="bs-price-preview">¥{preview}</span>
                                        : <span className="bs-price">{priceDisplay}</span>
                                    }
                                    <span className={`bs-chevron${isExpanded ? ' bs-chevron--up' : ''}`}>›</span>
                                </div>
                            </button>

                            {/* Drop zone indicator overlay */}
                            {isDragging && (
                                <div className="bs-drop-overlay">
                                    {isDropTarget ? '✓ 放开分配' : '拖到这里'}
                                </div>
                            )}

                            {/* Expanded edit form */}
                            {isExpanded && !isDragging && (
                                <div className="bs-item-body">
                                    <div className="fg">
                                        <span className="fl">名称</span>
                                        <input className="fi" type="text" placeholder="商品名"
                                            value={item.name} onChange={e => updateItem(idx, { name: e.target.value })} autoFocus />
                                        <button className="bs-remove-btn" onClick={() => removeItem(idx)}>×</button>
                                    </div>
                                    <div className="fg">
                                        <span className="fl">单价</span>
                                        <input className="fi" type="number" inputMode="decimal" placeholder="0.00"
                                            value={item.price} onChange={e => updateItem(idx, { price: e.target.value })} />
                                        {preview && <span className="discount-preview-label">→ ¥{preview}</span>}
                                    </div>
                                    <div className="fg">
                                        <span className="fl">数量</span>
                                        <input className="fi" type="number" inputMode="decimal" step="any" placeholder="1"
                                            value={item.qty} onChange={e => updateItem(idx, { qty: e.target.value })} />
                                    </div>
                                    {isDiscount && (
                                        <div className="fg">
                                            <span className="fl">优惠</span>
                                            <button
                                                className={`discount-spread-toggle${item.spreadDiscount ? ' active' : ''}`}
                                                disabled={!hasPositives}
                                                onClick={() => updateItem(idx, { spreadDiscount: !item.spreadDiscount })}
                                            >
                                                {item.spreadDiscount ? '✓ 已分摊到商品' : '分摊到商品'}
                                            </button>
                                        </div>
                                    )}
                                    {/* Member chips with remove */}
                                    {!item.spreadDiscount && item.memberIds.length > 0 && (
                                        <div className="bs-assigned-members">
                                            {item.memberIds.map(id => {
                                                const m = allMembersById.get(id)
                                                return m ? (
                                                    <button
                                                        key={id}
                                                        className="bs-assigned-chip"
                                                        onClick={() => updateItem(idx, { memberIds: item.memberIds.filter(mid => mid !== id) })}
                                                    >
                                                        {m.emoji} {m.name} ×
                                                    </button>
                                                ) : null
                                            })}
                                        </div>
                                    )}
                                    {!item.spreadDiscount && item.memberIds.length === 0 && (
                                        <div className="bs-no-members">从上方拖拽或点击头像来分配成员</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}

                {error && (
                    <div style={{ color: 'var(--red)', fontSize: 13, textAlign: 'center', padding: '8px 0' }}>
                        {error}
                    </div>
                )}

                <button className="sb" onClick={handleSave} disabled={saving}>
                    {saving ? (isCreate ? '创建中...' : '保存中...') : (isCreate ? '✓ 创建账单' : '✓ 保存更改')}
                </button>
            </div>
        </BottomSheet>
    )
}
