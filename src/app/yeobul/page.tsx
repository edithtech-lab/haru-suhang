'use client'

import { useState, useRef, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getSoundGenerator } from '@/components/audio-player'
import { useAuth } from '@/lib/auth-context'
import { savePractice } from '@/lib/practice-store'
import { SUTRAS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

type SutraKey = keyof typeof SUTRAS

export default function YeobulPage() {
  const { user } = useAuth()
  const [selectedSutra, setSelectedSutra] = useState<SutraKey>('나무아미타불')
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const [completed, setCompleted] = useState(false)
  const startTimeRef = useRef(Date.now())
  const TARGET = 108

  const handleMoktak = useCallback(() => {
    if (completed) return
    if (!started) {
      setStarted(true)
      startTimeRef.current = Date.now()
    }
    getSoundGenerator().playMoktak()
    const newCount = count + 1
    setCount(newCount)

    if (newCount >= TARGET) {
      setCompleted(true)
      setTimeout(() => getSoundGenerator().playBell(1), 300)
      const durationSec = Math.floor((Date.now() - startTimeRef.current) / 1000)
      savePractice(user?.id ?? null, 'yeobul', durationSec, TARGET, true)
    }
  }, [count, started, completed, user])

  const handleReset = () => {
    setCount(0)
    setStarted(false)
    setCompleted(false)
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">예불</h1>
        <p className="text-sm text-muted mt-1">염불과 함께 마음을 가다듬으세요</p>
      </div>

      {/* 경전 선택 */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(Object.keys(SUTRAS) as SutraKey[]).map(key => (
          <button
            key={key}
            onClick={() => { setSelectedSutra(key); handleReset() }}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors',
              selectedSutra === key
                ? 'bg-accent text-[#1a1410] font-medium'
                : 'bg-card-bg text-muted border border-card-border'
            )}
          >
            {key}
          </button>
        ))}
      </div>

      {/* 경전 텍스트 */}
      <Card className="min-h-[120px]">
        <p className="text-foreground leading-relaxed whitespace-pre-line text-center text-[15px]">
          {SUTRAS[selectedSutra]}
        </p>
      </Card>

      {/* 목탁 버튼 + 카운터 */}
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <span className="text-4xl font-bold text-accent">{count}</span>
          <span className="text-muted text-lg ml-1">/ {TARGET}</span>
        </div>

        <button
          onClick={handleMoktak}
          disabled={completed}
          className={cn(
            'w-32 h-32 rounded-full flex items-center justify-center text-3xl transition-all active:scale-95',
            completed
              ? 'bg-success/20 border-2 border-success'
              : 'bg-accent/20 border-2 border-accent hover:bg-accent/30'
          )}
        >
          {completed ? <Check size={40} className="text-success" /> : '🪘'}
        </button>

        <p className="text-sm text-muted">
          {completed ? '예불을 마쳤습니다' : '목탁을 터치하여 염불하세요'}
        </p>

        {(started || completed) && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            다시 시작
          </Button>
        )}
      </div>
    </div>
  )
}
