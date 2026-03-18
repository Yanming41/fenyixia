import { useState, useMemo } from 'react'
import type { Member } from '../../lib/types'
import type { Group } from '../../lib/api/groups'
import type { Tag } from '../../lib/api/tags'
import { getFriendsByTag } from '../../lib/api/tags'
import { createGroup } from '../../lib/api/groups'
import { createTag } from '../../lib/api/tags'
import { mutateGroups } from '../../hooks/useGroups'
import { mutateTags } from '../../hooks/useTags'
import { groupByInitial } from '../../lib/pinyin'
import type { FriendWithAlias } from '../../lib/api/friends'

interface MemberPickerProps {
    friends: FriendWithAlias[]
    groups: Group[]
    tags: Tag[]
    selectedIds: string[]
    onChange: (ids: string[]) => void
}

/* ── helpers ── */
function memberMap(groups: Group[]): Map<string, Member> {
    const m = new Map<string, Member>()
    groups.forEach(g => g.members.forEach(mem => { if (!m.has(mem.id)) m.set(mem.id, mem) }))
    return m
}

export default function MemberPickerSheet({ friends, groups, tags, selectedIds, onChange }: MemberPickerProps) {
    const selected = useMemo(() => new Set(selectedIds), [selectedIds])
    const [search, setSearch] = useState('')
    const [tagMembers, setTagMembers] = useState<Record<string, Member[]>>({})
    const [loadingTag, setLoadingTag] = useState<string | null>(null)

    /* inline creation dialogs */
    const [showNewGroup, setShowNewGroup] = useState(false)
    const [showNewTag, setShowNewTag] = useState(false)
    const [newGroupName, setNewGroupName] = useState('')
    const [newGroupEmoji, setNewGroupEmoji] = useState('👥')
    const [newTagName, setNewTagName] = useState('')
    const [newTagColor, setNewTagColor] = useState('#0A84FF')

    /* all known members (friends + group members who aren't friends) */
    const allMembersById = useMemo(() => {
        const m = memberMap(groups)
        friends.forEach(f => m.set(f.id, { id: f.id, name: f.alias || f.name, emoji: f.emoji, color: f.color }))
        return m
    }, [friends, groups])

    /* ── toggle helpers ── */
    const toggle = (id: string) => {
        const next = new Set(selected)
        if (next.has(id)) next.delete(id); else next.add(id)
        onChange([...next])
    }

    const batchAdd = (ids: string[]) => {
        const next = new Set(selected)
        ids.forEach(id => next.add(id))
        onChange([...next])
    }

    const batchRemove = (ids: string[]) => {
        const next = new Set(selected)
        ids.forEach(id => next.delete(id))
        onChange([...next])
    }

    /* ── group logic ── */
    const isGroupActive = (g: Group) => g.members.length > 0 && g.members.every(m => selected.has(m.id))

    const toggleGroup = (g: Group) => {
        const ids = g.members.map(m => m.id)
        if (isGroupActive(g)) batchRemove(ids); else batchAdd(ids)
    }

    /* ── tag logic ── */
    const resolveTag = async (tagId: string) => {
        if (tagMembers[tagId]) return tagMembers[tagId]
        setLoadingTag(tagId)
        try {
            const members = await getFriendsByTag(tagId)
            setTagMembers(prev => ({ ...prev, [tagId]: members }))
            return members
        } finally {
            setLoadingTag(null)
        }
    }

    const isTagActive = (t: Tag) => {
        const members = tagMembers[t.id]
        if (!members || members.length === 0) return false
        return members.every(m => selected.has(m.id))
    }

    const toggleTag = async (t: Tag) => {
        const members = await resolveTag(t.id)
        if (!members || members.length === 0) return
        const ids = members.map(m => m.id)
        if (isTagActive(t)) batchRemove(ids); else batchAdd(ids)
    }

    /* ── friends A-Z ── */
    const filtered = useMemo(() => {
        if (!search.trim()) return friends
        const q = search.toLowerCase()
        return friends.filter(f =>
            f.name.toLowerCase().includes(q) ||
            (f.alias && f.alias.toLowerCase().includes(q)) ||
            (f._pinyinSortKey && f._pinyinSortKey.includes(q))
        )
    }, [friends, search])

    const grouped = useMemo(() => groupByInitial(filtered), [filtered])

    /* ── inline creation ── */
    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) return
        try {
            const g = await createGroup(newGroupName.trim(), newGroupEmoji, [])
            await mutateGroups()
            setShowNewGroup(false)
            setNewGroupName('')
            setNewGroupEmoji('👥')
            // Auto-select the new group (has only current user)
            if (g.members) toggleGroup(g)
        } catch { /* toast could go here */ }
    }

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return
        try {
            await createTag(newTagName.trim(), newTagColor)
            await mutateTags()
            setShowNewTag(false)
            setNewTagName('')
            setNewTagColor('#0A84FF')
        } catch { /* toast could go here */ }
    }

    return (
        <div className="mp-container">
            {/* ── Personalization placeholder (hidden) ── */}
            {/* <div className="mp-section mp-personalized">Future: last-used group, frequent contacts</div> */}

            {/* ── Groups ── */}
            <div className="mp-section">
                <div className="mp-label">📁 群组</div>
                <div className="mp-chips">
                    {groups.map(g => (
                        <button
                            key={g.id}
                            className={`mp-chip ${isGroupActive(g) ? 'mp-chip-active' : ''}`}
                            onClick={() => toggleGroup(g)}
                        >
                            <span className="mp-chip-emoji">{g.emoji}</span>
                            <span>{g.name}</span>
                            <span className="mp-chip-count">({g.members.length})</span>
                        </button>
                    ))}
                    <button className="mp-chip mp-chip-add" onClick={() => setShowNewGroup(true)}>＋ 新群组</button>
                </div>
            </div>

            {/* ── Tags ── */}
            <div className="mp-section">
                <div className="mp-label">🏷️ 标签</div>
                <div className="mp-chips">
                    {tags.map(t => (
                        <button
                            key={t.id}
                            className={`mp-chip ${isTagActive(t) ? 'mp-chip-active' : ''}`}
                            onClick={() => toggleTag(t)}
                            disabled={loadingTag === t.id}
                            style={{ borderColor: t.color }}
                        >
                            {loadingTag === t.id ? '...' : t.name}
                        </button>
                    ))}
                    <button className="mp-chip mp-chip-add" onClick={() => setShowNewTag(true)}>＋ 新标签</button>
                </div>
            </div>

            {/* ── Friends A-Z ── */}
            <div className="mp-section mp-friends-section">
                <div className="mp-label">👤 好友</div>
                <input
                    className="mp-search"
                    type="text"
                    placeholder="🔍 搜索好友..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <div className="mp-friends-list">
                    {grouped.map(group => (
                        <div key={group.letter}>
                            <div className="mp-letter-header">{group.letter}</div>
                            {group.items.map(f => (
                                <button
                                    key={f.id}
                                    className={`mp-friend-row ${selected.has(f.id) ? 'mp-friend-selected' : ''}`}
                                    onClick={() => toggle(f.id)}
                                >
                                    <span className="mp-check">{selected.has(f.id) ? '☑' : '☐'}</span>
                                    <span className="mp-friend-emoji">{f.emoji}</span>
                                    <span className="mp-friend-name">{f.alias || f.name}</span>
                                </button>
                            ))}
                        </div>
                    ))}
                    {grouped.length === 0 && <div className="mp-empty">没有找到好友</div>}
                </div>
            </div>

            {/* ── Bubble bar ── */}
            {selectedIds.length > 0 && (
                <div className="mp-bubble-bar">
                    <div className="mp-bubble-scroll">
                        {selectedIds.map(id => {
                            const m = allMembersById.get(id)
                            if (!m) return null
                            return (
                                <span key={id} className="mp-bubble">
                                    {m.emoji} {m.name}
                                    <button className="mp-bubble-x" onClick={() => toggle(id)}>✕</button>
                                </span>
                            )
                        })}
                    </div>
                    <div className="mp-bubble-count">已选 {selectedIds.length} 人</div>
                </div>
            )}

            {/* ── Inline Create Group Dialog ── */}
            {showNewGroup && (
                <div className="mp-dialog-overlay" onClick={() => setShowNewGroup(false)}>
                    <div className="mp-dialog" onClick={e => e.stopPropagation()}>
                        <div className="mp-dialog-title">新建群组</div>
                        <div className="mp-dialog-row">
                            <label>Emoji</label>
                            <input value={newGroupEmoji} onChange={e => setNewGroupEmoji(e.target.value)} className="mp-dialog-input" style={{ width: 60 }} />
                        </div>
                        <div className="mp-dialog-row">
                            <label>名称</label>
                            <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="群组名称" className="mp-dialog-input" autoFocus />
                        </div>
                        <div className="mp-dialog-actions">
                            <button className="mp-dialog-cancel" onClick={() => setShowNewGroup(false)}>取消</button>
                            <button className="mp-dialog-confirm" onClick={handleCreateGroup} disabled={!newGroupName.trim()}>创建</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Inline Create Tag Dialog ── */}
            {showNewTag && (
                <div className="mp-dialog-overlay" onClick={() => setShowNewTag(false)}>
                    <div className="mp-dialog" onClick={e => e.stopPropagation()}>
                        <div className="mp-dialog-title">新建标签</div>
                        <div className="mp-dialog-row">
                            <label>名称</label>
                            <input value={newTagName} onChange={e => setNewTagName(e.target.value)} placeholder="标签名称" className="mp-dialog-input" autoFocus />
                        </div>
                        <div className="mp-dialog-row">
                            <label>颜色</label>
                            <input type="color" value={newTagColor} onChange={e => setNewTagColor(e.target.value)} style={{ width: 40, height: 32, border: 'none', cursor: 'pointer' }} />
                        </div>
                        <div className="mp-dialog-actions">
                            <button className="mp-dialog-cancel" onClick={() => setShowNewTag(false)}>取消</button>
                            <button className="mp-dialog-confirm" onClick={handleCreateTag} disabled={!newTagName.trim()}>创建</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
