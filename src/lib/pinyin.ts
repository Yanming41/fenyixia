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

export function groupByInitial<T>(items: T[], getName: (item: T) => string): GroupedContacts<T>[] {
  // Sort by pinyin
  const sorted = [...items].sort((a, b) =>
    getPinyinSortKey(getName(a)).localeCompare(getPinyinSortKey(getName(b)))
  )

  const groups: Record<string, T[]> = {}
  sorted.forEach(item => {
    const letter = getInitial(getName(item))
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

export function getActiveLetters<T>(items: T[], getName: (item: T) => string): string[] {
  const letters = new Set<string>()
  items.forEach(item => letters.add(getInitial(getName(item))))
  const result: string[] = []
  LETTERS.forEach(l => { if (letters.has(l)) result.push(l) })
  if (letters.has('#')) result.push('#')
  return result
}

export { LETTERS }
