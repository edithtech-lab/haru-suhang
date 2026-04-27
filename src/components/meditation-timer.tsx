'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/utils'
import { MEDITATION_TIMES } from '@/lib/constants'
import { getSoundGenerator } from '@/components/audio-player'
import { AMBIENT_SOUNDS } from '@/components/ambient-sounds'
import { Play, Pause, X, Check } from 'lucide-react'
import { Mandala } from '@/components/mandala'

interface MeditationTimerProps {
  onComplete: (durationSec: number) => void
}

type Phase = 'select' | 'running' | 'completed'
type BreathPhase = 'in' | 'out'

const START_END_OPTIONS = [
  { id: 'bell', label: 'Bell', description: '범종' },
  { id: 'bowl', label: 'Bowl', description: '싱잉볼' },
  { id: 'silent', label: 'None', description: '무음' },
] as const

type StartEndOption = (typeof START_END_OPTIONS)[number]['id']

type ModalKind = 'time' | 'sound' | 'startEnd' | null

export function MeditationTimer({ onComplete }: MeditationTimerProps) {
  const [phase, setPhase] = useState<Phase>('select')
  const [totalSeconds, setTotalSeconds] = useState(900) // default 15min
  const [remaining, setRemaining] = useState(0)
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('in')
  const [selectedSound, setSelectedSound] = useState<string | null>(null)
  const [startEnd, setStartEnd] = useState<StartEndOption>('bell')
  const [modal, setModal] = useState<ModalKind>(null)
  const [showTime, setShowTime] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const breathRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const audioStopRef = useRef<(() => void) | null>(null)

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (breathRef.current) clearInterval(breathRef.current)
    if (audioStopRef.current) {
      audioStopRef.current()
      audioStopRef.current = null
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {})
      audioCtxRef.current = null
    }
  }, [])

  const playStartSound = () => {
    if (startEnd === 'silent') return
    if (startEnd === 'bell') getSoundGenerator().playBell(1)
    // bowl은 기본 ambient bowl 사운드 1번 트리거 — 단순화: bell로 대체
    if (startEnd === 'bowl') getSoundGenerator().playBell(1)
  }

  const playEndSound = () => {
    if (startEnd === 'silent') return
    getSoundGenerator().playBell(3)
  }

  const startMeditation = useCallback(() => {
    setRemaining(totalSeconds)
    setPhase('running')
    playStartSound()

    breathRef.current = setInterval(() => {
      setBreathPhase(prev => (prev === 'in' ? 'out' : 'in'))
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSeconds, selectedSound, startEnd])

  useEffect(() => {
    if (phase !== 'running') return

    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          cleanup()
          setPhase('completed')
          playEndSound()
          onComplete(totalSeconds)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, cleanup, totalSeconds, onComplete])

  const stopMeditation = useCallback(() => {
    cleanup()
    const elapsed = totalSeconds - remaining
    if (elapsed > 30) onComplete(elapsed)
    setPhase('select')
    setRemaining(0)
  }, [cleanup, totalSeconds, remaining, onComplete])

  const selectedSoundLabel = selectedSound
    ? AMBIENT_SOUNDS.find(s => s.id === selectedSound)?.name
    : 'None'

  const startEndLabel = START_END_OPTIONS.find(o => o.id === startEnd)?.label

  // ===== SELECT 화면 — Open #2/#3 차용 =====
  if (phase === 'select') {
    return (
      <div className="flex flex-col items-center w-full">
        {/* 만다라 SVG (Open #3 차용) */}
        <div className="w-full flex justify-center pt-6 pb-10 animate-in">
          <Mandala />
        </div>

        {/* 시간 선택 라벨 */}
        <div className="w-full text-center animate-in stagger-1 mb-8">
          <p className="label-tag mb-3">Duration</p>
          <button
            onClick={() => setModal('time')}
            className="text-foreground text-[44px] tracking-tight leading-none active:opacity-70 transition-opacity"
          >
            {Math.floor(totalSeconds / 60)} <span className="text-[20px] text-foreground-dim">min</span>
          </button>
        </div>

        {/* 옵션 카드 3개 (Open #2 차용) */}
        <div className="w-full grid grid-cols-3 gap-2 px-1 animate-in stagger-2 mb-10">
          <button
            onClick={() => setModal('startEnd')}
            className="surface-subtle rounded-2xl py-3 px-3 hover:bg-[var(--surface-hover)] transition-colors active:scale-[0.98]"
          >
            <p className="label-tag text-foreground-dim mb-1.5">Start &amp; End</p>
            <p className="text-foreground text-[14px] tracking-tight">{startEndLabel}</p>
          </button>
          <button
            onClick={() => setModal('sound')}
            className="surface-subtle rounded-2xl py-3 px-3 hover:bg-[var(--surface-hover)] transition-colors active:scale-[0.98]"
          >
            <p className="label-tag text-foreground-dim mb-1.5">Sound</p>
            <p className="text-foreground text-[14px] tracking-tight truncate">{selectedSoundLabel}</p>
          </button>
          <button
            disabled
            className="surface-subtle rounded-2xl py-3 px-3 opacity-50 cursor-not-allowed"
          >
            <p className="label-tag text-foreground-dim mb-1.5">Interval</p>
            <p className="text-foreground text-[14px] tracking-tight">None</p>
          </button>
        </div>

        {/* 큰 둥근 ▶ 버튼 */}
        <button
          onClick={startMeditation}
          aria-label="명상 시작"
          className="group w-20 h-20 rounded-full border-[1.5px] border-foreground/30 hover:border-foreground hover:bg-foreground/5 flex items-center justify-center transition-all active:scale-95 animate-in stagger-3"
        >
          <Play size={26} strokeWidth={1.2} className="text-foreground translate-x-[2px]" fill="currentColor" />
        </button>

        {/* ========== Modal: 시간 선택 ========== */}
        {modal === 'time' && (
          <BottomSheet title="Duration" onClose={() => setModal(null)}>
            {MEDITATION_TIMES.map(({ label, seconds }) => (
              <OptionRow
                key={seconds}
                label={label}
                selected={totalSeconds === seconds}
                onClick={() => {
                  setTotalSeconds(seconds)
                  setModal(null)
                }}
              />
            ))}
          </BottomSheet>
        )}

        {/* Modal: Sound 선택 */}
        {modal === 'sound' && (
          <BottomSheet title="Sound" onClose={() => setModal(null)}>
            <OptionRow
              label="None"
              selected={selectedSound === null}
              onClick={() => {
                setSelectedSound(null)
                setModal(null)
              }}
            />
            {AMBIENT_SOUNDS.map(s => (
              <OptionRow
                key={s.id}
                label={s.name}
                selected={selectedSound === s.id}
                onClick={() => {
                  setSelectedSound(s.id)
                  setModal(null)
                }}
              />
            ))}
          </BottomSheet>
        )}

        {/* Modal: Start & End */}
        {modal === 'startEnd' && (
          <BottomSheet title="Start & End" onClose={() => setModal(null)}>
            {START_END_OPTIONS.map(opt => (
              <OptionRow
                key={opt.id}
                label={opt.label}
                description={opt.description}
                selected={startEnd === opt.id}
                onClick={() => {
                  setStartEnd(opt.id)
                  setModal(null)
                }}
              />
            ))}
          </BottomSheet>
        )}
      </div>
    )
  }

  // ===== RUNNING 화면 — Open #4 차용 (극단적 미니멀) =====
  if (phase === 'running') {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
        onClick={() => setShowTime(s => !s)}
      >
        {/* 메인 오브 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={cn(
              'w-[18rem] h-[18rem] rounded-full transition-transform duration-[4000ms]',
              breathPhase === 'in' ? 'scale-100' : 'scale-90',
            )}
            style={{
              background:
                'radial-gradient(circle at 40% 35%, rgba(180, 200, 90, 0.4) 0%, rgba(80, 90, 50, 0.2) 50%, transparent 75%)',
              filter: 'blur(40px)',
            }}
          />
        </div>

        {/* 보조 오브 (사진 #4의 오른쪽 아래 작은 오브) */}
        <div
          className="absolute bottom-1/4 right-8 w-32 h-32 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 40% 35%, rgba(150, 170, 80, 0.25) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />

        {/* 시간 (탭 시 토글) */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          {showTime ? (
            <p className="text-foreground text-5xl tracking-tight tabular-nums font-light animate-in">
              {formatTime(remaining)}
            </p>
          ) : (
            <p className="label-upper text-foreground-dim animate-in">
              Tap to show time
            </p>
          )}
        </div>

        {/* 호흡 가이드 라벨 */}
        <p className="absolute bottom-32 text-foreground-dim text-[11px] uppercase tracking-[0.35em] pointer-events-none">
          {breathPhase === 'in' ? 'Inhale' : 'Exhale'}
        </p>

        {/* 정지 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            stopMeditation()
          }}
          aria-label="명상 중단"
          className="absolute bottom-12 w-12 h-12 rounded-full border border-foreground/20 hover:border-foreground/40 flex items-center justify-center transition-all active:scale-95"
        >
          <Pause size={14} strokeWidth={1.5} className="text-foreground-dim" fill="currentColor" />
        </button>
      </div>
    )
  }

  // ===== COMPLETED 화면 =====
  return (
    <div className="flex flex-col items-center gap-8 animate-in py-12">
      {/* 작은 오브 */}
      <div
        className="w-40 h-40 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 40% 35%, rgba(143, 184, 141, 0.5) 0%, rgba(50, 70, 50, 0.2) 50%, transparent 75%)',
          filter: 'blur(20px)',
        }}
      />
      <div className="text-center space-y-2">
        <p className="label-upper text-success">Complete</p>
        <h2 className="text-foreground text-3xl tracking-tight">명상을 마쳤습니다</h2>
        <p className="text-foreground-dim text-sm">
          {Math.floor(totalSeconds / 60)}분 동안 함께했습니다
        </p>
      </div>
      <button
        onClick={() => {
          setPhase('select')
          setRemaining(0)
        }}
        className="px-7 py-3 rounded-full border border-[var(--surface-strong-border)] text-foreground text-sm hover:bg-[var(--surface-hover)] transition-colors active:scale-[0.98]"
      >
        다시 시작
      </button>
    </div>
  )
}

// ===== Bottom Sheet 모달 =====
function BottomSheet({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden
      />
      <div
        className="relative w-full max-w-lg bg-black border-t border-[var(--surface-border)] rounded-t-3xl pb-8 max-h-[70vh] overflow-y-auto animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 핸들 */}
        <div className="flex items-center justify-between px-5 pt-3">
          <div className="flex-1" />
          <p className="text-foreground text-[16px] tracking-tight">{title}</p>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="flex-1 flex justify-end p-2 text-foreground-dim hover:text-foreground transition-colors"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <div className="mt-4 px-5">{children}</div>
      </div>
    </div>
  )
}

function OptionRow({
  label,
  description,
  selected,
  onClick,
}: {
  label: string
  description?: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between py-4 border-b border-[var(--surface-border)] hover:bg-[var(--surface-hover)] -mx-5 px-5 transition-colors"
    >
      <div className="text-left">
        <p className="text-foreground text-[15px] tracking-tight">{label}</p>
        {description && (
          <p className="label-tag mt-0.5">{description}</p>
        )}
      </div>
      {selected && <Check size={16} className="text-foreground" strokeWidth={1.8} />}
    </button>
  )
}
