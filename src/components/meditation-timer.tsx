'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/utils'
import { MEDITATION_TIMES } from '@/lib/constants'
import { getSoundGenerator } from '@/components/audio-player'
import { AMBIENT_SOUNDS } from '@/components/ambient-sounds'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

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
  const [selectedSound, setSelectedSound] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const breathRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const audioStopRef = useRef<(() => void) | null>(null)

  const progress = totalSeconds > 0 ? (totalSeconds - remaining) / totalSeconds : 0
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (breathRef.current) clearInterval(breathRef.current)
    if (audioStopRef.current) {
      audioStopRef.current()
      audioStopRef.current = null
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close()
      audioCtxRef.current = null
    }
  }, [])

  const startMeditation = useCallback((seconds: number) => {
    setTotalSeconds(seconds)
    setRemaining(seconds)
    setPhase('running')

    getSoundGenerator().playBell(1)

    breathRef.current = setInterval(() => {
      setBreathPhase(prev => prev === 'in' ? 'out' : 'in')
    }, 4000)

    if (selectedSound) {
      const sound = AMBIENT_SOUNDS.find(s => s.id === selectedSound)
      if (sound) {
        const ctx = new AudioContext()
        audioCtxRef.current = ctx
        const { node, stop } = sound.create(ctx)
        node.connect(ctx.destination)
        audioStopRef.current = stop
      }
    }
  }, [selectedSound])

  useEffect(() => {
    if (phase !== 'running') return

    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          cleanup()
          setPhase('completed')
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
      <div className="flex flex-col items-center gap-8 w-full">
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          {MEDITATION_TIMES.map(({ label, seconds }) => (
            <Card
              key={seconds}
              hover
              variant="glass"
              className="text-center py-6 cursor-pointer"
              onClick={() => startMeditation(seconds)}
            >
              <span className="text-xl font-bold gradient-text">{label}</span>
            </Card>
          ))}
        </div>

        {/* 배경음 선택 */}
        <div className="w-full max-w-xs space-y-3">
          <p className="text-xs text-muted/60 text-center font-medium tracking-wide">배경음</p>
          <div className="grid grid-cols-3 gap-2">
            {AMBIENT_SOUNDS.map(sound => (
              <button
                key={sound.id}
                onClick={() => setSelectedSound(prev => prev === sound.id ? null : sound.id)}
                className={cn(
                  'flex flex-col items-center gap-1 py-3 rounded-xl text-xs transition-all',
                  selectedSound === sound.id
                    ? 'glass text-accent font-medium'
                    : 'text-muted/50 hover:text-muted'
                )}
              >
                <span className="text-lg">{sound.emoji}</span>
                <span>{sound.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'completed') {
    return (
      <div className="flex flex-col items-center gap-6 animate-in">
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
      <div className="relative">
        <svg width="280" height="280" viewBox="0 0 280 280">
          <circle
            cx="140" cy="140" r={radius}
            fill="none" stroke="rgba(201,168,124,0.08)" strokeWidth="5"
          />
          <defs>
            <linearGradient id="meditGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c9a87c" />
              <stop offset="100%" stopColor="#e8d5b7" />
            </linearGradient>
          </defs>
          <circle
            cx="140" cy="140" r={radius}
            fill="none" stroke="url(#meditGrad)" strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 140 140)"
            className="transition-all duration-1000"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold gradient-text tabular-nums">
            {formatTime(remaining)}
          </span>
          {selectedSound && (
            <span className="text-xs text-muted/50 mt-2">
              {AMBIENT_SOUNDS.find(s => s.id === selectedSound)?.emoji}{' '}
              {AMBIENT_SOUNDS.find(s => s.id === selectedSound)?.name}
            </span>
          )}
        </div>
      </div>

      {/* 호흡 가이드 */}
      <div className="flex flex-col items-center gap-3">
        <div
          className={cn(
            'w-14 h-14 rounded-full border border-accent/30',
            breathPhase === 'in' ? 'breathe-in bg-accent/10' : 'breathe-out bg-accent/10'
          )}
        />
        <p className="text-accent/70 text-sm font-medium">
          {breathPhase === 'in' ? '들숨' : '날숨'}
        </p>
      </div>

      <Button variant="ghost" onClick={stopMeditation}>
        명상 중단
      </Button>
    </div>
  )
}
