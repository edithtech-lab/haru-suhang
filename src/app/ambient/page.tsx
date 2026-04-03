'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/utils'
import { Play, Pause, Moon } from 'lucide-react'

interface AmbientSound {
  id: string
  name: string
  emoji: string
  // Web Audio 파라미터
  create: (ctx: AudioContext) => { node: AudioNode; stop: () => void }
}

// Web Audio 기반 앰비언트 사운드 정의
function createWindSound(ctx: AudioContext) {
  const bufferSize = 2 * ctx.sampleRate
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 400
  filter.Q.value = 0.5

  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.15
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 150
  lfo.connect(lfoGain)
  lfoGain.connect(filter.frequency)
  lfo.start()

  const gain = ctx.createGain()
  gain.gain.value = 0.12

  source.connect(filter)
  filter.connect(gain)
  source.start()

  return { node: gain, stop: () => { source.stop(); lfo.stop() } }
}

function createRainSound(ctx: AudioContext) {
  const bufferSize = 2 * ctx.sampleRate
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const hp = ctx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 1000

  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 8000

  const gain = ctx.createGain()
  gain.gain.value = 0.08

  source.connect(hp)
  hp.connect(lp)
  lp.connect(gain)
  source.start()

  return { node: gain, stop: () => source.stop() }
}

function createStreamSound(ctx: AudioContext) {
  const bufferSize = 2 * ctx.sampleRate
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 600
  bp.Q.value = 0.8

  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.3
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 200
  lfo.connect(lfoGain)
  lfoGain.connect(bp.frequency)
  lfo.start()

  const gain = ctx.createGain()
  gain.gain.value = 0.1

  source.connect(bp)
  bp.connect(gain)
  source.start()

  return { node: gain, stop: () => { source.stop(); lfo.stop() } }
}

function createBirdSound(ctx: AudioContext) {
  const gain = ctx.createGain()
  gain.gain.value = 0.15

  let stopped = false
  const intervals: ReturnType<typeof setTimeout>[] = []

  function chirp() {
    if (stopped) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(2000 + Math.random() * 2000, now)
    osc.frequency.exponentialRampToValueAtTime(1500 + Math.random() * 1500, now + 0.1)
    g.gain.setValueAtTime(0.2, now)
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
    osc.connect(g)
    g.connect(gain)
    osc.start(now)
    osc.stop(now + 0.15)
  }

  function schedule() {
    if (stopped) return
    chirp()
    if (Math.random() > 0.5) {
      const t = setTimeout(chirp, 80 + Math.random() * 120)
      intervals.push(t)
    }
    const next = setTimeout(schedule, 1500 + Math.random() * 4000)
    intervals.push(next)
  }
  schedule()

  return { node: gain, stop: () => { stopped = true; intervals.forEach(clearTimeout) } }
}

function createBowlSound(ctx: AudioContext) {
  const gain = ctx.createGain()
  gain.gain.value = 0.2

  let stopped = false
  const intervals: ReturnType<typeof setTimeout>[] = []

  function ring() {
    if (stopped) return
    const now = ctx.currentTime
    const freq = 300 + Math.random() * 200
    const partials = [freq, freq * 1.5, freq * 2.8]

    partials.forEach((f, i) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, now)
      g.gain.setValueAtTime(0.15 / (i + 1), now)
      g.gain.exponentialRampToValueAtTime(0.001, now + 4 + Math.random() * 2)
      osc.connect(g)
      g.connect(gain)
      osc.start(now)
      osc.stop(now + 6)
    })
  }

  function schedule() {
    if (stopped) return
    ring()
    const next = setTimeout(schedule, 6000 + Math.random() * 8000)
    intervals.push(next)
  }
  schedule()

  return { node: gain, stop: () => { stopped = true; intervals.forEach(clearTimeout) } }
}

function createWindChimeSound(ctx: AudioContext) {
  const gain = ctx.createGain()
  gain.gain.value = 0.15

  let stopped = false
  const intervals: ReturnType<typeof setTimeout>[] = []
  const notes = [523, 587, 659, 784, 880, 988, 1047]

  function chime() {
    if (stopped) return
    const now = ctx.currentTime
    const freq = notes[Math.floor(Math.random() * notes.length)]
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)
    g.gain.setValueAtTime(0.12, now)
    g.gain.exponentialRampToValueAtTime(0.001, now + 2)
    osc.connect(g)
    g.connect(gain)
    osc.start(now)
    osc.stop(now + 2)
  }

  function schedule() {
    if (stopped) return
    chime()
    if (Math.random() > 0.6) {
      const t = setTimeout(chime, 200 + Math.random() * 400)
      intervals.push(t)
    }
    const next = setTimeout(schedule, 3000 + Math.random() * 5000)
    intervals.push(next)
  }
  schedule()

  return { node: gain, stop: () => { stopped = true; intervals.forEach(clearTimeout) } }
}

const SOUNDS: AmbientSound[] = [
  { id: 'wind', name: '산바람', emoji: '🍃', create: createWindSound },
  { id: 'rain', name: '빗소리', emoji: '🌧', create: createRainSound },
  { id: 'stream', name: '계곡물', emoji: '💧', create: createStreamSound },
  { id: 'birds', name: '새소리', emoji: '🐦', create: createBirdSound },
  { id: 'bowl', name: '싱잉볼', emoji: '🔔', create: createBowlSound },
  { id: 'chime', name: '풍경', emoji: '🎐', create: createWindChimeSound },
]

const SLEEP_TIMES = [
  { label: '15분', seconds: 900 },
  { label: '30분', seconds: 1800 },
  { label: '1시간', seconds: 3600 },
  { label: '무제한', seconds: 0 },
]

export default function AmbientPage() {
  const [activeSounds, setActiveSounds] = useState<Set<string>>(new Set())
  const [playing, setPlaying] = useState(false)
  const [sleepTimer, setSleepTimer] = useState(0)
  const [sleepRemaining, setSleepRemaining] = useState(0)
  const ctxRef = useRef<AudioContext | null>(null)
  const stopsRef = useRef<Map<string, () => void>>(new Map())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const toggleSound = (id: string) => {
    setActiveSounds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const stopPlaying = useCallback(() => {
    stopsRef.current.forEach(stop => stop())
    stopsRef.current.clear()
    ctxRef.current?.close()
    ctxRef.current = null
    if (timerRef.current) clearInterval(timerRef.current)
    setPlaying(false)
    setSleepRemaining(0)
  }, [])

  const startPlaying = useCallback(() => {
    if (activeSounds.size === 0) return

    const ctx = new AudioContext()
    ctxRef.current = ctx

    activeSounds.forEach(id => {
      const sound = SOUNDS.find(s => s.id === id)
      if (sound) {
        const { node, stop } = sound.create(ctx)
        node.connect(ctx.destination)
        stopsRef.current.set(id, stop)
      }
    })

    setPlaying(true)

    if (sleepTimer > 0) {
      setSleepRemaining(sleepTimer)
      timerRef.current = setInterval(() => {
        setSleepRemaining(prev => {
          if (prev <= 1) {
            stopPlaying()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }, [activeSounds, sleepTimer, stopPlaying])

  useEffect(() => {
    return () => { stopPlaying() }
  }, [stopPlaying])

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">사찰 음향</h1>
        <p className="text-sm text-muted mt-1">사찰의 고요한 소리로 마음을 쉬세요</p>
      </div>

      {/* 사운드 선택 그리드 */}
      <div className="grid grid-cols-3 gap-3">
        {SOUNDS.map(sound => (
          <Card
            key={sound.id}
            hover
            onClick={() => !playing && toggleSound(sound.id)}
            className={cn(
              'flex flex-col items-center gap-2 py-4 transition-all',
              activeSounds.has(sound.id) && 'border-accent/50 bg-accent/10',
              playing && 'pointer-events-none'
            )}
          >
            <span className="text-2xl">{sound.emoji}</span>
            <span className="text-sm font-medium">{sound.name}</span>
            {activeSounds.has(sound.id) && (
              <div className="w-2 h-2 rounded-full bg-accent" />
            )}
          </Card>
        ))}
      </div>

      {/* 수면 타이머 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Moon size={14} />
          <span>수면 타이머</span>
        </div>
        <div className="flex gap-2">
          {SLEEP_TIMES.map(({ label, seconds }) => (
            <button
              key={seconds}
              onClick={() => !playing && setSleepTimer(seconds)}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm transition-colors',
                sleepTimer === seconds
                  ? 'bg-accent text-[#1a1410] font-medium'
                  : 'bg-card-bg text-muted border border-card-border'
              )}
              disabled={playing}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 재생 컨트롤 */}
      <div className="flex flex-col items-center gap-3">
        {sleepRemaining > 0 && (
          <p className="text-sm text-muted tabular-nums">
            {formatTime(sleepRemaining)} 후 자동 종료
          </p>
        )}

        <Button
          variant={playing ? 'outline' : 'primary'}
          size="lg"
          onClick={playing ? stopPlaying : startPlaying}
          disabled={activeSounds.size === 0}
          className="w-full max-w-xs gap-2"
        >
          {playing ? <Pause size={20} /> : <Play size={20} />}
          {playing ? '정지' : '재생'}
        </Button>

        {activeSounds.size === 0 && !playing && (
          <p className="text-xs text-muted">소리를 1개 이상 선택하세요</p>
        )}
      </div>
    </div>
  )
}
