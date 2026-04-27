'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { MANTRAS } from '@/lib/sutras'
import { SUTRAS as YEOBUL_SUTRAS } from '@/lib/constants'
import { getSoundGenerator } from '@/components/audio-player'
import { useAuth } from '@/lib/auth-context'
import { savePractice } from '@/lib/practice-store'
import { cn } from '@/lib/utils'
import { MoodBackdrop } from '@/components/mood-backdrop'
import { Mandala } from '@/components/mandala'

type Mode = 'yeomju' | 'dokgyeong'
type SutraKey = keyof typeof YEOBUL_SUTRAS

const BEAD_COUNT = 108

export default function YeomjuPage() {
  const { user } = useAuth()
  const [mode, setMode] = useState<Mode>('yeomju')
  const [count, setCount] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [pressing, setPressing] = useState(false)
  const startTimeRef = useRef(0)
  const [mantraId, setMantraId] = useState(MANTRAS[0].id)
  const [selectedSutra, setSelectedSutra] = useState<SutraKey>('나무아미타불')
  const mantra = MANTRAS.find(m => m.id === mantraId)!
  const progress = count / BEAD_COUNT

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
    setPressing(true)
    setTimeout(() => setPressing(false), 120)
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
    <div className="min-h-[calc(100dvh-5rem)] flex flex-col">
      <MoodBackdrop mood="olive" />

      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 pt-5 pb-2">
        <Link
          href="/"
          aria-label="뒤로"
          className="p-2 -ml-2 text-foreground-dim hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </Link>
        <p className="label-upper">Chant</p>
        {count > 0 ? (
          <button
            onClick={handleReset}
            aria-label="초기화"
            className="p-2 -mr-2 text-foreground-dim hover:text-foreground transition-colors"
          >
            <RotateCcw size={16} strokeWidth={1.5} />
          </button>
        ) : (
          <div className="w-8" />
        )}
      </header>

      {/* 타이틀 */}
      <section className="px-5 pb-4 animate-in">
        <h1 className="text-foreground text-[26px] tracking-tight font-medium">
          염불
        </h1>
        <p className="label-tag mt-1">진언과 경전으로 마음을 모으세요</p>
      </section>

      {/* 모드 탭 (미니멀 텍스트 탭) */}
      <nav className="px-5 pb-5 flex items-center gap-5 border-b border-[var(--surface-border)] animate-in stagger-1">
        {(['yeomju', 'dokgyeong'] as const).map(m => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={cn(
              'pb-2 text-[15px] tracking-tight transition-all relative',
              mode === m ? 'text-foreground' : 'text-muted hover:text-foreground-dim',
            )}
          >
            {m === 'yeomju' ? '염주' : '독경'}
            {mode === m && (
              <div className="absolute -bottom-[1px] left-0 right-0 h-[1.5px] bg-foreground" />
            )}
          </button>
        ))}
      </nav>

      {/* 콘텐츠 */}
      <section className="flex-1 flex flex-col px-5 pt-6 pb-8 animate-in stagger-2">
        {mode === 'yeomju' ? (
          <>
            {/* 진언 칩 */}
            <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-hide mb-2">
              {MANTRAS.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setMantraId(m.id); handleReset() }}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-[12px] whitespace-nowrap transition-all',
                    mantraId === m.id
                      ? 'bg-foreground text-background'
                      : 'border border-[var(--surface-border)] text-foreground-dim hover:text-foreground',
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* 진언 + 만다라 + 카운트 (탭 영역) */}
            <div
              className="relative flex-1 min-h-[55vh] flex flex-col items-center justify-center cursor-pointer select-none"
              onClick={handleCount}
              onTouchStart={(e) => { e.preventDefault(); handleCount() }}
            >
              {/* 큰 만다라 배경 */}
              <div
                className={cn(
                  'absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-700',
                  pressing && 'scale-[1.02]',
                  completed && 'opacity-60',
                )}
              >
                <Mandala
                  size={260}
                  className={cn(
                    'transition-colors duration-500',
                    completed ? 'text-success/60' : 'text-foreground/22',
                  )}
                  inner
                />
              </div>

              {/* 진행 외곽 회전 */}
              <div
                aria-hidden
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  transform: `rotate(${progress * 360}deg)`,
                  transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <Mandala size={320} className="text-accent/15" />
              </div>

              <div className="relative z-10 text-center px-4">
                <p className="label-upper mb-2 text-foreground-dim">
                  {mantra.label}
                </p>
                <p
                  className={cn(
                    'text-foreground text-[22px] leading-tight tracking-tight transition-opacity duration-300',
                    pressing ? 'opacity-90' : 'opacity-100',
                    completed && 'text-success',
                  )}
                >
                  {completed ? '수행을 마쳤습니다' : mantra.text}
                </p>
                <p
                  className={cn(
                    'text-foreground text-[68px] tracking-tight leading-none tabular-nums font-light mt-6 transition-transform duration-100',
                    pressing && 'scale-[0.96]',
                    completed && 'text-success',
                  )}
                  style={{ fontVariationSettings: '"wght" 280' }}
                >
                  {count}
                </p>
                <p className="label-tag mt-2 tabular-nums">/ {BEAD_COUNT}</p>
              </div>

              {!completed && (
                <p className="absolute bottom-2 label-upper text-foreground-dim animate-in stagger-3">
                  Tap anywhere
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            {/* 경전 칩 */}
            <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-hide mb-4">
              {(Object.keys(YEOBUL_SUTRAS) as SutraKey[]).map(key => (
                <button
                  key={key}
                  onClick={() => { setSelectedSutra(key); handleReset() }}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-[12px] whitespace-nowrap transition-all',
                    selectedSutra === key
                      ? 'bg-foreground text-background'
                      : 'border border-[var(--surface-border)] text-foreground-dim hover:text-foreground',
                  )}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* 경전 본문 */}
            <div className="surface-subtle rounded-2xl p-5 mb-6">
              <p className="text-foreground/90 leading-[1.7] whitespace-pre-line text-[14px] tracking-tight">
                {YEOBUL_SUTRAS[selectedSutra]}
              </p>
            </div>

            {/* 카운트 영역 */}
            <div
              className="relative flex-1 min-h-[40vh] flex flex-col items-center justify-center cursor-pointer select-none"
              onClick={handleCount}
              onTouchStart={(e) => { e.preventDefault(); handleCount() }}
            >
              <div
                className={cn(
                  'absolute inset-0 flex items-center justify-center pointer-events-none',
                  pressing && 'scale-[1.02]',
                )}
              >
                <Mandala
                  size={220}
                  className={cn(
                    'transition-colors',
                    completed ? 'text-success/60' : 'text-foreground/20',
                  )}
                />
              </div>

              <div className="relative z-10 text-center">
                <p className="label-upper mb-2 text-foreground-dim">
                  Recitation
                </p>
                <p
                  className={cn(
                    'text-foreground text-[80px] tracking-tight leading-none tabular-nums font-light transition-transform duration-100',
                    pressing && 'scale-[0.96]',
                    completed && 'text-success',
                  )}
                  style={{ fontVariationSettings: '"wght" 280' }}
                >
                  {count}
                </p>
                <p className="label-tag mt-2 tabular-nums">/ {BEAD_COUNT}</p>
                {completed && (
                  <p className="text-success text-[12px] uppercase tracking-[0.3em] mt-4">
                    Complete
                  </p>
                )}
              </div>

              {!completed && (
                <p className="absolute bottom-2 label-upper text-foreground-dim">
                  Tap to count
                </p>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
