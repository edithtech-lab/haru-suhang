'use client'

import { useState, useCallback, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MANTRAS } from '@/lib/sutras'
import { getSoundGenerator } from '@/components/audio-player'
import { useAuth } from '@/lib/auth-context'
import { savePractice } from '@/lib/practice-store'
import { cn } from '@/lib/utils'
import { RotateCcw } from 'lucide-react'

const BEAD_COUNT = 108
const BEAD_ANGLES = Array.from({ length: 27 }, (_, i) => (i * 360) / 27)

export default function YeomjuPage() {
  const { user } = useAuth()
  const [mantraId, setMantraId] = useState(MANTRAS[0].id)
  const [count, setCount] = useState(0)
  const [completed, setCompleted] = useState(false)
  const startTimeRef = useRef(0)

  const mantra = MANTRAS.find(m => m.id === mantraId)!
  const activeBeadIdx = Math.floor((count % 27))

  const handleCount = useCallback(() => {
    if (completed) return

    if (count === 0) startTimeRef.current = Date.now()

    // 진동 피드백
    if (navigator.vibrate) navigator.vibrate(30)
    getSoundGenerator().playMoktak()

    const newCount = count + 1
    setCount(newCount)

    if (newCount >= BEAD_COUNT) {
      setCompleted(true)
      setTimeout(() => getSoundGenerator().playBell(1), 200)
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)
      savePractice(user?.id ?? null, 'yeobul', duration, BEAD_COUNT, true)
    }
  }, [count, completed, user])

  const handleReset = () => {
    setCount(0)
    setCompleted(false)
    startTimeRef.current = Date.now()
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">염주</h1>
        <p className="text-sm text-muted mt-1">만트라와 함께 마음을 모으세요</p>
      </div>

      {/* 만트라 선택 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {MANTRAS.map(m => (
          <button
            key={m.id}
            onClick={() => { setMantraId(m.id); handleReset() }}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors',
              mantraId === m.id
                ? 'bg-accent text-[#1a1410] font-medium'
                : 'bg-card-bg text-muted border border-card-border'
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* 염주 원형 */}
      <div className="flex justify-center">
        <div
          className="relative w-72 h-72 cursor-pointer select-none"
          onClick={handleCount}
          onTouchStart={(e) => { e.preventDefault(); handleCount() }}
        >
          <svg viewBox="0 0 300 300" className="w-full h-full">
            {/* 염주 알 */}
            {BEAD_ANGLES.map((angle, idx) => {
              const rad = (angle - 90) * (Math.PI / 180)
              const cx = 150 + 120 * Math.cos(rad)
              const cy = 150 + 120 * Math.sin(rad)
              const isActive = idx === activeBeadIdx
              const isPassed = idx < activeBeadIdx || (count >= 27 && idx <= activeBeadIdx)

              return (
                <circle
                  key={idx}
                  cx={cx}
                  cy={cy}
                  r={isActive ? 10 : 7}
                  fill={
                    completed ? '#8fbc8f'
                      : isActive ? '#d4a574'
                        : isPassed ? '#d4a574'
                          : 'rgba(212,165,116,0.25)'
                  }
                  className="transition-all duration-200"
                />
              )
            })}

            {/* 모주 (큰 구슬) */}
            <circle cx="150" cy="270" r="12" fill={completed ? '#8fbc8f' : '#d4a574'} />
            {/* 술 */}
            <line x1="150" y1="282" x2="150" y2="298" stroke={completed ? '#8fbc8f' : '#d4a574'} strokeWidth="2" />
            <line x1="145" y1="298" x2="155" y2="298" stroke={completed ? '#8fbc8f' : '#d4a574'} strokeWidth="2" />
          </svg>

          {/* 중앙 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn(
              'text-4xl font-bold',
              completed ? 'text-success' : 'text-accent'
            )}>
              {count}
            </span>
            <span className="text-xs text-muted mt-1">/ {BEAD_COUNT}</span>
          </div>
        </div>
      </div>

      {/* 만트라 텍스트 */}
      <Card className="text-center">
        <p className={cn(
          'text-lg font-medium',
          completed ? 'text-success' : 'text-accent'
        )}>
          {completed ? '염주 수행을 마쳤습니다' : mantra.text}
        </p>
        {!completed && (
          <p className="text-xs text-muted mt-2">
            염주를 터치하며 {mantra.label}을 외우세요
          </p>
        )}
      </Card>

      {/* 컨트롤 */}
      {(count > 0) && (
        <div className="text-center">
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2">
            <RotateCcw size={14} />
            {completed ? '다시 시작' : '초기화'}
          </Button>
        </div>
      )}
    </div>
  )
}
