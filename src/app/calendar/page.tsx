'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { StreakCalendar } from '@/components/streak-calendar'
import { MoodBackdrop } from '@/components/mood-backdrop'

export default function CalendarPage() {
  return (
    <div className="min-h-[calc(100dvh-5rem)] flex flex-col">
      <MoodBackdrop mood="warm-dusk" />

      <header className="flex items-center justify-between px-5 pt-5 pb-4">
        <Link
          href="/"
          aria-label="뒤로"
          className="p-2 -ml-2 text-foreground-dim hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </Link>
        <p className="label-upper">Records</p>
        <div className="w-8" />
      </header>

      <section className="px-5 pb-6 animate-in">
        <h1 className="text-foreground text-[28px] tracking-tight font-medium">
          수행 기록
        </h1>
        <p className="label-tag mt-1">꾸준한 수행의 발자취</p>
      </section>

      <section className="px-5 pb-12 animate-in stagger-1">
        <StreakCalendar />
      </section>
    </div>
  )
}
