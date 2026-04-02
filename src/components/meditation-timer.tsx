'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/utils'
import { MEDITATION_TIMES } from '@/lib/constants'
import { getSoundGenerator } from '@/components/audio-player'
import { Button } from '@/components/ui/button'

interface MeditationTimerProps {
  onComplete: (durationSec: number) => void
}

type Phase = 'select' | 'running' | 'completed'
type BreathPhase = 'in' | 'out'

export function MeditationTimer({ onComplete }: MeditationTimerProps) {
  const [phase, setPhase] = useState<Phase>('select')
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('in')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const breathRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const progress = totalSeconds > 0 ? (totalSeconds - remaining) / totalSeconds : 0
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (breathRef.current) clearInterval(breathRef.current)
  }, [])

  const startMeditation = useCallback((seconds: number) => {
    setTotalSeconds(seconds)
    setRemaining(seconds)
    setPhase('running')

    // 시작 종소리
    getSoundGenerator().playBell(1)

    // 호흡 가이드 (4초 들숨 + 4초 날숨)
    breathRef.current = setInterval(() => {
      setBreathPhase(prev => prev === 'in' ? 'out' : 'in')
    }, 4000)
  }, [])

  useEffect(() => {
    if (phase !== 'running') return

    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          cleanup()
          setPhase('completed')
          // 완료 종소리 3번
          getSoundGenerator().playBell(3)
          onComplete(totalSeconds)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return cleanup
  }, [phase, cleanup, totalSeconds, onComplete])

  const stopMeditation = useCallback(() => {
    cleanup()
    const elapsed = totalSeconds - remaining
    if (elapsed > 30) {
      onComplete(elapsed)
    }
    setPhase('select')
    setRemaining(0)
    setTotalSeconds(0)
  }, [cleanup, totalSeconds, remaining, onComplete])

  if (phase === 'select') {
    return (
      <div className="flex flex-col items-center gap-8">
        <p className="text-muted text-sm">명상 시간을 선택하세요</p>
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          {MEDITATION_TIMES.map(({ label, seconds }) => (
            <Button
              key={seconds}
              variant="outline"
              size="lg"
              onClick={() => startMeditation(seconds)}
              className="text-xl py-6"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  if (phase === 'completed') {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="text-6xl">🪷</div>
        <h2 className="text-2xl font-bold text-success">명상 완료</h2>
        <p className="text-muted">
          {Math.floor(totalSeconds / 60)}분 명상을 마쳤습니다
        </p>
        <Button
          variant="outline"
          onClick={() => { setPhase('select'); setTotalSeconds(0) }}
        >
          다시 시작
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* 타이머 원형 프로그레스 */}
      <div className="relative">
        <svg width="280" height="280" viewBox="0 0 280 280">
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke="rgba(212,165,116,0.15)"
            strokeWidth="6"
          />
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke="#d4a574"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 140 140)"
            className="transition-all duration-1000"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold text-accent tabular-nums">
            {formatTime(remaining)}
          </span>
        </div>
      </div>

      {/* 호흡 가이드 */}
      <div className="flex flex-col items-center gap-3">
        <div
          className={cn(
            'w-16 h-16 rounded-full bg-accent/30 border-2 border-accent/50',
            breathPhase === 'in' ? 'breathe-in' : 'breathe-out'
          )}
        />
        <p className="text-accent text-sm font-medium">
          {breathPhase === 'in' ? '들숨 (코로 천천히)' : '날숨 (입으로 천천히)'}
        </p>
      </div>

      <Button variant="ghost" onClick={stopMeditation}>
        명상 중단
      </Button>
    </div>
  )
}
