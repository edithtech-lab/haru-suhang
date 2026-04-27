'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Counter108 } from '@/components/counter-108'
import { getSoundGenerator } from '@/components/audio-player'
import { useAuth } from '@/lib/auth-context'
import { savePractice } from '@/lib/practice-store'
import { BAE_TARGET } from '@/lib/constants'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { MoodBackdrop } from '@/components/mood-backdrop'

export default function Bae108Page() {
  const { user } = useAuth()
  const [count, setCount] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [saved, setSaved] = useState(false)
  const startTimeRef = useRef(0)

  const handleCount = useCallback(() => {
    if (completed) return

    if (count === 0) startTimeRef.current = Date.now()
    const newCount = count + 1
    setCount(newCount)
    getSoundGenerator().playMoktak()

    if (newCount >= BAE_TARGET) {
      setCompleted(true)
      setTimeout(() => {
        getSoundGenerator().playBell(1)
      }, 300)

      const durationSec = Math.floor((Date.now() - startTimeRef.current) / 1000)
      savePractice(user?.id ?? null, 'bae108', durationSec, BAE_TARGET, true)
        .then(() => setSaved(true))
    }
  }, [count, completed, user])

  const handleReset = () => {
    setCount(0)
    setCompleted(false)
    setSaved(false)
  }

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
        {count > 0 && !completed ? (
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

      {/* 페이지 타이틀 */}
      <section className="px-5 pb-2 animate-in">
        <h1 className="text-foreground text-[26px] tracking-tight font-medium">
          108배
        </h1>
        <p className="label-tag mt-1">한 절 한 절, 마음을 내려놓으세요</p>
      </section>

      {/* 카운터 */}
      <section className="flex-1 flex items-center justify-center px-5 animate-in stagger-1">
        <Counter108 count={count} onCount={handleCount} completed={completed} />
      </section>

      {/* 완료 액션 */}
      {completed && (
        <section className="px-5 pb-8 animate-in">
          <div className="surface-paper rounded-2xl p-5 space-y-3 text-center">
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
    </div>
  )
}
