'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
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
      <div className="px-5 py-8 space-y-6">
        <div className="text-center animate-in">
          <h1 className="text-2xl font-bold">
            <span className="gradient-text">경전</span>
          </h1>
          <p className="text-sm text-muted mt-1.5">부처님의 말씀을 읽고 묵상하세요</p>
        </div>

        <div className="space-y-3">
          {SUTRAS.map((sutra, i) => (
            <div key={sutra.id} className={cn('animate-in', `stagger-${i + 1}`)}>
              <Card
                hover
                variant="glass"
                onClick={() => setSelected(sutra)}
                className="flex items-center gap-4"
              >
                <div className="w-11 h-11 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                  <BookOpen size={20} className="text-accent" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-foreground">{sutra.title}</h3>
                  <p className="text-xs text-muted/60 mt-0.5 truncate">{sutra.description}</p>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const hasChinese = selected.verses.some(v => v.chinese)

  return (
    <div className="px-5 py-8 space-y-4">
      <div className="flex items-center gap-3 animate-in">
        <button
          onClick={() => { setSelected(null); setCommentary({}) }}
          className="p-2 -ml-2 text-muted hover:text-foreground transition-colors rounded-xl hover:bg-card-bg"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold gradient-text">{selected.title}</h1>
          <p className="text-xs text-muted/60">{selected.description}</p>
        </div>
        {hasChinese && (
          <button
            onClick={() => setShowChinese(!showChinese)}
            className={cn(
              'p-2.5 rounded-xl transition-all',
              showChinese ? 'bg-accent/15 text-accent' : 'text-muted/50 hover:text-muted'
            )}
          >
            <Languages size={18} />
          </button>
        )}
      </div>

      <div className="space-y-1 animate-in stagger-1">
        {selected.verses.map((verse, idx) => {
          if (!verse.korean && !verse.chinese) {
            return <div key={idx} className="h-4" />
          }
          return (
            <div key={idx} className="group">
              <div
                className="py-2.5 px-3 rounded-xl hover:bg-card-bg cursor-pointer transition-colors"
                onClick={() => verse.korean && getCommentary(verse.korean, idx)}
              >
                <p className="text-[15px] text-foreground/85 leading-relaxed">{verse.korean}</p>
                {showChinese && verse.chinese && (
                  <p className="text-sm text-accent/50 mt-1">{verse.chinese}</p>
                )}
                {loadingIdx === idx && (
                  <p className="text-xs text-muted/50 mt-2 animate-pulse">AI 해설 생성 중...</p>
                )}
                {commentary[idx] && (
                  <Card variant="glass" className="mt-2 p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Sparkles size={12} className="text-accent" />
                      <span className="text-[10px] text-accent font-semibold tracking-wide">AI 해설</span>
                    </div>
                    <p className="text-xs text-foreground/70 leading-relaxed">{commentary[idx]}</p>
                  </Card>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-center pt-4">
        <p className="text-xs text-muted/40">구절을 터치하면 AI 해설을 볼 수 있습니다</p>
      </div>
    </div>
  )
}
