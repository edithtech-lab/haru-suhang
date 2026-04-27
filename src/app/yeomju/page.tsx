'use client'

import { useState, useCallback, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MANTRAS } from '@/lib/sutras'
import { SUTRAS as YEOBUL_SUTRAS } from '@/lib/constants'
import { getSoundGenerator } from '@/components/audio-player'
import { useAuth } from '@/lib/auth-context'
import { savePractice } from '@/lib/practice-store'
import { cn } from '@/lib/utils'
import { RotateCcw, Check } from 'lucide-react'
import { MoodBackdrop } from '@/components/mood-backdrop'

type Mode = 'yeomju' | 'dokgyeong'
type SutraKey = keyof typeof YEOBUL_SUTRAS

const BEAD_COUNT = 108
const BEAD_ANGLES = Array.from({ length: 27 }, (_, i) => (i * 360) / 27)

export default function YeomjuPage() {
  const { user } = useAuth()
  const [mode, setMode] = useState<Mode>('yeomju')
  const [count, setCount] = useState(0)
  const [completed, setCompleted] = useState(false)
  const startTimeRef = useRef(0)
  const [mantraId, setMantraId] = useState(MANTRAS[0].id)
  const mantra = MANTRAS.find(m => m.id === mantraId)!
  const activeBeadIdx = Math.floor((count % 27))
  const [selectedSutra, setSelectedSutra] = useState<SutraKey>('나무아미타불')

  const handleReset = useCallback(() => {
    setCount(0)
    setCompleted(false)
    startTimeRef.current = 0
  }, [])

  const switchMode = useCallback((newMode: Mode) => {
    setMode(newMode)
    handleReset()
  }, [handleReset])

  const handleCount = useCallback(() => {
    if (completed) return
    if (count === 0) startTimeRef.current = Date.now()
    if (navigator.vibrate) navigator.vibrate(30)
    getSoundGenerator().playMoktak()
    const newCount = count + 1
    setCount(newCount)
    if (newCount >= BEAD_COUNT) {
      setCompleted(true)
      setTimeout(() => getSoundGenerator().playBell(1), 300)
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)
      savePractice(user?.id ?? null, 'yeobul', duration, BEAD_COUNT, true)
    }
  }, [count, completed, user])

  return (
    <div className="px-5 py-8 space-y-6">
      <MoodBackdrop mood="olive" />
      <div className="text-center animate-in">
        <h1 className="text-2xl font-bold">
          <span className="gradient-text">염불</span>
        </h1>
        <p className="text-sm text-muted mt-1.5">만트라와 경전으로 마음을 모으세요</p>
      </div>

      {/* 모드 탭 */}
      <div className="animate-in stagger-1 flex p-1 rounded-2xl bg-card-bg border border-card-border">
        {(['yeomju', 'dokgyeong'] as const).map(m => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={cn(
              'flex-1 py-2.5 text-sm font-medium rounded-xl transition-all',
              mode === m
                ? 'bg-accent text-[#0f0d0a] shadow-sm'
                : 'text-muted'
            )}
          >
            {m === 'yeomju' ? '염주' : '독경'}
          </button>
        ))}
      </div>

      <div className="animate-in stagger-2">
        {mode === 'yeomju' ? (
          <>
            {/* 만트라 선택 */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
              {MANTRAS.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setMantraId(m.id); handleReset() }}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all',
                    mantraId === m.id
                      ? 'bg-accent/15 text-accent font-medium border border-accent/30'
                      : 'text-muted/50 border border-transparent hover:text-muted'
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
                  <defs>
                    <radialGradient id="beadActive">
                      <stop offset="0%" stopColor="#e8d5b7" />
                      <stop offset="100%" stopColor="#c9a87c" />
                    </radialGradient>
                  </defs>
                  {BEAD_ANGLES.map((angle, idx) => {
                    const rad = (angle - 90) * (Math.PI / 180)
                    const cx = 150 + 120 * Math.cos(rad)
                    const cy = 150 + 120 * Math.sin(rad)
                    const isActive = idx === activeBeadIdx
                    const isPassed = idx < activeBeadIdx || (count >= 27 && idx <= activeBeadIdx)
                    return (
                      <circle
                        key={idx}
                        cx={cx} cy={cy}
                        r={isActive ? 10 : 7}
                        fill={
                          completed ? '#6ecf8e'
                            : isActive ? 'url(#beadActive)'
                              : isPassed ? '#c9a87c'
                                : 'rgba(201,168,124,0.15)'
                        }
                        className="transition-all duration-200"
                      />
                    )
                  })}
                  <circle cx="150" cy="270" r="12" fill={completed ? '#6ecf8e' : '#c9a87c'} />
                  <line x1="150" y1="282" x2="150" y2="298" stroke={completed ? '#6ecf8e' : '#c9a87c'} strokeWidth="2" />
                  <line x1="145" y1="298" x2="155" y2="298" stroke={completed ? '#6ecf8e' : '#c9a87c'} strokeWidth="2" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={cn('text-4xl font-bold tracking-tight', completed ? 'text-success' : 'gradient-text')}>
                    {count}
                  </span>
                  <span className="text-xs text-muted/50 mt-1">/ {BEAD_COUNT}</span>
                </div>
              </div>
            </div>

            <Card variant="glass" className="text-center mt-6">
              <p className={cn('text-lg font-medium', completed ? 'text-success' : 'gradient-text')}>
                {completed ? '염주 수행을 마쳤습니다' : mantra.text}
              </p>
              {!completed && (
                <p className="text-xs text-muted/50 mt-2">염주를 터치하며 {mantra.label}을 외우세요</p>
              )}
            </Card>
          </>
        ) : (
          <>
            {/* 경전 선택 */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
              {(Object.keys(YEOBUL_SUTRAS) as SutraKey[]).map(key => (
                <button
                  key={key}
                  onClick={() => { setSelectedSutra(key); handleReset() }}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all',
                    selectedSutra === key
                      ? 'bg-accent/15 text-accent font-medium border border-accent/30'
                      : 'text-muted/50 border border-transparent hover:text-muted'
                  )}
                >
                  {key}
                </button>
              ))}
            </div>

            <Card variant="glass" className="min-h-[120px]">
              <p className="text-foreground/80 leading-relaxed whitespace-pre-line text-center text-[15px]">
                {YEOBUL_SUTRAS[selectedSutra]}
              </p>
            </Card>

            <div className="flex flex-col items-center gap-4 mt-6">
              <div className="text-center">
                <span className="text-4xl font-bold gradient-text">{count}</span>
                <span className="text-muted/50 text-lg ml-1">/ {BEAD_COUNT}</span>
              </div>
              <button
                onClick={handleCount}
                disabled={completed}
                className={cn(
                  'w-28 h-28 rounded-full flex items-center justify-center text-3xl transition-all active:scale-95',
                  completed
                    ? 'bg-success/10 border border-success/30'
                    : 'bg-accent/10 border border-accent/20 hover:bg-accent/15 glow-pulse'
                )}
              >
                {completed ? <Check size={36} className="text-success" /> : '🪘'}
              </button>
              <p className="text-sm text-muted/50">
                {completed ? '독경을 마쳤습니다' : '목탁을 터치하여 염불하세요'}
              </p>
            </div>
          </>
        )}
      </div>

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
