'use client'

import { useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MeditationTimer } from '@/components/meditation-timer'
import { useAuth } from '@/lib/auth-context'
import { savePractice } from '@/lib/practice-store'
import { MoodBackdrop } from '@/components/mood-backdrop'

export default function MeditationPage() {
  const { user } = useAuth()

  const handleComplete = useCallback((durationSec: number) => {
    savePractice(user?.id ?? null, 'meditation', durationSec, 1, true)
  }, [user])

  return (
    <div className="min-h-[calc(100dvh-5rem)] flex flex-col">
      <MoodBackdrop mood="indigo" />

      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 pt-5 pb-2">
        <Link
          href="/"
          aria-label="뒤로"
          className="p-2 -ml-2 text-foreground-dim hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </Link>
        <p className="label-upper">Meditation</p>
        <div className="w-8" />
      </header>

      {/* 타이틀 */}
      <section className="px-5 pb-2 animate-in">
        <h1 className="text-foreground text-[26px] tracking-tight font-medium">
          명상
        </h1>
        <p className="label-tag mt-1">고요 속에서 마음을 보살피세요</p>
      </section>

      {/* 타이머 */}
      <section className="flex-1 flex items-center justify-center px-5 py-8 animate-in stagger-1">
        <MeditationTimer onComplete={handleComplete} />
      </section>
    </div>
  )
}
