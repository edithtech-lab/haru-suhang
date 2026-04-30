// 즐겨찾기 저장소 — 글귀, 경전 구절, AI 법문 답변 통합
// localStorage 기반 (Phase 1), 로그인 시 Supabase 동기화는 추후 추가

'use client'

export type FavoriteType = 'wisdom' | 'sutra' | 'chat'

export interface Favorite {
  id: string
  type: FavoriteType
  content: string
  meta?: {
    source?: string
    sutraId?: string
    verseIdx?: number
    chinese?: string
    [key: string]: unknown
  }
  createdAt: string
}

const KEY = 'haru-favorites'
const EVENT = 'haru-favorites-changed'

function load(): Favorite[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Favorite[]) : []
  } catch {
    return []
  }
}

function save(items: Favorite[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
    window.dispatchEvent(new CustomEvent(EVENT))
  } catch {
    // 저장 실패 무시
  }
}

export function getFavorites(): Favorite[] {
  return load()
}

export function isFavorite(id: string): boolean {
  return load().some(f => f.id === id)
}

export function addFavorite(f: Omit<Favorite, 'createdAt'>): boolean {
  const items = load()
  if (items.some(x => x.id === f.id)) return false
  items.unshift({ ...f, createdAt: new Date().toISOString() })
  save(items)
  return true
}

export function removeFavorite(id: string): boolean {
  const items = load()
  const next = items.filter(f => f.id !== id)
  if (next.length === items.length) return false
  save(next)
  return true
}

export function toggleFavorite(f: Omit<Favorite, 'createdAt'>): boolean {
  if (isFavorite(f.id)) {
    removeFavorite(f.id)
    return false
  }
  addFavorite(f)
  return true
}

// 외부에서 즐겨찾기 변경을 구독
export function onFavoritesChange(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(EVENT, cb)
  return () => window.removeEventListener(EVENT, cb)
}
