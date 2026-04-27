'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Pause, Play } from 'lucide-react'
import { AMBIENT_SOUNDS, AmbientSoundDef } from '@/components/ambient-sounds'
import { MoodBackdrop } from '@/components/mood-backdrop'
import { cn } from '@/lib/utils'

type ActiveSound = {
  id: string
  stop: () => void
  gain: GainNode
  volume: number
}

const PRESETS = [
  { id: 'temple-rain', name: '비 내리는 산사', sounds: ['rain', 'chime'] },
  { id: 'dawn-forest', name: '새벽 숲', sounds: ['birds', 'wind'] },
  { id: 'mountain-stream', name: '산중 계곡', sounds: ['stream', 'birds'] },
  { id: 'meditation-bowl', name: '고요한 명상', sounds: ['bowl', 'wind'] },
]

const TIMERS = [
  { label: 'Off', seconds: 0 },
  { label: '10 min', seconds: 600 },
  { label: '30 min', seconds: 1800 },
  { label: '1 hour', seconds: 3600 },
]

export default function SoundsPage() {
  const ctxRef = useRef<AudioContext | null>(null)
  const activeSoundsRef = useRef<Map<string, ActiveSound>>(new Map())
  const [active, setActive] = useState<string[]>([])
  const [volumes, setVolumes] = useState<Record<string, number>>({})
  const [timerSec, setTimerSec] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 전역 오디오 컨텍스트 준비
  function getCtx() {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext()
    }
    return ctxRef.current
  }

  // 단일 사운드 토글
  function toggleSound(sound: AmbientSoundDef) {
    const ctx = getCtx()
    const current = activeSoundsRef.current.get(sound.id)

    if (current) {
      current.stop()
      current.gain.disconnect()
      activeSoundsRef.current.delete(sound.id)
      setActive(a => a.filter(id => id !== sound.id))
    } else {
      const { node, stop } = sound.create(ctx)
      const gain = ctx.createGain()
      const initialVol = volumes[sound.id] ?? 0.7
      gain.gain.value = initialVol
      node.connect(gain)
      gain.connect(ctx.destination)
      activeSoundsRef.current.set(sound.id, { id: sound.id, stop, gain, volume: initialVol })
      setActive(a => [...a, sound.id])
      setVolumes(v => ({ ...v, [sound.id]: initialVol }))
    }
  }

  // 볼륨 조정
  function setVolume(id: string, vol: number) {
    setVolumes(v => ({ ...v, [id]: vol }))
    const s = activeSoundsRef.current.get(id)
    if (s) {
      s.gain.gain.setTargetAtTime(vol, getCtx().currentTime, 0.05)
      s.volume = vol
    }
  }

  // 모두 중지
  function stopAll() {
    activeSoundsRef.current.forEach(s => {
      s.stop()
      s.gain.disconnect()
    })
    activeSoundsRef.current.clear()
    setActive([])
  }

  // 프리셋 적용
  function applyPreset(preset: (typeof PRESETS)[number]) {
    stopAll()
    // 다음 프레임에 적용 (stop 이후 await 목적 delay 대신 간단히)
    setTimeout(() => {
      preset.sounds.forEach(id => {
        const s = AMBIENT_SOUNDS.find(x => x.id === id)
        if (s) toggleSound(s)
      })
    }, 50)
  }

  // 타이머
  function startTimer(seconds: number) {
    setTimerSec(seconds)
    if (timerRef.current) clearInterval(timerRef.current)
    if (seconds === 0) {
      setRemaining(0)
      return
    }
    setRemaining(seconds)
    const startedAt = Date.now()
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000)
      const left = seconds - elapsed
      if (left <= 0) {
        stopAll()
        setRemaining(0)
        setTimerSec(0)
        if (timerRef.current) clearInterval(timerRef.current)
      } else {
        setRemaining(left)
      }
    }, 500)
  }

  useEffect(() => {
    return () => {
      stopAll()
      if (timerRef.current) clearInterval(timerRef.current)
      if (ctxRef.current) ctxRef.current.close().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const anyActive = active.length > 0
  const mmss = (s: number) => {
    const m = Math.floor(s / 60)
    const ss = s % 60
    return `${m}:${ss.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-[calc(100dvh-5rem)] flex flex-col pb-8">
      <MoodBackdrop mood="navy" />
      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 pt-5 pb-6">
        <Link
          href="/"
          aria-label="뒤로"
          className="p-2 -ml-2 text-foreground-dim hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </Link>
        <p className="label-upper">Sounds</p>
        <div className="w-8" />
      </header>

      {/* 타이틀 */}
      <section className="animate-in px-5 mb-8">
        <p className="label-tag mb-2">Ambient Library</p>
        <h1 className="text-[32px] leading-tight tracking-tight text-foreground font-medium">
          소리로 마음을<br />
          다스리다
        </h1>
      </section>

      {/* 히어로 — 현재 재생 상태 */}
      <section className="animate-in stagger-1 px-5 mb-8">
        <div className="relative rounded-2xl overflow-hidden aspect-[2/1] bg-[#0a0a0a]">
          <div
            className="absolute inset-0"
            style={{
              background: anyActive
                ? 'radial-gradient(ellipse at 50% 50%, rgba(232, 118, 58, 0.5) 0%, rgba(10, 10, 10, 0.95) 55%)'
                : 'radial-gradient(ellipse at 50% 50%, rgba(100, 100, 100, 0.25) 0%, rgba(10, 10, 10, 0.95) 55%)',
            }}
          />
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              anyActive && 'orb-pulse',
            )}
          >
            <div
              className="w-32 h-32 rounded-full"
              style={{
                background: anyActive ? 'var(--orb-warm)' : 'var(--orb-cream)',
                opacity: anyActive ? 0.8 : 0.35,
                filter: 'blur(8px)',
              }}
            />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            <p className="label-upper mb-3">
              {anyActive ? 'Now Playing' : 'Select a sound'}
            </p>
            <p className="font-medium text-foreground text-lg tracking-tight">
              {anyActive
                ? active.map(id => AMBIENT_SOUNDS.find(s => s.id === id)?.name).filter(Boolean).join(' · ')
                : '—'}
            </p>
            {remaining > 0 && (
              <p className="mt-2 text-foreground-dim text-sm tabular-nums">
                {mmss(remaining)}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 프리셋 */}
      <section className="animate-in stagger-2 px-5 mb-8">
        <p className="label-tag mb-3">Presets</p>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className="group text-left py-3 px-4 rounded-xl border border-[var(--surface-border)] hover:border-[var(--accent-glow)] hover:bg-[var(--surface-hover)] transition-all active:scale-[0.98]"
            >
              <p className="text-foreground text-[14px] tracking-tight group-hover:text-accent-light transition-colors">
                {preset.name}
              </p>
              <p className="label-tag mt-1">
                {preset.sounds.length} layers
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* 개별 사운드 */}
      <section className="animate-in stagger-3 px-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="label-tag">Individual Sounds</p>
          {anyActive && (
            <button onClick={stopAll} className="text-[11px] text-accent uppercase tracking-[0.2em] hover:text-accent-light">
              Stop all
            </button>
          )}
        </div>

        <ul className="space-y-0">
          {AMBIENT_SOUNDS.map((sound, idx) => {
            const isActive = active.includes(sound.id)
            const vol = volumes[sound.id] ?? 0.7
            return (
              <li key={sound.id} className="border-b border-[var(--surface-border)]">
                <div className="flex items-center gap-3 py-4">
                  <span className="label-tag w-5 tabular-nums shrink-0">
                    0{idx + 1}
                  </span>

                  <button
                    onClick={() => toggleSound(sound)}
                    aria-label={isActive ? `${sound.name} 중지` : `${sound.name} 재생`}
                    className={cn(
                      'shrink-0 w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-95',
                      isActive
                        ? 'bg-accent/15 border-accent/50 text-accent'
                        : 'border-[var(--surface-border)] text-foreground-dim hover:border-foreground/40 hover:text-foreground',
                    )}
                  >
                    {isActive ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" className="translate-x-[1px]" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-[15px] tracking-tight',
                      isActive ? 'text-foreground' : 'text-foreground-dim',
                    )}>
                      {sound.emoji} {sound.name}
                    </p>
                    {isActive && (
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.02"
                        value={vol}
                        onChange={e => setVolume(sound.id, parseFloat(e.target.value))}
                        className="mt-2 w-full h-[2px] accent-accent cursor-pointer"
                        aria-label="볼륨"
                      />
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      {/* 타이머 */}
      <section className="animate-in stagger-4 px-5">
        <p className="label-tag mb-3">Auto-stop Timer</p>
        <div className="grid grid-cols-4 gap-2">
          {TIMERS.map(t => (
            <button
              key={t.seconds}
              onClick={() => startTimer(t.seconds)}
              className={cn(
                'py-2.5 rounded-full text-[12px] tracking-wide transition-all active:scale-95',
                timerSec === t.seconds
                  ? 'bg-foreground text-background font-medium'
                  : 'border border-[var(--surface-border)] text-foreground-dim hover:text-foreground hover:border-foreground/40',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
