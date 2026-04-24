'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LogIn, LogOut, Check } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getTodayStatus, getPracticeStats } from '@/lib/practice-store'
import { DAILY_WISDOMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { AmbientBackdrop } from '@/components/ambient-orb'
import type { DailyStatus, PracticeStats } from '@/types'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

const PRACTICES = [
  { href: '/bae108', label: '108배', key: 'bae108' as const },
  { href: '/meditation', label: '명상', key: 'meditation' as const },
  { href: '/yeomju', label: '염불', key: 'yeobul' as const },
]

export default function HomePage() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const [status, setStatus] = useState<DailyStatus>({ bae108: false, meditation: false, yeobul: false })
  const [stats, setStats] = useState<PracticeStats>({ streak: 0, totalDays: 0, totalBae108: 0, totalMeditation: 0, totalYeobul: 0 })

  const todayWisdom = DAILY_WISDOMS[new Date().getDate() % DAILY_WISDOMS.length]
  const now = new Date()
  const dayName = WEEKDAYS[now.getDay()]
  const dateStr = `${now.getMonth() + 1}월 ${now.getDate()}일 · ${dayName}요일`

  useEffect(() => {
    if (!loading) {
      const userId = user?.id ?? null
      getTodayStatus(userId).then(setStatus)
      getPracticeStats(userId).then(setStats)
    }
  }, [user, loading])

  const completedCount = [status.bae108, status.meditation, status.yeobul].filter(Boolean).length
  const allDone = completedCount === 3
  const progressPercent = (completedCount / 3) * 100

  // 진행 링용 SVG 수치
  const ringRadius = 38
  const ringCircumference = 2 * Math.PI * ringRadius
  const ringOffset = ringCircumference * (1 - progressPercent / 100)

  return (
    <>
      <AmbientBackdrop preset="home" />

      <div className="px-6 pt-10 pb-6">
        {/* ===== 헤더 — 날짜 + 로그인 ===== */}
        <header className="animate-in flex items-center justify-between mb-8">
          <div>
            <p className="text-[11px] text-muted font-medium uppercase tracking-[0.22em]">
              {dateStr}
            </p>
            <h1 className="font-serif text-2xl text-foreground mt-1 tracking-tight">
              하루수행
            </h1>
          </div>

          {!loading && (
            user ? (
              <button
                onClick={signOut}
                aria-label="로그아웃"
                className="text-muted hover:text-foreground-dim transition-colors p-2"
              >
                <LogOut size={16} />
              </button>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="text-[11px] text-accent hover:text-accent-light transition-colors flex items-center gap-1.5 tracking-wider border border-[var(--accent-glow)] rounded-full px-3 py-1.5"
              >
                <LogIn size={11} />
                <span className="uppercase">Sign in</span>
              </button>
            )
          )}
        </header>

        {/* ===== 오늘 대시보드 카드 ===== */}
        <section className="animate-in stagger-1 mb-6">
          <div className="surface-paper rounded-3xl p-6 relative overflow-hidden">
            {/* 왼쪽 글로우 */}
            <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full blur-3xl opacity-60"
              style={{ backgroundImage: 'var(--gradient-orb-amber)' }}
            />

            <div className="relative flex items-center justify-between">
              {/* 좌: 스트릭 */}
              <div>
                <p className="text-[10px] text-muted uppercase tracking-[0.25em] mb-2">
                  Streak
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className={cn(
                    'font-serif text-5xl leading-none tracking-tight',
                    stats.streak > 0 ? 'text-accent-light' : 'text-muted-deep'
                  )}>
                    {stats.streak}
                  </span>
                  <span className="text-muted text-xs tracking-wider">일</span>
                </div>
                <p className="text-xs text-muted mt-3">
                  {allDone ? '오늘 모두 완료' : `오늘 ${3 - completedCount}개 남음`}
                </p>
              </div>

              {/* 우: 오늘 진행 링 */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg width="96" height="96" viewBox="0 0 96 96" className="absolute inset-0 -rotate-90">
                  <circle
                    cx="48" cy="48" r={ringRadius}
                    fill="none"
                    stroke="var(--surface-border)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="48" cy="48" r={ringRadius}
                    fill="none"
                    stroke={allDone ? 'var(--success)' : 'var(--accent)'}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="text-center">
                  <p className="font-serif text-2xl leading-none">
                    <span className={allDone ? 'text-success' : 'text-foreground'}>{completedCount}</span>
                    <span className="text-muted-deep text-sm">/3</span>
                  </p>
                  <p className="text-[9px] text-muted uppercase tracking-[0.2em] mt-1">Today</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 오늘의 수행 3개 카드 그리드 ===== */}
        <section className="animate-in stagger-2 mb-6">
          <div className="grid grid-cols-3 gap-2">
            {PRACTICES.map(({ href, label, key }) => {
              const done = status[key]
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'group relative rounded-2xl border transition-all active:scale-[0.98] overflow-hidden',
                    'aspect-[3/4] flex flex-col justify-between p-4',
                    done
                      ? 'border-[rgba(143,184,141,0.25)] bg-[rgba(143,184,141,0.04)]'
                      : 'border-[var(--surface-border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] hover:border-[var(--accent-glow)]',
                  )}
                >
                  {/* 완료 체크 */}
                  {done && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                      <Check size={12} className="text-success" strokeWidth={2.5} />
                    </div>
                  )}

                  {/* 장식 오브 */}
                  {!done && (
                    <div className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full blur-2xl opacity-40"
                      style={{ backgroundImage: 'var(--gradient-orb-amber)' }}
                    />
                  )}

                  <div className="relative">
                    <p className={cn(
                      'font-serif text-xl leading-tight tracking-tight',
                      done ? 'text-success' : 'text-foreground group-hover:text-accent-light transition-colors'
                    )}>
                      {label}
                    </p>
                  </div>

                  <p className={cn(
                    'relative text-[10px] uppercase tracking-[0.22em]',
                    done ? 'text-success/70' : 'text-muted-deep group-hover:text-accent transition-colors'
                  )}>
                    {done ? 'Done' : 'Begin →'}
                  </p>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ===== 오늘의 법어 (축소) ===== */}
        <section className="animate-in stagger-3 mb-6">
          <div className="surface-subtle rounded-2xl px-5 py-4 relative">
            <span
              aria-hidden
              className="font-serif absolute top-1 left-3 text-3xl text-accent/25 leading-none select-none"
            >
              &ldquo;
            </span>
            <blockquote className="font-serif text-[15px] leading-[1.55] text-foreground/90 pl-4">
              {todayWisdom.text}
            </blockquote>
            <figcaption className="mt-2 pl-4 text-[10px] text-accent uppercase tracking-[0.25em]">
              — {todayWisdom.source}
            </figcaption>
          </div>
        </section>

        {/* ===== 바로가기 (컴팩트) ===== */}
        <section className="animate-in stagger-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { href: '/sutra', label: '경전' },
              { href: '/doban', label: '도반' },
              { href: '/calendar', label: '기록' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="group py-3.5 text-center rounded-xl border border-[var(--surface-border)] hover:border-[var(--accent-glow)] hover:bg-[var(--surface-hover)] transition-all active:scale-[0.97]"
              >
                <span className="font-serif text-sm text-foreground-dim group-hover:text-accent-light transition-colors">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
