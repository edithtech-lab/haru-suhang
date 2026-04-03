'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SUTRAS } from '@/lib/sutras'
import type { Sutra } from '@/lib/sutras'
import { cn } from '@/lib/utils'
import { Sparkles, ChevronLeft, BookOpen, Languages } from 'lucide-react'

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

  if (!selected) {
    return (
      <div className="px-4 py-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">경전</h1>
          <p className="text-sm text-muted mt-1">부처님의 말씀을 읽고 묵상하세요</p>
        </div>

        <div className="space-y-3">
          {SUTRAS.map(sutra => (
            <Card
              key={sutra.id}
              hover
              onClick={() => setSelected(sutra)}
              className="flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                <BookOpen size={20} className="text-accent" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-foreground">{sutra.title}</h3>
                <p className="text-xs text-muted mt-0.5 truncate">{sutra.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const hasChinese = selected.verses.some(v => v.chinese)

  return (
    <div className="px-4 py-6 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setSelected(null); setCommentary({}) }}
          className="p-2 -ml-2 text-muted hover:text-foreground"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">{selected.title}</h1>
          <p className="text-xs text-muted">{selected.description}</p>
        </div>
        {hasChinese && (
          <button
            onClick={() => setShowChinese(!showChinese)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              showChinese ? 'bg-accent/20 text-accent' : 'text-muted hover:text-foreground'
            )}
          >
            <Languages size={20} />
          </button>
        )}
      </div>

      {/* 경전 본문 */}
      <div className="space-y-1">
        {selected.verses.map((verse, idx) => {
          if (!verse.korean && !verse.chinese) {
            return <div key={idx} className="h-4" />
          }

          return (
            <div key={idx} className="group">
              <div
                className="py-2 px-3 rounded-lg hover:bg-card-bg cursor-pointer transition-colors"
                onClick={() => verse.korean && getCommentary(verse.korean, idx)}
              >
                <p className="text-[15px] text-foreground leading-relaxed">
                  {verse.korean}
                </p>
                {showChinese && verse.chinese && (
                  <p className="text-sm text-accent/70 mt-1">{verse.chinese}</p>
                )}

                {loadingIdx === idx && (
                  <p className="text-xs text-muted mt-2 animate-pulse">AI 해설 생성 중...</p>
                )}

                {commentary[idx] && (
                  <div className="mt-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles size={12} className="text-accent" />
                      <span className="text-[10px] text-accent font-medium">AI 해설</span>
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed">{commentary[idx]}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* 하단 안내 */}
      <div className="text-center pt-4">
        <p className="text-xs text-muted">구절을 터치하면 AI 해설을 볼 수 있습니다</p>
      </div>
    </div>
  )
}
