'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MoodBackdrop } from '@/components/mood-backdrop'

type JournalEntry = {
  id: string
  entry: string
  reply: string
  emotion: string | null
  createdAt: string
}

const EMOTIONS = [
  { id: 'calm', label: '평온', color: 'peaceful' },
  { id: 'joy', label: '기쁨', color: 'warm' },
  { id: 'grateful', label: '감사', color: 'cream' },
  { id: 'anxious', label: '불안', color: 'peaceful' },
  { id: 'angry', label: '분노', color: 'warm' },
  { id: 'sad', label: '슬픔', color: 'peaceful' },
  { id: 'tired', label: '지침', color: 'cream' },
  { id: 'confused', label: '혼란', color: 'warm' },
] as const

const STORAGE_KEY = 'haru-journal-entries'

function loadEntries(): JournalEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveEntries(entries: JournalEntry[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 50)))
  } catch {
    // 저장 실패 무시
  }
}

export default function JournalPage() {
  const [entry, setEntry] = useState('')
  const [emotion, setEmotion] = useState<string | null>(null)
  const [streaming, setStreaming] = useState(false)
  const [reply, setReply] = useState('')
  const [history, setHistory] = useState<JournalEntry[]>([])
  const [view, setView] = useState<'write' | 'history'>('write')
  const replyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHistory(loadEntries())
  }, [])

  useEffect(() => {
    if (reply && replyRef.current) {
      replyRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [reply])

  async function submit() {
    const text = entry.trim()
    if (!text || streaming) return

    const emotionLabel = emotion ? (EMOTIONS.find(e => e.id === emotion)?.label ?? null) : null
    const fullEntry = emotionLabel ? `[감정: ${emotionLabel}]\n${text}` : text

    setStreaming(true)
    setReply('')

    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry: fullEntry }),
      })

      if (!res.ok) throw new Error('API error')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let full = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            if (parsed.text) {
              full += parsed.text
              setReply(full)
            }
          } catch {
            // 무시
          }
        }
      }

      // 기록 저장 (로컬)
      const newEntry: JournalEntry = {
        id: crypto.randomUUID(),
        entry: text,
        reply: full,
        emotion: emotionLabel,
        createdAt: new Date().toISOString(),
      }
      const updated = [newEntry, ...history]
      setHistory(updated)
      saveEntries(updated)
    } catch {
      setReply('죄송합니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setStreaming(false)
    }
  }

  function reset() {
    setEntry('')
    setEmotion(null)
    setReply('')
  }

  function deleteEntry(id: string) {
    if (!confirm('이 기록을 삭제하시겠습니까?')) return
    const updated = history.filter(h => h.id !== id)
    setHistory(updated)
    saveEntries(updated)
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}월 ${d.getDate()}일 · ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-[calc(100dvh-5rem)] flex flex-col pb-8">
      <MoodBackdrop mood="violet" />
      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 pt-5 pb-6">
        <Link
          href="/"
          aria-label="뒤로"
          className="p-2 -ml-2 text-foreground-dim hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </Link>
        <p className="label-upper">Journal</p>
        <div className="w-8" />
      </header>

      {/* 탭 */}
      <div className="px-5 mb-6 flex items-center gap-6">
        <button
          onClick={() => setView('write')}
          className={cn(
            'text-[22px] tracking-tight transition-colors',
            view === 'write' ? 'text-foreground' : 'text-muted-deep hover:text-foreground-dim',
          )}
        >
          마음기록
        </button>
        <button
          onClick={() => setView('history')}
          className={cn(
            'text-[22px] tracking-tight transition-colors',
            view === 'history' ? 'text-foreground' : 'text-muted-deep hover:text-foreground-dim',
          )}
        >
          지난 기록
          {history.length > 0 && (
            <span className="ml-1.5 text-[11px] text-accent align-top">{history.length}</span>
          )}
        </button>
      </div>

      {view === 'write' ? (
        <>
          {/* 입력 영역 */}
          <section className="animate-in px-5 mb-6">
            <p className="label-tag mb-3">오늘 어떤 마음이 드셨나요?</p>

            {/* 감정 태그 */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {EMOTIONS.map(e => (
                <button
                  key={e.id}
                  onClick={() => setEmotion(emotion === e.id ? null : e.id)}
                  className={cn(
                    'px-3 py-1.5 text-[12px] rounded-full transition-all active:scale-95',
                    emotion === e.id
                      ? 'bg-accent text-background'
                      : 'border border-[var(--surface-border)] text-foreground-dim hover:border-foreground/40 hover:text-foreground',
                  )}
                >
                  {e.label}
                </button>
              ))}
            </div>

            <textarea
              value={entry}
              onChange={e => setEntry(e.target.value)}
              placeholder="있는 그대로 적어 보세요. 판단 없이 들어드릴게요."
              disabled={streaming}
              rows={8}
              className="w-full resize-none rounded-2xl px-4 py-4 text-[15px] leading-relaxed text-foreground placeholder:text-muted/50 bg-[var(--surface)] border border-[var(--surface-border)] focus:outline-none focus:border-[var(--accent-glow)] transition-colors disabled:opacity-50"
            />

            <div className="mt-3 flex items-center justify-between">
              <p className="text-[11px] text-muted">
                {entry.length} / 2000
              </p>
              <button
                onClick={submit}
                disabled={!entry.trim() || streaming || entry.length > 2000}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-background text-sm rounded-full disabled:opacity-30 active:scale-95 transition-all"
              >
                <Send size={14} />
                {streaming ? '듣는 중...' : '들려드릴게요'}
              </button>
            </div>
          </section>

          {/* AI 응답 */}
          {(streaming || reply) && (
            <section
              ref={replyRef}
              className="animate-in px-5 mb-8"
            >
              <div className="relative rounded-2xl p-5 overflow-hidden surface-paper">
                <div
                  className="absolute -top-10 -left-10 w-32 h-32 rounded-full orb-pulse"
                  style={{
                    background: 'var(--orb-peaceful)',
                    opacity: 0.4,
                    filter: 'blur(24px)',
                  }}
                />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <p className="label-upper">법현 스님</p>
                  </div>
                  {streaming && !reply ? (
                    <p className="text-foreground-dim text-[14px]">
                      <span className="chat-typing-dot" />
                      <span className="chat-typing-dot" style={{ animationDelay: '0.2s', marginLeft: 4 }} />
                      <span className="chat-typing-dot" style={{ animationDelay: '0.4s', marginLeft: 4 }} />
                    </p>
                  ) : (
                    <p className="text-[15px] leading-relaxed text-foreground whitespace-pre-line">
                      {reply}
                    </p>
                  )}
                  {reply && !streaming && (
                    <button
                      onClick={reset}
                      className="mt-4 text-[12px] text-foreground-dim hover:text-accent transition-colors"
                    >
                      새로 쓰기 →
                    </button>
                  )}
                </div>
              </div>
            </section>
          )}
        </>
      ) : (
        <>
          {/* 지난 기록 */}
          <section className="animate-in px-5">
            {history.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-foreground-dim text-[14px]">아직 기록이 없습니다.</p>
                <button
                  onClick={() => setView('write')}
                  className="mt-4 text-accent text-sm hover:text-accent-light transition-colors"
                >
                  첫 기록 쓰기 →
                </button>
              </div>
            ) : (
              <ul className="space-y-3">
                {history.map(h => (
                  <li key={h.id} className="surface-subtle rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {h.emotion && (
                          <span className="label-tag text-accent">{h.emotion}</span>
                        )}
                        <span className="label-tag">{formatDate(h.createdAt)}</span>
                      </div>
                      <button
                        onClick={() => deleteEntry(h.id)}
                        aria-label="삭제"
                        className="text-muted-deep hover:text-danger transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p className="text-[14px] leading-relaxed text-foreground-dim mb-3 whitespace-pre-line">
                      {h.entry}
                    </p>
                    <div className="pt-3 border-t border-[var(--surface-border)]">
                      <p className="label-tag text-accent mb-2">법현 스님</p>
                      <p className="text-[14px] leading-relaxed text-foreground whitespace-pre-line">
                        {h.reply}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
