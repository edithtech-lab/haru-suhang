'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, Languages } from 'lucide-react'
import { SUTRAS } from '@/lib/sutras'
import type { Sutra } from '@/lib/sutras'
import { cn } from '@/lib/utils'
import { MoodBackdrop } from '@/components/mood-backdrop'

export default function SutraPage() {
  const [selected, setSelected] = useState<Sutra | null>(null)
  const [showChinese, setShowChinese] = useState(false)
  const [commentary, setCommentary] = useState<Record<number, string>>({})
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null)

  const getCommentary = async (verse: string, idx: number) => {
    if (commentary[idx]) return
    setLoadingIdx(idx)
    try {
      const res = await fetch('/api/wisdom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: verse, source: selected?.title || '경전' }),
      })
      const data = await res.json()
      setCommentary(prev => ({ ...prev, [idx]: data.commentary }))
    } catch {
      setCommentary(prev => ({ ...prev, [idx]: '해설을 불러올 수 없습니다.' }))
    } finally {
      setLoadingIdx(null)
    }
  }

  // ===== 리스트 화면 =====
  if (!selected) {
    return (
      <div className="min-h-[calc(100dvh-5rem)] flex flex-col">
        <MoodBackdrop mood="sepia" />

        {/* 헤더 */}
        <header className="flex items-center justify-between px-5 pt-5 pb-4">
          <Link
            href="/"
            aria-label="뒤로"
            className="p-2 -ml-2 text-foreground-dim hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </Link>
          <p className="label-upper">Sutras</p>
          <div className="w-8" />
        </header>

        {/* 타이틀 */}
        <section className="px-5 pb-6 animate-in">
          <h1 className="text-foreground text-[28px] tracking-tight font-medium">
            경전
          </h1>
          <p className="label-tag mt-1">부처님의 말씀을 읽고 묵상하세요</p>
        </section>

        {/* 경전 리스트 — 큰 텍스트 메뉴 (Open #7 차용) */}
        <section className="animate-in stagger-1 px-5 pb-8">
          <p className="label-upper mb-4">Library</p>
          <ul className="space-y-0">
            {SUTRAS.map((sutra, i) => (
              <li key={sutra.id} className={cn('animate-in', `stagger-${Math.min(i + 1, 6)}`)}>
                <button
                  onClick={() => setSelected(sutra)}
                  className="group w-full flex items-baseline justify-between gap-4 py-5 border-b border-[var(--surface-border)] hover:bg-[var(--surface)] -mx-2 px-2 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-baseline gap-4 flex-1 min-w-0">
                    <span className="label-tag tabular-nums w-5 shrink-0">
                      0{i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground text-[20px] tracking-tight group-hover:text-accent-light transition-colors truncate">
                        {sutra.title}
                      </p>
                      <p className="label-tag mt-1 truncate">
                        {sutra.description}
                      </p>
                    </div>
                  </div>
                  <span className="label-tag text-foreground-dim group-hover:text-accent transition-colors shrink-0">
                    Read →
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    )
  }

  // ===== 디테일 화면 (에디토리얼 리더) =====
  const hasChinese = selected.verses.some(v => v.chinese)

  return (
    <div className="min-h-[calc(100dvh-5rem)] flex flex-col">
      <MoodBackdrop mood="sepia" />

      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 pt-5 pb-4">
        <button
          onClick={() => { setSelected(null); setCommentary({}) }}
          aria-label="뒤로"
          className="p-2 -ml-2 text-foreground-dim hover:text-foreground transition-colors"
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
        </button>
        <p className="label-upper truncate max-w-[60%]">
          {selected.title}
        </p>
        {hasChinese ? (
          <button
            onClick={() => setShowChinese(!showChinese)}
            aria-label="한자 토글"
            className={cn(
              'p-2 -mr-2 transition-colors',
              showChinese ? 'text-accent' : 'text-foreground-dim hover:text-foreground',
            )}
          >
            <Languages size={16} strokeWidth={1.5} />
          </button>
        ) : (
          <div className="w-8" />
        )}
      </header>

      {/* 타이틀 */}
      <section className="px-5 pb-6 animate-in">
        <p className="label-tag">Reading</p>
        <h1 className="text-foreground text-[28px] tracking-tight font-medium mt-1.5">
          {selected.title}
        </h1>
        <p className="label-tag mt-1">{selected.description}</p>
      </section>

      {/* 본문 */}
      <section className="animate-in stagger-1 px-5 pb-12 space-y-1">
        {selected.verses.map((verse, idx) => {
          if (!verse.korean && !verse.chinese) {
            return <div key={idx} className="h-3" />
          }
          return (
            <div key={idx} className="group">
              <div
                className="py-3 px-2 -mx-2 rounded-lg hover:bg-[var(--surface)] cursor-pointer transition-colors"
                onClick={() => verse.korean && getCommentary(verse.korean, idx)}
              >
                <p className="text-[16px] text-foreground/95 leading-[1.7] tracking-tight">
                  {verse.korean}
                </p>
                {showChinese && verse.chinese && (
                  <p
                    className="text-[14px] text-accent/70 mt-1.5 leading-relaxed font-serif"
                  >
                    {verse.chinese}
                  </p>
                )}
                {loadingIdx === idx && (
                  <p className="label-tag mt-2 animate-pulse">AI 해설 생성 중...</p>
                )}
                {commentary[idx] && (
                  <div className="surface-subtle rounded-xl p-3 mt-3">
                    <p className="label-tag text-accent mb-1.5">AI 해설</p>
                    <p className="text-[13px] text-foreground/80 leading-[1.65]">
                      {commentary[idx]}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </section>

      <p className="label-tag text-center pb-8">
        구절을 터치하면 AI 해설을 볼 수 있습니다
      </p>
    </div>
  )
}
