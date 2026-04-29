'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause, Square, Volume2 } from 'lucide-react'
import {
  BowGuidedPlayer,
  BOW_VOICES,
  type BowStatus,
} from '@/lib/bow-guided-player'

const SPEED_KEY = 'haru-bow-speed'
const VOICE_KEY = 'haru-bow-voice'
const JUKBI_KEY = 'haru-bow-jukbi'
const BELL_KEY = 'haru-bow-bell'

const BOW_TARGET = 108
const DEFAULT_SPEED = 6 // 한 배 6초 (108배 약 11분)

interface Props {
  onComplete: (durationSec: number) => void
}

export function BowGuidedMode({ onComplete }: Props) {
  const [voiceId, setVoiceId] = useState<string>('hyeonmuk')
  const [speed, setSpeed] = useState(DEFAULT_SPEED)
  const [jukbi, setJukbi] = useState(true)
  const [bell, setBell] = useState(true)
  const [status, setStatus] = useState<BowStatus>('idle')
  const [count, setCount] = useState(0)

  const playerRef = useRef<BowGuidedPlayer | null>(null)
  const startTimeRef = useRef(0)

  // localStorage 초기 로드
  useEffect(() => {
    if (typeof window === 'undefined') return
    const v = localStorage.getItem(VOICE_KEY)
    if (v && BOW_VOICES.some(b => b.id === v)) setVoiceId(v)
    const s = Number(localStorage.getItem(SPEED_KEY))
    if (s >= 3 && s <= 12) setSpeed(s)
    const j = localStorage.getItem(JUKBI_KEY)
    if (j !== null) setJukbi(j === '1')
    const b = localStorage.getItem(BELL_KEY)
    if (b !== null) setBell(b === '1')
  }, [])

  // 플레이어 초기화 — 인도자 변경 시 재생성
  useEffect(() => {
    const player = new BowGuidedPlayer({
      voiceId,
      speedSec: speed,
      jukbi,
      milestoneBell: bell,
      onCount: n => setCount(n),
      onComplete: () => {
        const dur = Math.floor((Date.now() - startTimeRef.current) / 1000)
        onComplete(dur)
      },
      onStateChange: s => setStatus(s),
    })
    playerRef.current = player
    return () => {
      player.dispose()
    }
    // voiceId만 의존 — 나머지는 setter로 반영
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceId])

  // 속도/옵션 변경 — 플레이어에 즉시 반영
  useEffect(() => {
    playerRef.current?.setSpeed(speed)
    localStorage.setItem(SPEED_KEY, String(speed))
  }, [speed])
  useEffect(() => {
    playerRef.current?.setJukbi(jukbi)
    localStorage.setItem(JUKBI_KEY, jukbi ? '1' : '0')
  }, [jukbi])
  useEffect(() => {
    playerRef.current?.setMilestoneBell(bell)
    localStorage.setItem(BELL_KEY, bell ? '1' : '0')
  }, [bell])

  const handleStart = async () => {
    if (status === 'idle') {
      startTimeRef.current = Date.now()
      await playerRef.current?.start()
    } else if (status === 'paused') {
      playerRef.current?.resume()
    } else if (status === 'playing' || status === 'intro') {
      playerRef.current?.pause()
    }
  }

  const handleStop = () => {
    playerRef.current?.stop()
    setCount(0)
  }

  const handleVoiceChange = (id: string) => {
    if (status !== 'idle') return // 진행 중엔 변경 금지
    setVoiceId(id)
    localStorage.setItem(VOICE_KEY, id)
  }

  const isActive = status === 'playing' || status === 'intro' || status === 'completing'
  const progress = (count / BOW_TARGET) * 100

  return (
    <div className="flex flex-col items-center gap-6 px-5 py-6">
      {/* 카운터 */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* 원형 진행률 */}
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="var(--surface-border)"
            strokeWidth="1.5"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray={`${(progress * 289) / 100} 289`}
            className="transition-[stroke-dasharray] duration-500"
          />
        </svg>
        <div className="text-center">
          <p className="label-tag mb-1">
            {status === 'intro'
              ? '시작 안내'
              : status === 'completing'
                ? '회향'
                : status === 'paused'
                  ? '일시정지'
                  : '카운트'}
          </p>
          <p className="text-foreground text-[56px] tracking-tight font-medium tabular-nums leading-none">
            {count}
          </p>
          <p className="label-tag mt-2">/ 108</p>
        </div>
      </div>

      {/* 컨트롤 */}
      <div className="flex items-center gap-4">
        {(status === 'playing' || status === 'paused' || status === 'intro') && (
          <button
            onClick={handleStop}
            aria-label="정지"
            className="w-12 h-12 rounded-full border border-[var(--surface-border)] flex items-center justify-center text-foreground-dim hover:text-danger hover:border-danger transition-colors"
          >
            <Square size={16} strokeWidth={1.5} />
          </button>
        )}
        <button
          onClick={handleStart}
          aria-label={status === 'playing' || status === 'intro' ? '일시정지' : '시작'}
          disabled={status === 'completing'}
          className="w-16 h-16 rounded-full bg-accent text-background flex items-center justify-center hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50"
        >
          {status === 'playing' || status === 'intro' ? (
            <Pause size={22} strokeWidth={1.5} />
          ) : (
            <Play size={22} strokeWidth={1.5} className="translate-x-[2px]" />
          )}
        </button>
      </div>

      {/* 인도자 선택 */}
      <div className="w-full max-w-md">
        <p className="label-tag mb-2 flex items-center gap-1.5">
          <Volume2 size={11} />
          인도자
        </p>
        <div className="grid grid-cols-4 gap-2">
          {BOW_VOICES.map(v => {
            const selected = voiceId === v.id
            return (
              <button
                key={v.id}
                onClick={() => handleVoiceChange(v.id)}
                disabled={isActive}
                className={`py-2.5 rounded-lg border text-[13px] tracking-tight transition-colors ${
                  selected
                    ? 'border-accent bg-[var(--accent-glow)] text-accent'
                    : 'border-[var(--surface-border)] text-foreground-dim hover:text-foreground hover:border-foreground/40 disabled:opacity-50'
                }`}
              >
                {v.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 속도 */}
      <div className="w-full max-w-md">
        <div className="flex items-baseline justify-between mb-2">
          <p className="label-tag">속도</p>
          <p className="text-foreground-dim text-[12px] tabular-nums">
            한 배 {speed}초 · 108배 약 {Math.round((speed * BOW_TARGET) / 60)}분
          </p>
        </div>
        <input
          type="range"
          min={3}
          max={12}
          step={1}
          value={speed}
          onChange={e => setSpeed(Number(e.target.value))}
          className="w-full accent-[var(--accent)]"
        />
        <div className="flex justify-between text-[10px] text-foreground-dim/70 mt-1 tabular-nums">
          <span>빠르게 3s</span>
          <span>보통 6s</span>
          <span>느리게 12s</span>
        </div>
      </div>

      {/* 옵션 토글 */}
      <div className="w-full max-w-md flex flex-col gap-3">
        <ToggleRow
          label="죽비"
          desc="매 카운트마다 짧은 죽비 소리"
          checked={jukbi}
          onChange={setJukbi}
        />
        <ToggleRow
          label="마디 종"
          desc="27 · 54 · 81배에 종소리"
          checked={bell}
          onChange={setBell}
        />
      </div>
    </div>
  )
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string
  desc: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-4 py-2.5 px-3 -mx-3 rounded-lg hover:bg-[var(--surface)] transition-colors text-left"
    >
      <div className="flex-1 min-w-0">
        <p className="text-foreground text-[14px]">{label}</p>
        <p className="label-tag mt-0.5">{desc}</p>
      </div>
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-accent' : 'bg-[var(--surface-border)]'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  )
}
