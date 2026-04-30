'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Heart, Trash2 } from 'lucide-react'
import { MoodBackdrop } from '@/components/mood-backdrop'
import {
  getFavorites,
  removeFavorite,
  onFavoritesChange,
  type Favorite,
  type FavoriteType,
} from '@/lib/favorites-store'

const TYPE_LABEL: Record<FavoriteType, string> = {
  wisdom: '한마디',
  sutra: '경전',
  chat: '법문',
}

const TYPE_HANJA: Record<FavoriteType, string> = {
  wisdom: '一言',
  sutra: '經',
  chat: '法',
}

export default function FavoritesPage() {
  const router = useRouter()
  const [items, setItems] = useState<Favorite[]>([])
  const [filter, setFilter] = useState<FavoriteType | 'all'>('all')

  useEffect(() => {
    setItems(getFavorites())
    return onFavoritesChange(() => setItems(getFavorites()))
  }, [])

  const filtered =
    filter === 'all' ? items : items.filter(f => f.type === filter)

  const counts = {
    all: items.length,
    wisdom: items.filter(f => f.type === 'wisdom').length,
    sutra: items.filter(f => f.type === 'sutra').length,
    chat: items.filter(f => f.type === 'chat').length,
  }

  return (
    <div className="min-h-[calc(100dvh-5rem)] flex flex-col">
      <MoodBackdrop mood="violet" />

      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 pt-5 pb-4">
        <button
          onClick={() => router.back()}
          aria-label="뒤로"
          className="p-2 -ml-2 text-foreground-dim hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <p className="label-upper">Favorites</p>
        <div className="w-8" />
      </header>

      {/* 타이틀 */}
      <section className="px-5 pb-6 animate-in">
        <p className="label-tag mb-2">My Library</p>
        <h1 className="text-foreground text-[28px] tracking-tight font-medium">
          나의 법어집
        </h1>
        <p className="text-foreground-dim text-[12px] mt-2">
          마음에 새기고 싶은 글귀와 가르침을 모아둔 자리
        </p>
      </section>

      {/* 필터 */}
      <section className="px-5 pb-4 animate-in stagger-1">
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'wisdom', 'sutra', 'chat'] as const).map(t => {
            const active = filter === t
            return (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1.5 rounded-full text-[12px] tracking-tight transition-colors border flex items-center gap-1.5 ${
                  active
                    ? 'border-accent bg-[var(--accent-glow)] text-accent'
                    : 'border-[var(--surface-border)] text-foreground-dim hover:text-foreground'
                }`}
              >
                {t === 'all' ? '전체' : TYPE_LABEL[t]}
                <span className="tabular-nums opacity-70">
                  {counts[t]}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* 리스트 */}
      <section className="px-5 pb-12 animate-in stagger-2 flex-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart size={28} strokeWidth={1.2} className="text-muted-deep mb-3" />
            <p className="text-foreground-dim text-[13px]">
              {items.length === 0
                ? '아직 즐겨찾기한 항목이 없어요'
                : '이 분류에는 항목이 없어요'}
            </p>
            <p className="label-tag mt-2">
              한마디 · 경전 · 법문에서 ♡를 눌러 저장해보세요
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map(f => (
              <li
                key={f.id}
                className="surface-paper rounded-2xl p-4 group hover:bg-[var(--surface-hover)] transition-colors"
              >
                <div className="flex items-baseline justify-between mb-2">
                  <p className="label-tag flex items-center gap-1.5">
                    <span>{TYPE_LABEL[f.type]}</span>
                    <span className="font-serif italic text-muted-deep">
                      {TYPE_HANJA[f.type]}
                    </span>
                  </p>
                  <button
                    onClick={() => removeFavorite(f.id)}
                    aria-label="삭제"
                    className="p-1.5 -m-1.5 text-foreground-dim hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={13} strokeWidth={1.5} />
                  </button>
                </div>
                <blockquote className="text-[14px] leading-[1.7] text-foreground/90 tracking-tight mb-2">
                  {f.content}
                </blockquote>
                {f.meta?.source && (
                  <p className="label-upper text-[9px] text-foreground-dim">
                    — {String(f.meta.source)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 푸터 */}
      <footer className="text-center pb-8 mt-auto animate-in stagger-3">
        <p className="font-serif italic text-xs text-muted-deep tracking-wider">
          常隨佛學
        </p>
      </footer>
    </div>
  )
}
