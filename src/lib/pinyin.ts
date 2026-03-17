import { pinyin } from 'pinyin-pro'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export function getInitial(name: string): string {
  if (!name) return '#'
  const first = name.charAt(0)
  // If already A-Z letter
  if (/^[a-zA-Z]$/.test(first)) return first.toUpperCase()
  // Chinese character → get pinyin initial
  const py = pinyin(first, { pattern: 'first', toneType: 'none' })
  if (py && /^[a-zA-Z]$/.test(py.charAt(0))) return py.charAt(0).toUpperCase()
  return '#'
}

export function getPinyinSortKey(name: string): string {
  if (!name) return '~'
  return pinyin(name, { toneType: 'none', type: 'array' }).join('').toLowerCase()
}

export interface GroupedContacts<T> {
  letter: string
  items: T[]
}

export interface PinyinCacheable {
  _pinyinInitial?: string
  _pinyinSortKey?: string
}

export function groupByInitial<T extends PinyinCacheable>(items: T[]): GroupedContacts<T>[] {
  // Sort by cached _pinyinSortKey
  const sorted = [...items].sort((a, b) =>
    (a._pinyinSortKey || '~').localeCompare(b._pinyinSortKey || '~')
  )

  const groups: Record<string, T[]> = {}
  sorted.forEach(item => {
    const letter = item._pinyinInitial || '#'
    if (!groups[letter]) groups[letter] = []
    groups[letter].push(item)
  })

  // Order: A-Z then #
  const result: GroupedContacts<T>[] = []
  LETTERS.forEach(l => {
    if (groups[l]) result.push({ letter: l, items: groups[l] })
  })
  if (groups['#']) result.push({ letter: '#', items: groups['#'] })

  return result
}

export function getActiveLetters<T extends PinyinCacheable>(items: T[]): string[] {
  const letters = new Set<string>()
  items.forEach(item => letters.add(item._pinyinInitial || '#'))
  const result: string[] = []
  LETTERS.forEach(l => { if (letters.has(l)) result.push(l) })
  if (letters.has('#')) result.push('#')
  return result
}

export { LETTERS }
