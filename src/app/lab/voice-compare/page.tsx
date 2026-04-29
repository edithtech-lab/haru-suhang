'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, Pause, Check } from 'lucide-react'

interface Sample {
  id: string
  text: string
}

interface VoiceEntry {
  model: string
  voice: string
  samples: string[]
}

interface Manifest {
  samples: Sample[]
  voices: VoiceEntry[]
}

const VOICE_NOTES: Record<string, { label: string; gender: string; tone: string }> = {
  alloy: { label: 'Alloy', gender: '중성', tone: '균형 잡힌 톤' },
  echo: { label: 'Echo', gender: '남성', tone: '깊고 차분' },
  fable: { label: 'Fable', gender: '남성', tone: '영국식, 따뜻' },
  onyx: { label: 'Onyx', gender: '남성', tone: '깊은 무게감' },
  nova: { label: 'Nova', gender: '여성', tone: '밝고 친근' },
  shimmer: { label: 'Shimmer', gender: '여성', tone: '부드러움' },
  ash: { label: 'Ash', gender: '남성', tone: '단단하고 명료' },
  ballad: { label: 'Ballad', gender: '남성', tone: '감성적, 부드러움' },
  coral: { label: 'Coral', gender: '여성', tone: '따뜻하고 차분' },
  sage: { label: 'Sage', gender: '중성', tone: '현자 톤, 깊이' },
  verse: { label: 'Verse', gender: '남성', tone: '시적, 리듬감' },
}

const STORAGE_KEY = 'haru-tts-voice-pick'

export default function VoiceComparePage() {
  const [manifest, setManifest] = useState<Manifest | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [picked, setPicked] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetch('/voice-samples/manifest.json')
      .then(r => r.json())
      .then(setManifest)
      .catch(() => null)
    setPicked(localStorage.getItem(STORAGE_KEY))
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

  const pick = (model: string, voice: string) => {
    const id = `${model}::${voice}`
    setPicked(id)
    localStorage.setItem(STORAGE_KEY, id)
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
        <p className="label-upper">Voice Compare</p>
        <div className="w-8" />
      </header>

      <section className="px-5 pt-6 pb-4">
        <p className="label-tag mb-2">Lab</p>
        <h1 className="text-foreground text-[24px] tracking-tight font-medium">
          OpenAI TTS 음색 비교
        </h1>
        <p className="text-foreground-dim text-[13px] mt-2 leading-relaxed">
          11개 음색 × 3개 샘플 (시작 안내 · 카운트 · 회향).
          <br />
          마음에 드는 음색을 들은 뒤 <strong>이 음색으로 결정</strong>을 누르세요.
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

      <section className="px-5 pb-24 space-y-3">
        {!manifest && (
          <p className="text-foreground-dim text-sm py-12 text-center">
            샘플 로드 중...
          </p>
        )}
        {manifest?.voices.map(({ model, voice, samples }) => {
          const note = VOICE_NOTES[voice] || { label: voice, gender: '-', tone: '-' }
          const id = `${model}::${voice}`
          const isPicked = picked === id
          return (
            <div
              key={id}
              className={`rounded-2xl border p-4 transition-colors ${
                isPicked
                  ? 'border-accent bg-[var(--accent-glow)]'
                  : 'border-[var(--surface-border)] bg-[var(--surface)]'
              }`}
            >
              <div className="flex items-baseline justify-between gap-2 mb-3">
                <div>
                  <p className="text-foreground text-[18px] tracking-tight font-medium">
                    {note.label}
                    {isPicked && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-accent uppercase tracking-[0.18em]">
                        <Check size={11} /> picked
                      </span>
                    )}
                  </p>
                  <p className="label-tag mt-0.5">
                    {note.gender} · {note.tone}
                  </p>
                </div>
                <p className="label-upper text-[9px] text-foreground-dim/70">
                  {model.replace('gpt-4o-mini-tts', '4o-mini').replace('tts-1-hd', 'hd')}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {samples.map(sId => {
                  const key = `${id}::${sId}`
                  const src = `/voice-samples/${model}__${voice}__${sId}.mp3`
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
                onClick={() => pick(model, voice)}
                disabled={isPicked}
                className={`w-full py-2.5 rounded-lg text-[12px] uppercase tracking-[0.18em] transition-colors ${
                  isPicked
                    ? 'bg-accent text-background cursor-default'
                    : 'border border-[var(--surface-border)] text-foreground-dim hover:text-foreground hover:border-foreground/40'
                }`}
              >
                {isPicked ? 'Selected' : '이 음색으로 결정'}
              </button>
            </div>
          )
        })}
      </section>

      {picked && (
        <div className="fixed bottom-20 left-0 right-0 px-5 z-40">
          <div className="max-w-lg mx-auto bg-background/95 backdrop-blur border border-accent rounded-xl px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
            <p className="text-[12px] text-foreground">
              선택됨: <strong className="text-accent">{picked.split('::')[1]}</strong>
            </p>
            <button
              onClick={() => {
                localStorage.removeItem(STORAGE_KEY)
                setPicked(null)
              }}
              className="text-[11px] text-foreground-dim hover:text-foreground uppercase tracking-[0.18em]"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
