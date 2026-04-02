'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DAILY_WISDOMS } from '@/lib/constants'
import { Sparkles, RefreshCw } from 'lucide-react'

export default function WisdomPage() {
  const [currentIndex, setCurrentIndex] = useState(
    new Date().getDate() % DAILY_WISDOMS.length
  )
  const [commentary, setCommentary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const wisdom = DAILY_WISDOMS[currentIndex]

  const handleRandom = () => {
    let next: number
    do {
      next = Math.floor(Math.random() * DAILY_WISDOMS.length)
    } while (next === currentIndex)
    setCurrentIndex(next)
    setCommentary(null)
  }

  const handleAICommentary = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/wisdom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: wisdom.text, source: wisdom.source }),
      })
      const data = await res.json()
      setCommentary(data.commentary)
    } catch {
      setCommentary('AI 해설을 불러올 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">오늘의 법어</h1>
        <p className="text-sm text-muted mt-1">부처님의 지혜를 일상에</p>
      </div>

      <Card className="space-y-4">
        <p className="text-lg leading-relaxed text-foreground text-center">
          &ldquo;{wisdom.text}&rdquo;
        </p>
        <p className="text-sm text-accent text-right font-medium">
          - {wisdom.source}
        </p>
      </Card>

      <div className="flex gap-3 justify-center">
        <Button variant="outline" size="sm" onClick={handleRandom} className="gap-2">
          <RefreshCw size={14} />
          다른 법어
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAICommentary}
          loading={loading}
          className="gap-2"
        >
          <Sparkles size={14} />
          AI 해설
        </Button>
      </div>

      {commentary && (
        <Card className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent" />
            <h3 className="text-sm font-medium text-accent">AI 해설</h3>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
            {commentary}
          </p>
        </Card>
      )}
    </div>
  )
}
