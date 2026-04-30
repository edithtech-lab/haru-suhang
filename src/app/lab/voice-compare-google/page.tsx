'use client'

import { useEffect, useRef, useState } from 'react'
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

const STORAGE_KEY = 'haru-google-tts-pick'
const PICK_LIST_KEY = 'haru-google-tts-pick-list' // 4명 라인업

export default function VoiceCompareGooglePage() {
  const [manifest, setManifest] = useState<Manifest | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [picks, setPicks] = useState<string[]>([])
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
      // 4명 초과 시 가장 오래된 것 빼고 추가
      next = [...picks.slice(1), voiceName]
    } else {
      next = [...picks, voiceName]
    }
    setPicks(next)
    localStorage.setItem(PICK_LIST_KEY, JSON.stringify(next))
    localStorage.setItem(STORAGE_KEY, voiceName) // 최근 선택
  }

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

      <section className="px-5 pt-6 pb-4">
        <p className="label-tag mb-2">Lab</p>
        <h1 className="text-foreground text-[24px] tracking-tight font-medium">
          Google Cloud TTS 한국어 음색 비교
        </h1>
        <p className="text-foreground-dim text-[13px] mt-2 leading-relaxed">
          한국어 네이티브 학습 음색 7개 (Neural2 3 + Wavenet 4) × 3샘플.
          <br />
          마음에 드는 음색을 <strong>최대 4명</strong> 선택하세요.
        </p>
      </section>

      {manifest && (
        <section className="px-5 pb-3">
          <details className="text-[12px] text-foreground-dim">
            <summary className="cursor-pointer label-tag">샘플 텍스트 보기</summary>
            <ul className="mt-2 space-y-1.5 pl-2">
              {manifest.samples.map(s => (
                <li key={s.id}>
                  <span className="label-upper text-[10px]">{s.id}</span>{' '}
                  <span className="text-foreground/80">{s.text}</span>
                </li>
              ))}
            </ul>
          </details>
        </section>
      )}

      <section className="px-5 pb-32 space-y-3">
        {!manifest && (
          <p className="text-foreground-dim text-sm py-12 text-center">
            샘플 로드 중...
          </p>
        )}
        {manifest?.voices.map(({ name, gender, tone, samples }) => {
          const isPicked = picks.includes(name)
          const pickIndex = picks.indexOf(name)
          return (
            <div
              key={name}
              className={`rounded-2xl border p-4 transition-colors ${
                isPicked
                  ? 'border-accent bg-[var(--accent-glow)]'
                  : 'border-[var(--surface-border)] bg-[var(--surface)]'
              }`}
            >
              <div className="flex items-baseline justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <p className="text-foreground text-[16px] tracking-tight font-medium truncate">
                      {name.replace('ko-KR-', '')}
                    </p>
                    {isPicked && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-accent uppercase tracking-[0.18em] shrink-0">
                        <Check size={11} /> #{pickIndex + 1}
                      </span>
                    )}
                  </div>
                  <p className="label-tag mt-0.5">
                    {gender} · {tone}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {samples.map(sId => {
                  const key = `${name}::${sId}`
                  const src = `/voice-samples/google/${name}__${sId}.mp3`
                  const playing = playingId === key
                  return (
                    <button
                      key={key}
                      onClick={() => play(key, src)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] border transition-colors ${
                        playing
                          ? 'border-accent bg-[var(--accent-glow)] text-accent'
                          : 'border-[var(--surface-border)] text-foreground-dim hover:text-foreground hover:border-foreground/40'
                      }`}
                    >
                      {playing ? <Pause size={12} /> : <Play size={12} />}
                      {sId}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => toggle(name)}
                className={`w-full py-2.5 rounded-lg text-[12px] uppercase tracking-[0.18em] transition-colors ${
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
                  #{i + 1} {p.replace('ko-KR-', '')}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
