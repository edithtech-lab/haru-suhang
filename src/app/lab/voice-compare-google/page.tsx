'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, Pause, Check } from 'lucide-react'

interface Sample {
  id: string
  text: string
}

interface VoiceEntry {
  name: string
  gender: string
  tone: string
  samples: string[]
}

interface Manifest {
  samples: Sample[]
  voices: VoiceEntry[]
}

const PICK_LIST_KEY = 'haru-google-tts-pick-list'

type SampleFilter = 'all' | 'intro' | 'count' | 'end'
type GenderFilter = 'all' | '남성' | '여성'

export default function VoiceCompareGooglePage() {
  const [manifest, setManifest] = useState<Manifest | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [picks, setPicks] = useState<string[]>([])
  const [sampleFilter, setSampleFilter] = useState<SampleFilter>('count')
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('남성')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetch('/voice-samples/google/manifest.json')
      .then(r => r.json())
      .then(setManifest)
      .catch(() => null)
    const saved = localStorage.getItem(PICK_LIST_KEY)
    if (saved) {
      try {
        setPicks(JSON.parse(saved))
      } catch {
        // 무시
      }
    }
  }, [])

  const play = (key: string, src: string) => {
    if (playingId === key) {
      audioRef.current?.pause()
      setPlayingId(null)
      return
    }
    if (audioRef.current) {
      audioRef.current.pause()
    }
    const audio = new Audio(src)
    audioRef.current = audio
    audio.onended = () => setPlayingId(null)
    audio.play()
    setPlayingId(key)
  }

  const toggle = (voiceName: string) => {
    let next: string[]
    if (picks.includes(voiceName)) {
      next = picks.filter(v => v !== voiceName)
    } else if (picks.length >= 4) {
      next = [...picks.slice(1), voiceName]
    } else {
      next = [...picks, voiceName]
    }
    setPicks(next)
    localStorage.setItem(PICK_LIST_KEY, JSON.stringify(next))
  }

  const filteredVoices = useMemo(() => {
    if (!manifest) return []
    return manifest.voices.filter(
      v => genderFilter === 'all' || v.gender === genderFilter,
    )
  }, [manifest, genderFilter])

  const visibleSamples = (vSamples: string[]) =>
    sampleFilter === 'all' ? vSamples : vSamples.filter(s => s === sampleFilter)

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-background">
      <header className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--surface-border)]">
        <Link
          href="/lab"
          className="p-2 -ml-2 text-foreground-dim hover:text-foreground transition-colors"
          aria-label="뒤로"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </Link>
        <p className="label-upper">Google Voice Compare</p>
        <div className="w-8" />
      </header>

      <section className="px-5 pt-6 pb-3">
        <p className="label-tag mb-2">Lab</p>
        <h1 className="text-foreground text-[22px] tracking-tight font-medium">
          Google Cloud TTS 한국어 음색 비교
        </h1>
        <p className="text-foreground-dim text-[12px] mt-2 leading-relaxed">
          한국어 41개 음색 중 명상 톤 후보 <strong>15명</strong>.
          최대 <strong>4명</strong> 라인업 선택.
        </p>
      </section>

      {/* 필터 */}
      <section className="px-5 pb-3 space-y-3 sticky top-0 bg-background/95 backdrop-blur z-30 pt-2 pb-4 border-b border-[var(--surface-border)]">
        {/* 샘플 필터 */}
        <div>
          <p className="label-tag mb-1.5">샘플</p>
          <div className="flex gap-1.5 flex-wrap">
            {(['count', 'intro', 'end', 'all'] as SampleFilter[]).map(s => {
              const active = sampleFilter === s
              return (
                <button
                  key={s}
                  onClick={() => setSampleFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-[12px] tracking-tight transition-colors border ${
                    active
                      ? 'border-accent bg-[var(--accent-glow)] text-accent'
                      : 'border-[var(--surface-border)] text-foreground-dim hover:text-foreground'
                  }`}
                >
                  {s === 'count' ? 'count (가장 중요)' : s === 'all' ? '전체 (3개)' : s}
                </button>
              )
            })}
          </div>
        </div>

        {/* 성별 필터 */}
        <div>
          <p className="label-tag mb-1.5">성별</p>
          <div className="flex gap-1.5">
            {(['남성', '여성', 'all'] as GenderFilter[]).map(g => {
              const active = genderFilter === g
              return (
                <button
                  key={g}
                  onClick={() => setGenderFilter(g)}
                  className={`px-3 py-1.5 rounded-full text-[12px] tracking-tight transition-colors border ${
                    active
                      ? 'border-accent bg-[var(--accent-glow)] text-accent'
                      : 'border-[var(--surface-border)] text-foreground-dim hover:text-foreground'
                  }`}
                >
                  {g === 'all' ? '전체' : g}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="px-5 pt-3 pb-32 space-y-2.5">
        {!manifest && (
          <p className="text-foreground-dim text-sm py-12 text-center">
            샘플 로드 중...
          </p>
        )}
        {filteredVoices.length === 0 && manifest && (
          <p className="text-foreground-dim text-sm py-12 text-center">
            필터 조건에 맞는 음색이 없어요
          </p>
        )}
        {filteredVoices.map(({ name, gender, tone, samples }) => {
          const isPicked = picks.includes(name)
          const pickIndex = picks.indexOf(name)
          const shortName = name.replace('ko-KR-', '').replace('Chirp3-HD-', '')
          return (
            <div
              key={name}
              className={`rounded-xl border p-3.5 transition-colors ${
                isPicked
                  ? 'border-accent bg-[var(--accent-glow)]'
                  : 'border-[var(--surface-border)] bg-[var(--surface)]'
              }`}
            >
              <div className="flex items-baseline justify-between gap-2 mb-2.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <p className="text-foreground text-[15px] tracking-tight font-medium">
                      {shortName}
                    </p>
                    {isPicked && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-accent uppercase tracking-[0.18em] shrink-0">
                        <Check size={10} /> #{pickIndex + 1}
                      </span>
                    )}
                  </div>
                  <p className="label-tag mt-0.5">
                    {gender} · {tone}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {visibleSamples(samples).map(sId => {
                  const key = `${name}::${sId}`
                  const src = `/voice-samples/google/${name}__${sId}.mp3`
                  const playing = playingId === key
                  return (
                    <button
                      key={key}
                      onClick={() => play(key, src)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] border transition-colors ${
                        playing
                          ? 'border-accent bg-[var(--accent-glow)] text-accent'
                          : 'border-[var(--surface-border)] text-foreground-dim hover:text-foreground hover:border-foreground/40'
                      }`}
                    >
                      {playing ? <Pause size={10} /> : <Play size={10} />}
                      {sId}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => toggle(name)}
                className={`w-full py-2 rounded-lg text-[11px] uppercase tracking-[0.18em] transition-colors ${
                  isPicked
                    ? 'bg-accent text-background'
                    : 'border border-[var(--surface-border)] text-foreground-dim hover:text-foreground hover:border-foreground/40'
                }`}
              >
                {isPicked ? `라인업 #${pickIndex + 1} · 빼기` : '라인업에 추가'}
              </button>
            </div>
          )
        })}
      </section>

      {/* 선택 라인업 표시 */}
      {picks.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-5 z-40">
          <div className="max-w-lg mx-auto bg-background/95 backdrop-blur border border-accent rounded-xl px-4 py-3 shadow-lg">
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="label-upper text-[10px] text-accent">
                선택된 라인업 {picks.length}/4
              </p>
              <button
                onClick={() => {
                  localStorage.removeItem(PICK_LIST_KEY)
                  setPicks([])
                }}
                className="text-[11px] text-foreground-dim hover:text-foreground uppercase tracking-[0.18em]"
              >
                초기화
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {picks.map((p, i) => (
                <span
                  key={p}
                  className="text-[11px] text-accent bg-[var(--accent-glow)] border border-accent rounded-full px-2.5 py-1"
                >
                  #{i + 1} {p.replace('ko-KR-', '').replace('Chirp3-HD-', '')}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
