'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Counter108 } from '@/components/counter-108'
import { BowGuidedMode } from '@/components/bow-guided-mode'
import { getSoundGenerator, playCountSound, COUNT_SOUNDS, type CountSoundId } from '@/components/audio-player'
import { useAuth } from '@/lib/auth-context'
import { savePractice } from '@/lib/practice-store'
import { BAE_TARGET } from '@/lib/constants'
import { ArrowLeft, RotateCcw, Music, Play, Activity } from 'lucide-react'
import { MoodBackdrop } from '@/components/mood-backdrop'
import { BottomSheet, OptionRow } from '@/components/bottom-sheet'
import { cn } from '@/lib/utils'

const SOUND_KEY = 'haru-bae108-sound'
const MODE_KEY = 'haru-bae108-mode'

type BowMode = 'guided' | 'manual'

function loadSound(): CountSoundId {
  if (typeof window === 'undefined') return 'moktak'
  const saved = localStorage.getItem(SOUND_KEY)
  if (saved && COUNT_SOUNDS.some(s => s.id === saved)) return saved as CountSoundId
  return 'moktak'
}

function loadMode(): BowMode {
  if (typeof window === 'undefined') return 'guided'
  const saved = localStorage.getItem(MODE_KEY)
  return saved === 'manual' ? 'manual' : 'guided'
}

export default function Bae108Page() {
  const { user } = useAuth()
  const [mode, setMode] = useState<BowMode>('guided')
  const [count, setCount] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [saved, setSaved] = useState(false)
  const startTimeRef = useRef(0)
  const [soundId, setSoundId] = useState<CountSoundId>('moktak')
  const [showSoundSheet, setShowSoundSheet] = useState(false)
  const [autoMode, setAutoMode] = useState(false)
  const [autoError, setAutoError] = useState<string | null>(null)

  // 초기 로드
  useEffect(() => {
    setSoundId(loadSound())
    setMode(loadMode())
  }, [])

  // 모드 변경 시 localStorage 저장 + 상태 초기화
  const changeMode = (m: BowMode) => {
    if (m === mode) return
    setMode(m)
    localStorage.setItem(MODE_KEY, m)
    setCount(0)
    setCompleted(false)
    setSaved(false)
    setAutoMode(false)
  }

  // /bae108?theme=morning|evening|gratitude|wish 쿼리 처리
  const [theme, setTheme] = useState<string | null>(null)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const t = params.get('theme')
    if (t && ['morning', 'evening', 'gratitude', 'wish'].includes(t)) setTheme(t)
  }, [])

  const themeMeta = theme ? {
    morning: { label: '새벽 108배', sub: '하루를 여는 절' },
    evening: { label: '저녁 108배', sub: '하루를 닫는 절' },
    gratitude: { label: '감사 108배', sub: '은혜에 답하며' },
    wish: { label: '발원 108배', sub: '서원을 세우며' },
  }[theme] : null

  const handleSelectSound = (id: CountSoundId) => {
    setSoundId(id)
    try {
      localStorage.setItem(SOUND_KEY, id)
    } catch {
      // 저장 실패 무시
    }
    playCountSound(id)
  }

  // 수동 모드 카운트
  const handleCount = useCallback(() => {
    if (completed) return

    if (count === 0) startTimeRef.current = Date.now()
    const newCount = count + 1
    setCount(newCount)
    playCountSound(soundId)

    if (newCount >= BAE_TARGET) {
      setCompleted(true)
      setTimeout(() => {
        getSoundGenerator().playBell(1)
      }, 300)

      const durationSec = Math.floor((Date.now() - startTimeRef.current) / 1000)
      savePractice(user?.id ?? null, 'bae108', durationSec, BAE_TARGET, true)
        .then(() => setSaved(true))
        .catch(() => setSaved(true))
    }
  }, [count, completed, user, soundId])

  // 음성 가이드 모드 완료
  const handleGuidedComplete = useCallback(
    (durationSec: number) => {
      setCompleted(true)
      savePractice(user?.id ?? null, 'bae108', durationSec, BAE_TARGET, true)
        .then(() => setSaved(true))
        .catch(() => setSaved(true))
    },
    [user],
  )

  const handleReset = () => {
    setCount(0)
    setCompleted(false)
    setSaved(false)
  }

  // 자동 모드 활성화 (iOS 권한 요청 포함) — 수동 모드에서만 사용
  const enableAutoMode = useCallback(async () => {
    setAutoError(null)
    if (typeof window === 'undefined' || typeof DeviceOrientationEvent === 'undefined') {
      setAutoError('이 기기는 방향 센서를 지원하지 않습니다')
      return
    }
    type DOEWithPerm = typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<'granted' | 'denied'>
    }
    const DOE = DeviceOrientationEvent as DOEWithPerm
    if (typeof DOE.requestPermission === 'function') {
      try {
        const state = await DOE.requestPermission()
        if (state !== 'granted') {
          setAutoError('센서 권한이 거부되었습니다')
          return
        }
      } catch {
        setAutoError('센서 권한 요청에 실패했습니다')
        return
      }
    }
    setAutoMode(true)
  }, [])

  // handleCount의 최신 참조 유지
  const handleCountRef = useRef(handleCount)
  useEffect(() => {
    handleCountRef.current = handleCount
  }, [handleCount])

  // 방향 센서 리스너 — 수동 모드 + 자동 활성 시
  useEffect(() => {
    if (mode !== 'manual' || !autoMode) return

    let phase: 'standing' | 'bowing' | 'cooldown' = 'standing'
    let lastTrigger = 0

    function onOrientation(e: DeviceOrientationEvent) {
      const beta = e.beta ?? 0
      const absBeta = Math.abs(beta)

      if (phase === 'standing' && absBeta > 65) {
        phase = 'bowing'
      } else if (phase === 'bowing' && absBeta < 25) {
        const now = Date.now()
        if (now - lastTrigger > 800) {
          handleCountRef.current()
          lastTrigger = now
        }
        phase = 'cooldown'
        setTimeout(() => {
          if (phase === 'cooldown') phase = 'standing'
        }, 500)
      }
    }

    window.addEventListener('deviceorientation', onOrientation)
    return () => window.removeEventListener('deviceorientation', onOrientation)
  }, [mode, autoMode])

  const currentSound = COUNT_SOUNDS.find(s => s.id === soundId)!

  return (
    <div className="min-h-[calc(100dvh-5rem)] flex flex-col">
      <MoodBackdrop mood="wine" />

      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 pt-5 pb-2">
        <Link
          href="/"
          aria-label="뒤로"
          className="p-2 -ml-2 text-foreground-dim hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </Link>
        <p className="label-upper">108 Bows</p>
        <div className="flex items-center gap-1">
          {mode === 'manual' && !completed && (
            <>
              <button
                onClick={() => {
                  if (autoMode) setAutoMode(false)
                  else enableAutoMode()
                }}
                aria-label="자동 카운트 토글"
                title={autoMode ? '자동 모드 ON' : '자동 카운트 활성화'}
                className={cn(
                  'p-2 transition-colors',
                  autoMode ? 'text-accent' : 'text-foreground-dim hover:text-foreground',
                )}
              >
                <Activity size={16} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setShowSoundSheet(true)}
                aria-label="사운드 선택"
                className="p-2 text-foreground-dim hover:text-foreground transition-colors"
              >
                <Music size={16} strokeWidth={1.5} />
              </button>
            </>
          )}
          {count > 0 && !completed && mode === 'manual' && (
            <button
              onClick={handleReset}
              aria-label="초기화"
              className="p-2 -mr-2 text-foreground-dim hover:text-foreground transition-colors"
            >
              <RotateCcw size={16} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </header>

      {/* 페이지 타이틀 */}
      <section className="px-5 pb-3 animate-in flex items-baseline justify-between">
        <div>
          <h1 className="text-foreground text-[26px] tracking-tight font-medium">
            {themeMeta?.label ?? '108배'}
          </h1>
          <p className="label-tag mt-1">
            {themeMeta?.sub ?? '한 절 한 절, 마음을 내려놓으세요'}
          </p>
        </div>
        {mode === 'manual' && (
          <button
            onClick={() => setShowSoundSheet(true)}
            className="label-tag text-foreground-dim hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <span>♪</span>
            {currentSound.name}
          </button>
        )}
      </section>

      {/* 모드 선택 — 시작 전에만 노출 */}
      {!completed && (
        <section className="px-5 pb-3 animate-in">
          <div className="grid grid-cols-2 gap-2 surface-paper rounded-2xl p-1.5">
            <button
              onClick={() => changeMode('guided')}
              className={cn(
                'py-2.5 rounded-xl text-[13px] tracking-tight transition-colors',
                mode === 'guided'
                  ? 'bg-[var(--accent-glow)] text-accent'
                  : 'text-foreground-dim hover:text-foreground',
              )}
            >
              음성 가이드
            </button>
            <button
              onClick={() => changeMode('manual')}
              className={cn(
                'py-2.5 rounded-xl text-[13px] tracking-tight transition-colors',
                mode === 'manual'
                  ? 'bg-[var(--accent-glow)] text-accent'
                  : 'text-foreground-dim hover:text-foreground',
              )}
            >
              수동 탭
            </button>
          </div>
        </section>
      )}

      {/* 자동 모드 안내 — 수동 모드에서만 */}
      {mode === 'manual' && autoMode && (
        <div className="px-5 pb-2 animate-in">
          <div className="surface-paper rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <div className="flex-1 min-w-0">
              <p className="text-foreground text-[12px] tracking-tight">
                Auto · 절하면 자동으로 카운트
              </p>
              <p className="label-tag mt-0.5">
                폰을 가슴 주머니에 두거나 손에 쥐고 절하세요
              </p>
            </div>
          </div>
        </div>
      )}
      {autoError && (
        <div className="px-5 pb-2 animate-in">
          <p className="text-danger text-[12px] tracking-tight">
            ⚠ {autoError}
          </p>
        </div>
      )}

      {/* 본문 — 모드별 */}
      {!completed ? (
        mode === 'guided' ? (
          <section className="flex-1 animate-in stagger-1">
            <BowGuidedMode onComplete={handleGuidedComplete} />
          </section>
        ) : (
          <section className="flex-1 flex items-center justify-center px-5 animate-in stagger-1">
            <Counter108 count={count} onCount={handleCount} completed={completed} />
          </section>
        )
      ) : (
        // 완료 화면
        <section className="px-5 pb-8 animate-in flex-1 flex items-center">
          <div className="surface-paper rounded-2xl p-5 space-y-3 text-center w-full">
            <p className="label-upper text-success">Complete</p>
            <p className="text-foreground text-[18px] tracking-tight">
              108배를 모두 마쳤습니다
            </p>
            <p className="label-tag">
              {saved ? '수행 기록이 저장되었습니다' : '기록 저장 중...'}
            </p>
            <button
              onClick={handleReset}
              className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[var(--surface-strong-border)] text-foreground text-[13px] tracking-wide hover:bg-[var(--surface-hover)] transition-colors active:scale-[0.98]"
            >
              <RotateCcw size={13} strokeWidth={1.5} />
              다시 시작
            </button>
          </div>
        </section>
      )}

      {/* 사운드 선택 BottomSheet — 수동 모드용 */}
      {showSoundSheet && (
        <BottomSheet title="Count Sound" onClose={() => setShowSoundSheet(false)}>
          <p className="label-tag mb-4">탭으로 미리 듣고 선택하세요</p>
          {COUNT_SOUNDS.map(s => (
            <OptionRow
              key={s.id}
              label={s.name}
              description={s.description}
              selected={soundId === s.id}
              onClick={() => handleSelectSound(s.id)}
              trailing={
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    playCountSound(s.id)
                  }}
                  aria-label={`${s.name} 미리 듣기`}
                  className="w-9 h-9 rounded-full border border-[var(--surface-strong-border)] hover:border-foreground/60 hover:bg-[var(--surface-hover)] flex items-center justify-center text-foreground-dim hover:text-foreground transition-colors active:scale-95"
                >
                  <Play size={11} strokeWidth={1.5} fill="currentColor" className="translate-x-[1px]" />
                </button>
              }
            />
          ))}
        </BottomSheet>
      )}
    </div>
  )
}
